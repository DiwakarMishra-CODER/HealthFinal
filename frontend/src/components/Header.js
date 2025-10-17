import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'sonner';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display' }}>
              <span className="iridescent-text">HealthNest</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-home">Home</Link>
            <Link to="/symptom-checker" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-symptom-checker">Symptom Checker</Link>
            <Link to="/doctor-finder" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-doctor-finder">Find Doctors</Link>
            {user && (
              <>
                <Link to="/meal-tracker" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-meal-tracker">Meal Tracker</Link>
                <Link to="/medical-records" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-medical-records">Medical Records</Link>
                <Link to="/dashboard" className="text-[#004D61] hover:text-[#00C9A7] font-medium transition-colors" data-testid="nav-dashboard">Dashboard</Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" data-testid="profile-link">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/50" data-testid="profile-avatar" />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-[#004D61]" data-testid="profile-icon" />
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn-secondary flex items-center space-x-2"
                  data-testid="logout-button"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/signin" className="btn-primary" data-testid="signin-button">Sign In</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;