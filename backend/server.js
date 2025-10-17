const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// ============ MODELS ============

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  display_name: String,
  photo_url: String,
  joined_date: { type: Date, default: Date.now }
});

const symptomSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  user_id: { type: String, required: true },
  symptoms: [String],
  inferred_diseases: [Object],
  gemini_advice: String,
  timestamp: { type: Date, default: Date.now }
});

const mealSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  user_id: { type: String, required: true },
  food_name: { type: String, required: true },
  quantity: String,
  calories: Number,
  nutrients: Object,
  gemini_suggestions: String,
  timestamp: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  user_id: { type: String, required: true },
  file_name: String,
  file_type: String,
  file_path: String,
  analysis: String,
  gemini_summary: String,
  timestamp: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  specialization: String,
  location: String,
  experience: String,
  contact: String,
  email: String,
  photo: String,
  rating: Number
});

const User = mongoose.model('User', userSchema);
const Symptom = mongoose.model('Symptom', symptomSchema);
const Meal = mongoose.model('Meal', mealSchema);
const Report = mongoose.model('Report', reportSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

// ============ HELPER FUNCTIONS ============

async function getGeminiAdvice(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Unable to generate advice at this time. Please consult a healthcare professional.';
  }
}

async function analyzeWithInfermedica(symptoms, age, sex) {
  try {
    const headers = {
      'App-Id': process.env.INFERMEDICA_APP_ID,
      'App-Key': process.env.INFERMEDICA_API_KEY,
      'Content-Type': 'application/json'
    };

    const evidence = symptoms.map(s => ({
      id: s.toLowerCase().replace(/ /g, '_'),
      choice_id: 'present'
    }));

    const payload = {
      sex,
      age: { value: age },
      evidence
    };

    const response = await axios.post(
      'https://api.infermedica.com/v3/diagnosis',
      payload,
      { headers, timeout: 10000 }
    );

    return response.data;
  } catch (error) {
    console.error('Infermedica API error:', error.message);
    return { conditions: [] };
  }
}

// ============ ROUTES ============

// Root route
app.get('/api', (req, res) => {
  res.json({ message: 'HealthNest API' });
});

// ===== USER ROUTES =====

