from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# API Keys
GEMINI_API_KEY = os.environ['GEMINI_API_KEY']
INFERMEDICA_APP_ID = os.environ['INFERMEDICA_APP_ID']
INFERMEDICA_API_KEY = os.environ['INFERMEDICA_API_KEY']

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    joined_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SymptomRequest(BaseModel):
    user_id: str
    symptoms: List[str]
    age: int
    sex: str  # "male" or "female"

class SymptomRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symptoms: List[str]
    inferred_diseases: List[dict]
    gemini_advice: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MealRequest(BaseModel):
    user_id: str
    food_name: str
    quantity: Optional[str] = "1 serving"

class MealRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    food_name: str
    quantity: str
    calories: Optional[int] = None
    nutrients: Optional[dict] = None
    gemini_suggestions: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_name: str
    file_type: str
    analysis: Optional[str] = None
    gemini_summary: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DoctorFilter(BaseModel):
    specialization: Optional[str] = None
    location: Optional[str] = None
    name: Optional[str] = None

# ============ HELPER FUNCTIONS ============

async def get_gemini_advice(prompt: str) -> str:
    """Get health advice from Gemini 2.5 Pro"""
    try:
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a helpful healthcare advisor. Provide clear, concise health advice. Always remind users to consult healthcare professionals for serious concerns."
        ).with_model("gemini", "gemini-2.5-pro")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return "Unable to generate advice at this time. Please consult a healthcare professional."

async def analyze_with_infermedica(symptoms: List[str], age: int, sex: str) -> dict:
    """Analyze symptoms using Infermedica API"""
    try:
        headers = {
            "App-Id": INFERMEDICA_APP_ID,
            "App-Key": INFERMEDICA_API_KEY,
            "Content-Type": "application/json"
        }
        
        # Convert symptom names to Infermedica format
        evidence = [{"id": s.lower().replace(" ", "_"), "choice_id": "present"} for s in symptoms]
        
        payload = {
            "sex": sex,
            "age": {"value": age},
            "evidence": evidence
        }
        
        response = requests.post(
            "https://api.infermedica.com/v3/diagnosis",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Infermedica API error: {response.status_code}")
            return {"conditions": []}
    except Exception as e:
        logger.error(f"Infermedica error: {str(e)}")
        return {"conditions": []}

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "HealthNest API"}

# ===== AUTH/USER ROUTES =====

@api_router.post("/users", response_model=User)
async def create_or_update_user(user: User):
    """Create or update user from Firebase"""
    user_dict = user.model_dump()
    user_dict['joined_date'] = user_dict['joined_date'].isoformat()
    
    # Upsert user
    await db.users.update_one(
        {"uid": user.uid},
        {"$set": user_dict},
        upsert=True
    )
    return user

@api_router.get("/users/{uid}", response_model=User)
async def get_user(uid: str):
    """Get user by UID"""
    user = await db.users.find_one({"uid": uid}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['joined_date'], str):
        user['joined_date'] = datetime.fromisoformat(user['joined_date'])
    
    return user

# ===== SYMPTOM CHECKER ROUTES =====

@api_router.post("/symptoms/analyze")
async def analyze_symptoms(request: SymptomRequest):
    """Analyze symptoms using Infermedica and get Gemini advice"""
    try:
        # Get Infermedica diagnosis
        infermedica_result = await analyze_with_infermedica(
            request.symptoms,
            request.age,
            request.sex
        )
        
        conditions = infermedica_result.get("conditions", [])
        
        # Prepare Gemini prompt
        symptoms_text = ", ".join(request.symptoms)
        conditions_text = ", ".join([c.get("common_name", c.get("name", "")) for c in conditions[:3]])
        
        gemini_prompt = f"""Based on these symptoms: {symptoms_text}
Possible conditions: {conditions_text}

Provide:
1. Brief explanation of possible causes
2. Diet recommendations
3. Exercise suggestions
4. Things to avoid
5. When to see a doctor

Keep it concise and friendly."""
        
        gemini_advice = await get_gemini_advice(gemini_prompt)
        
        # Save to database
        record = SymptomRecord(
            user_id=request.user_id,
            symptoms=request.symptoms,
            inferred_diseases=conditions[:5],
            gemini_advice=gemini_advice
        )
        
        record_dict = record.model_dump()
        record_dict['timestamp'] = record_dict['timestamp'].isoformat()
        await db.symptoms.insert_one(record_dict)
        
        return {
            "conditions": conditions[:5],
            "advice": gemini_advice
        }
    except Exception as e:
        logger.error(f"Symptom analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/symptoms/history/{user_id}")
async def get_symptom_history(user_id: str):
    """Get user's symptom check history"""
    records = await db.symptoms.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    for record in records:
        if isinstance(record['timestamp'], str):
            record['timestamp'] = datetime.fromisoformat(record['timestamp'])
    
    return records

# ===== MEAL ANALYZER ROUTES =====

