# HealthNest 🏥

<div align="center">
  <h3>Your Comprehensive Health Companion</h3>
  <p>AI-powered health management platform for symptom analysis, doctor discovery, meal tracking, and medical records management</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

HealthNest is a comprehensive health management web application that combines modern AI technology with intuitive design to help users:
- Analyze symptoms and receive health insights
- Find qualified healthcare professionals
- Track meals and get nutritional advice
- Upload and analyze medical reports
- Manage their health records in one secure location

The application features a beautiful, modern UI with pastel gradients, glass-morphism effects, and smooth animations, providing users with a premium healthcare experience.

---

## ✨ Features

### 🔐 Authentication
- **Firebase Authentication** with Email/Password and Google Sign-In
- Protected routes for authenticated users
- Automatic session management
- User profile with avatar support

### 🩺 Symptom Checker
- AI-powered symptom analysis using **Infermedica API**
- Disease prediction with probability scores
- Personalized health advice from **Gemini 2.5 Pro**:
  - Diet recommendations
  - Exercise suggestions
  - Things to avoid
  - When to see a doctor
- Symptom history tracking

### 👨‍⚕️ Doctor Finder
- Searchable database of healthcare professionals
- Filter by name, specialization, and location
- Doctor profiles with ratings and experience
- Contact information and credentials
- Beautiful card-based interface

### 🍎 Meal Tracker
- Track meals with quantity details
- AI nutritional analysis using **Gemini 2.5 Pro**:
  - Calorie estimation
  - Nutrient breakdown (protein, carbs, fats)
  - Health benefits
  - Healthier alternatives
  - Portion recommendations
- Meal history with delete functionality

### 📄 Medical Records Manager
- Upload medical images (JPEG, PNG) or PDF reports
- AI-powered report analysis using **Gemini 2.5 Pro**:
  - Document type identification
  - Key findings extraction
  - Areas of concern
  - Medical recommendations
- Secure storage and history tracking
- File validation (max 10MB)

### 📊 Personal Dashboard
- Comprehensive health overview
- Statistics for symptoms, meals, and reports
- Recent activity timeline
- Quick access to all features

### 👤 Profile Management
- User information display
- Profile photo/avatar
- Account details and member since date
- Logout functionality

---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation and routing
- **Framer Motion** - Animations and transitions
- **TailwindCSS** - Styling and responsive design
- **React Icons** - Icon library
- **Axios** - HTTP client
- **Sonner** - Toast notifications
- **Firebase** - Authentication

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **emergentintegrations** - LLM integration library
- **Gemini 2.5 Pro** - AI health advice and analysis
- **Infermedica API** - Symptom analysis
- **Firebase Admin** - User management

### Database
- **MongoDB** - NoSQL database for user data, symptoms, meals, reports, and doctors

### AI & APIs
- **Gemini 2.5 Pro** - Health advice, meal analysis, medical report analysis
- **Infermedica API** - Symptom-to-disease mapping
- **Firebase Auth** - User authentication

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and yarn
- Python 3.11+
- MongoDB (local or Atlas)
- Firebase project with Authentication enabled
- API keys for Gemini and Infermedica

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/healthnest.git
   cd healthnest
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   ```

4. **Configure Environment Variables** (see [Environment Variables](#environment-variables))

5. **Start the Backend**
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

6. **Start the Frontend**
   ```bash
   cd frontend
   yarn start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

---

## 🔑 Environment Variables

### Backend (.env)
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=healthnest_db

# CORS
CORS_ORIGINS=*

# API Keys
GEMINI_API_KEY=your_gemini_api_key
INFERMEDICA_APP_ID=your_infermedica_app_id
INFERMEDICA_API_KEY=your_infermedica_api_key
```

### Frontend (.env)
```env
# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Getting API Keys

**Gemini API Key:**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key

