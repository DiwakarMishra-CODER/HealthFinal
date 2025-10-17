from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from PIL import Image
import io
import logging

load_dotenv()

app = FastAPI(title="HealthNest ML Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "HealthNest ML Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/ml/analyze-image")
async def analyze_medical_image(file: UploadFile = File(...)):
    """
    Analyze medical images using ML model.
    This is a placeholder for your pre-trained ML model.
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Validate it's an image
        try:
            image = Image.open(io.BytesIO(contents))
            width, height = image.size
            format_type = image.format
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # TODO: Replace this with your actual ML model prediction
        # For now, return a placeholder analysis
        analysis = {
            "document_type": "Medical Scan",
            "image_info": {
                "width": width,
                "height": height,
                "format": format_type
            },
            "findings": [
                "Image successfully received and processed",
                "Awaiting ML model integration for detailed analysis"
            ],
            "confidence": 0.0,
            "recommendations": [
                "Please integrate your pre-trained ML model for accurate analysis",
                "Consult with healthcare professionals for medical interpretation"
            ]
        }
        
        logger.info(f"Analyzed image: {file.filename}, size: {width}x{height}")
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/analyze-report")
async def analyze_medical_report(file: UploadFile = File(...)):
    """
    Analyze medical reports (PDF/documents) using ML model.
    This is a placeholder for your pre-trained ML model.
    """
    try:
        contents = await file.read()
        file_size = len(contents)
        
        # TODO: Replace this with your actual ML model prediction
        analysis = {
            "document_type": "Medical Report",
            "file_info": {
                "filename": file.filename,
                "size_bytes": file_size,
                "content_type": file.content_type
            },
            "findings": [
                "Document successfully received",
                "Awaiting ML model integration for detailed analysis"
            ],
            "key_metrics": {},
            "recommendations": [
                "Please integrate your pre-trained ML model for accurate analysis",
                "Consult with healthcare professionals for medical interpretation"
            ]
        }
        
        logger.info(f"Analyzed report: {file.filename}, size: {file_size} bytes")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)