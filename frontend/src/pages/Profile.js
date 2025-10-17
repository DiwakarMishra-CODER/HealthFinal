import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendar, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Profile = () => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-6"
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
            <span className="iridescent-text">Profile</span>
          </h1>
          <p className="text-[#004D61] text-lg">Manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
          data-testid="profile-card"
        >
          <div className="flex flex-col items-center mb-8">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white/50 shadow-lg mb-4"
                data-testid="profile-photo"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#0078FF] flex items-center justify-center text-white text-4xl font-bold mb-4">
                {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#004D61]" style={{ fontFamily: 'Playfair Display' }}>
              {user?.displayName || 'User'}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaUser className="text-[#00C9A7] text-xl" />
                <div>
                  <p className="text-[#004D61] text-sm font-medium">Display Name</p>
                  <p className="text-[#004D61]" data-testid="display-name">{user?.displayName || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-[#00C9A7] text-xl" />
                <div>
                  <p className="text-[#004D61] text-sm font-medium">Email</p>
                  <p className="text-[#004D61]" data-testid="email">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaCalendar className="text-[#00C9A7] text-xl" />
                <div>
                  <p className="text-[#004D61] text-sm font-medium">Member Since</p>
                  <p className="text-[#004D61]" data-testid="member-since">
                    {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-8 btn-primary flex items-center justify-center space-x-2"
            data-testid="logout-button"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;