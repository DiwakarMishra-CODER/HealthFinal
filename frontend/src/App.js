import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SymptomChecker from './pages/SymptomChecker';
import DoctorFinder from './pages/DoctorFinder';
import MealTracker from './pages/MealTracker';
import MedicalRecords from './pages/MedicalRecords';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';

const AppLayout = () => {
  const location = useLocation();
  const showFooter = location.pathname === '/';

  return (
    <>
      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<AuthWrapper><SignIn /></AuthWrapper>} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/doctor-finder" element={<DoctorFinder />} />
            <Route path="/meal-tracker" element={<ProtectedRoute><MealTracker /></ProtectedRoute>} />
            <Route path="/medical-records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
      {showFooter && <Footer />}
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
};

const AuthWrapper = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <AppLayout />
      </div>
    </Router>
  );
}

export default App;