@api_router.post("/meals/analyze")
async def analyze_meal(request: MealRequest):
    """Analyze meal and get nutritional info with Gemini"""
    try:
        gemini_prompt = f"""Analyze this food item: {request.food_name} ({request.quantity})

Provide:
1. Estimated calories
2. Key nutrients (protein, carbs, fats)
3. Health benefits
4. Healthier alternatives if applicable
5. Portion recommendations

Format as JSON with keys: calories, nutrients, benefits, alternatives, recommendations"""
        
        gemini_response = await get_gemini_advice(gemini_prompt)
        
        # Save to database
        record = MealRecord(
            user_id=request.user_id,
            food_name=request.food_name,
            quantity=request.quantity,
            gemini_suggestions=gemini_response
        )
        
        record_dict = record.model_dump()
        record_dict['timestamp'] = record_dict['timestamp'].isoformat()
        await db.meals.insert_one(record_dict)
        
        return {
            "analysis": gemini_response,
            "record_id": record.id
        }
    except Exception as e:
        logger.error(f"Meal analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/meals/history/{user_id}")
async def get_meal_history(user_id: str):
    """Get user's meal history"""
    records = await db.meals.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    for record in records:
        if isinstance(record['timestamp'], str):
            record['timestamp'] = datetime.fromisoformat(record['timestamp'])
    
    return records

@api_router.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str, user_id: str):
    """Delete a meal record"""
    result = await db.meals.delete_one({"id": meal_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal record not found")
    return {"message": "Meal deleted successfully"}

# ===== MEDICAL REPORT ROUTES =====

@api_router.post("/reports/analyze")
async def analyze_report(file: UploadFile = File(...), user_id: str = ""):
    """Analyze medical report/image"""
    try:
        contents = await file.read()
        
        # For now, use Gemini for basic image analysis
        # You can integrate your pre-trained ML model here
        gemini_prompt = f"""Analyze this medical document/image.
Provide:
1. Type of document/scan
2. Key findings visible
3. Areas of concern (if any)
4. Recommendations

Note: This is AI-assisted analysis, not a medical diagnosis. Always consult healthcare professionals."""
        
        analysis = await get_gemini_advice(gemini_prompt)
        
        # Save to database
        record = ReportRecord(
            user_id=user_id,
            file_name=file.filename,
            file_type=file.content_type,
            analysis=analysis,
            gemini_summary=analysis
        )
        
        record_dict = record.model_dump()
        record_dict['timestamp'] = record_dict['timestamp'].isoformat()
        await db.reports.insert_one(record_dict)
        
        return {
            "analysis": analysis,
            "record_id": record.id
        }
    except Exception as e:
        logger.error(f"Report analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reports/history/{user_id}")
async def get_report_history(user_id: str):
    """Get user's report history"""
    records = await db.reports.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    for record in records:
        if isinstance(record['timestamp'], str):
            record['timestamp'] = datetime.fromisoformat(record['timestamp'])
    
    return records

# ===== DOCTOR FINDER ROUTES =====

@api_router.get("/doctors")
async def get_doctors(specialization: Optional[str] = None, location: Optional[str] = None, name: Optional[str] = None):
    """Get list of doctors with optional filters"""
    query = {}
    if specialization:
        query["specialization"] = {"$regex": specialization, "$options": "i"}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    
    doctors = await db.doctors.find(query, {"_id": 0}).to_list(100)
    return doctors

@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    """Get doctor by ID"""
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

# ===== DASHBOARD ROUTES =====

@api_router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: str):
    """Get user dashboard data"""
    try:
        # Get recent records
        symptoms = await db.symptoms.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(5).to_list(5)
        
        meals = await db.meals.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(5).to_list(5)
        
        reports = await db.reports.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(5).to_list(5)
        
        # Convert timestamps
        for record in symptoms + meals + reports:
            if isinstance(record.get('timestamp'), str):
                record['timestamp'] = datetime.fromisoformat(record['timestamp'])
        
        return {
            "symptoms": symptoms,
            "meals": meals,
            "reports": reports
        }
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    """Initialize database with sample doctors"""
    # Check if doctors collection is empty
    count = await db.doctors.count_documents({})
    if count == 0:
        sample_doctors = [
            {
                "id": str(uuid.uuid4()),
                "name": "Dr. Sarah Johnson",
                "specialization": "Cardiology",
                "location": "New York, NY",
                "experience": "15 years",
                "contact": "+1-555-0101",
                "email": "sarah.johnson@healthnest.com",
                "photo": "https://i.pravatar.cc/150?img=1",
                "rating": 4.8
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Dr. Michael Chen",
                "specialization": "Neurology",
                "location": "Los Angeles, CA",
                "experience": "12 years",
                "contact": "+1-555-0102",
                "email": "michael.chen@healthnest.com",
                "photo": "https://i.pravatar.cc/150?img=2",
                "rating": 4.9
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Dr. Emily Rodriguez",
                "specialization": "Pediatrics",
                "location": "Chicago, IL",
                "experience": "10 years",
                "contact": "+1-555-0103",
                "email": "emily.rodriguez@healthnest.com",
                "photo": "https://i.pravatar.cc/150?img=3",
                "rating": 4.7
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Dr. James Wilson",
                "specialization": "Orthopedics",
                "location": "Houston, TX",
                "experience": "18 years",
                "contact": "+1-555-0104",
                "email": "james.wilson@healthnest.com",
                "photo": "https://i.pravatar.cc/150?img=4",
                "rating": 4.6
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Dr. Lisa Anderson",
                "specialization": "Dermatology",
                "location": "Miami, FL",
                "experience": "14 years",
                "contact": "+1-555-0105",
                "email": "lisa.anderson@healthnest.com",
                "photo": "https://i.pravatar.cc/150?img=5",
                "rating": 4.9
            }
        ]
        await db.doctors.insert_many(sample_doctors)
        logger.info("Sample doctors added to database")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()