**Infermedica API:**
- Sign up at [Infermedica Developer Portal](https://developer.infermedica.com/)
- Create an app to get App ID and API Key

**Firebase:**
- Create a project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication (Email/Password and Google)
- Get configuration from Project Settings

---

## 📚 API Documentation

### Authentication
- `POST /api/users` - Create or update user
- `GET /api/users/{uid}` - Get user by UID

### Symptom Checker
- `POST /api/symptoms/analyze` - Analyze symptoms
  ```json
  {
    "user_id": "string",
    "symptoms": ["headache", "fever"],
    "age": 30,
    "sex": "male"
  }
  ```
- `GET /api/symptoms/history/{user_id}` - Get symptom history

### Meal Tracker
- `POST /api/meals/analyze` - Analyze meal
  ```json
  {
    "user_id": "string",
    "food_name": "Grilled chicken salad",
    "quantity": "1 plate"
  }
  ```
- `GET /api/meals/history/{user_id}` - Get meal history
- `DELETE /api/meals/{meal_id}?user_id={user_id}` - Delete meal

### Medical Reports
- `POST /api/reports/analyze` - Upload and analyze report (multipart/form-data)
- `GET /api/reports/history/{user_id}` - Get report history

### Doctors
- `GET /api/doctors` - Get all doctors (supports filters: name, specialization, location)
- `GET /api/doctors/{doctor_id}` - Get doctor by ID

### Dashboard
- `GET /api/dashboard/{user_id}` - Get dashboard data

Full API documentation available at `/docs` endpoint when running the backend.

---

## 📁 Project Structure

```
healthnest/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Home.js
│   │   │   ├── SignIn.js
│   │   │   ├── SymptomChecker.js
│   │   │   ├── DoctorFinder.js
│   │   │   ├── MealTracker.js
│   │   │   ├── MedicalRecords.js
│   │   │   ├── Dashboard.js
│   │   │   └── Profile.js
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── firebase.js    # Firebase configuration
│   │   ├── App.js         # Main application component
│   │   ├── index.js       # Application entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment variables
└── README.md             # Project documentation
```

---

## 📸 Screenshots

### Homepage
Beautiful landing page with animated gradient background and glass-morphism cards.

### Symptom Checker
AI-powered symptom analysis with disease predictions and personalized health advice.

### Doctor Finder
Searchable database of healthcare professionals with detailed profiles.

### Dashboard
Personalized health overview with statistics and recent activity.

---

## 🎨 Design Features

- **Pastel Gradient Background**: Animated gradient with pink, peach, blue, and purple tones
- **Glass-morphism Cards**: Frosted glass effect with backdrop blur
- **Iridescent Text**: Shimmer animation on brand elements
- **Wave Animations**: Three animated waves at the bottom
- **Responsive Design**: Mobile-first approach
- **Premium Typography**: Playfair Display + Inter fonts
- **Smooth Transitions**: Framer Motion animations

---

## 🔒 Security

- Firebase handles secure authentication
- API keys stored in environment variables
- Protected routes require authentication
- MongoDB connection secured
- File upload validation (type and size)
- CORS configuration for API security

---

## 🚧 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Push notifications for health reminders
- [ ] Advanced ML models for medical image analysis
- [ ] Doctor appointment booking system
- [ ] Health metrics tracking (blood pressure, glucose, etc.)
- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] Telemedicine video consultations
- [ ] Prescription management
- [ ] Health insurance integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **HealthNest Team** - Initial work

---

## 🙏 Acknowledgments

- Design inspiration from [DiwakarMishra's HealthCare](https://github.com/DiwakarMishra-CODER/HealthCare)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Medical data from [Infermedica API](https://infermedica.com/)

---

## 📞 Support

For support, email support@healthnest.com or join our Slack channel.

---

## ⚠️ Disclaimer

**HealthNest is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.**

---

<div align="center">
  <p>Made with ❤️ by the HealthNest Team</p>
  <p>⭐ Star us on GitHub if you find this project helpful!</p>
</div>
# HealthFinal