app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, display_name, photo_url } = req.body;

    let user = await User.findOne({ uid });
    if (user) {
      user.display_name = display_name || user.display_name;
      user.photo_url = photo_url || user.photo_url;
      await user.save();
    } else {
      user = new User({ uid, email, display_name, photo_url });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== SYMPTOM CHECKER ROUTES =====

app.post('/api/symptoms/analyze', async (req, res) => {
  try {
    const { user_id, symptoms, age, sex } = req.body;

    // Get Infermedica diagnosis
    const infermedicaResult = await analyzeWithInfermedica(symptoms, age || 30, sex || 'male');
    const conditions = infermedicaResult.conditions || [];

    // Prepare Gemini prompt
    const symptomsText = symptoms.join(', ');
    const conditionsText = conditions.slice(0, 3).map(c => c.common_name || c.name).join(', ');

    const geminiPrompt = `Based on these symptoms: ${symptomsText}\nPossible conditions: ${conditionsText}\n\nProvide:\n1. Brief explanation of possible causes\n2. Diet recommendations\n3. Exercise suggestions\n4. Things to avoid\n5. When to see a doctor\n\nKeep it concise and friendly.`;

    const geminiAdvice = await getGeminiAdvice(geminiPrompt);

    // Save to database
    const symptomRecord = new Symptom({
      user_id,
      symptoms,
      inferred_diseases: conditions.slice(0, 5),
      gemini_advice: geminiAdvice
    });
    await symptomRecord.save();

    res.json({
      conditions: conditions.slice(0, 5),
      advice: geminiAdvice
    });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/symptoms/history/:user_id', async (req, res) => {
  try {
    const records = await Symptom.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(records);
  } catch (error) {
    console.error('Error fetching symptom history:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== MEAL ROUTES =====

app.post('/api/meals/analyze', async (req, res) => {
  try {
    const { user_id, food_name, quantity } = req.body;

    const geminiPrompt = `Analyze this food item: ${food_name} (${quantity})\n\nProvide:\n1. Estimated calories\n2. Key nutrients (protein, carbs, fats)\n3. Health benefits\n4. Healthier alternatives if applicable\n5. Portion recommendations\n\nFormat as JSON with keys: calories, nutrients, benefits, alternatives, recommendations`;

    const geminiResponse = await getGeminiAdvice(geminiPrompt);

    const mealRecord = new Meal({
      user_id,
      food_name,
      quantity: quantity || '1 serving',
      gemini_suggestions: geminiResponse
    });
    await mealRecord.save();

    res.json({
      analysis: geminiResponse,
      record_id: mealRecord.id
    });
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meals/history/:user_id', async (req, res) => {
  try {
    const records = await Meal.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(records);
  } catch (error) {
    console.error('Error fetching meal history:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/meals/:meal_id', async (req, res) => {
  try {
    const { user_id } = req.query;
    const result = await Meal.deleteOne({ id: req.params.meal_id, user_id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Meal record not found' });
    }
    
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== MEDICAL REPORT ROUTES =====

app.post('/api/reports/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { user_id } = req.body;

    // For now, use Gemini for basic analysis
    // You can integrate your ML model here
    const geminiPrompt = `Analyze this medical document/image.\nProvide:\n1. Type of document/scan\n2. Key findings visible\n3. Areas of concern (if any)\n4. Recommendations\n\nNote: This is AI-assisted analysis, not a medical diagnosis. Always consult healthcare professionals.`;

    const analysis = await getGeminiAdvice(geminiPrompt);

    const reportRecord = new Report({
      user_id,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_path: req.file.path,
      analysis,
      gemini_summary: analysis
    });
    await reportRecord.save();

    res.json({
      analysis,
      record_id: reportRecord.id
    });
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/history/:user_id', async (req, res) => {
  try {
    const records = await Report.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('-file_path'); // Don't send file path to frontend
    res.json(records);
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DOCTOR ROUTES =====

app.get('/api/doctors', async (req, res) => {
  try {
    const { specialization, location, name } = req.query;
    const query = {};

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const doctors = await Doctor.find(query).limit(100);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/doctors/:doctor_id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.params.doctor_id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== DASHBOARD ROUTE =====

app.get('/api/dashboard/:user_id', async (req, res) => {
  try {
    const symptoms = await Symptom.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(5);

    const meals = await Meal.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(5);

    const reports = await Report.find({ user_id: req.params.user_id })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('-file_path');

    res.json({
      symptoms,
      meals,
      reports
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ INITIALIZATION ============

async function initializeDatabase() {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const sampleDoctors = [
        {
          id: uuidv4(),
          name: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          location: 'New York, NY',
          experience: '15 years',
          contact: '+1-555-0101',
          email: 'sarah.johnson@healthnest.com',
          photo: 'https://i.pravatar.cc/150?img=1',
          rating: 4.8
        },
        {
          id: uuidv4(),
          name: 'Dr. Michael Chen',
          specialization: 'Neurology',
          location: 'Los Angeles, CA',
          experience: '12 years',
          contact: '+1-555-0102',
          email: 'michael.chen@healthnest.com',
          photo: 'https://i.pravatar.cc/150?img=2',
          rating: 4.9
        },
        {
          id: uuidv4(),
          name: 'Dr. Emily Rodriguez',
          specialization: 'Pediatrics',
          location: 'Chicago, IL',
          experience: '10 years',
          contact: '+1-555-0103',
          email: 'emily.rodriguez@healthnest.com',
          photo: 'https://i.pravatar.cc/150?img=3',
          rating: 4.7
        },
        {
          id: uuidv4(),
          name: 'Dr. James Wilson',
          specialization: 'Orthopedics',
          location: 'Houston, TX',
          experience: '18 years',
          contact: '+1-555-0104',
          email: 'james.wilson@healthnest.com',
          photo: 'https://i.pravatar.cc/150?img=4',
          rating: 4.6
        },
        {
          id: uuidv4(),
          name: 'Dr. Lisa Anderson',
          specialization: 'Dermatology',
          location: 'Miami, FL',
          experience: '14 years',
          contact: '+1-555-0105',
          email: 'lisa.anderson@healthnest.com',
          photo: 'https://i.pravatar.cc/150?img=5',
          rating: 4.9
        }
      ];

      await Doctor.insertMany(sampleDoctors);
      console.log('Sample doctors added to database');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HealthNest Backend server running on port ${PORT}`);
  initializeDatabase();
});