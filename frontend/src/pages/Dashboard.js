import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaStethoscope, FaUtensils, FaFileMedical, FaChartLine } from 'react-icons/fa';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dashboard/${user.uid}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: <FaStethoscope className="text-3xl" />,
      label: 'Symptom Checks',
      value: dashboardData?.symptoms?.length || 0,
      color: 'from-purple-400 to-pink-400',
      link: '/symptom-checker',
      testId: 'symptom-stat'
    },
    {
      icon: <FaUtensils className="text-3xl" />,
      label: 'Meals Tracked',
      value: dashboardData?.meals?.length || 0,
      color: 'from-green-400 to-blue-400',
      link: '/meal-tracker',
      testId: 'meal-stat'
    },
    {
      icon: <FaFileMedical className="text-3xl" />,
      label: 'Reports Uploaded',
      value: dashboardData?.reports?.length || 0,
      color: 'from-yellow-400 to-red-400',
      link: '/medical-records',
      testId: 'report-stat'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-6"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
            <span className="iridescent-text">Welcome back,</span>
            <br />
            <span className="text-[#004D61]">{user?.displayName || 'User'}!</span>
          </h1>
          <p className="text-[#004D61] text-lg">Here's your health overview</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link to={stat.link} data-testid={stat.testId}>
                    <div className="glass-card p-6 h-full">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}>
                        {stat.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-[#004D61] mb-2">{stat.value}</h3>
                      <p className="text-[#004D61]">{stat.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Symptom Checks */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold text-[#004D61] mb-4 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
                  <FaStethoscope className="text-[#00C9A7]" />
                  <span>Recent Symptom Checks</span>
                </h3>
                {dashboardData?.symptoms && dashboardData.symptoms.length > 0 ? (
                  <div className="space-y-3" data-testid="recent-symptoms">
                    {dashboardData.symptoms.map((symptom, index) => (
                      <div key={index} className="bg-white/30 rounded-lg p-3">
                        <p className="text-[#004D61] font-medium text-sm">
                          {symptom.symptoms?.join(', ')}
                        </p>
                        <p className="text-[#004D61]/70 text-xs mt-1">
                          {new Date(symptom.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#004D61] text-center py-4">No symptom checks yet</p>
                )}
                <Link to="/symptom-checker" className="block mt-4 text-center btn-secondary">
                  Check Symptoms
                </Link>
              </motion.div>

              {/* Recent Meals */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold text-[#004D61] mb-4 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
                  <FaUtensils className="text-[#00C9A7]" />
                  <span>Recent Meals</span>
                </h3>
                {dashboardData?.meals && dashboardData.meals.length > 0 ? (
                  <div className="space-y-3" data-testid="recent-meals">
                    {dashboardData.meals.map((meal, index) => (
                      <div key={index} className="bg-white/30 rounded-lg p-3">
                        <p className="text-[#004D61] font-medium text-sm">{meal.food_name}</p>
                        <p className="text-[#004D61]/70 text-xs mt-1">
                          {meal.quantity} - {new Date(meal.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#004D61] text-center py-4">No meals tracked yet</p>
                )}
                <Link to="/meal-tracker" className="block mt-4 text-center btn-secondary">
                  Track Meal
                </Link>
              </motion.div>
            </div>

            {/* Recent Reports */}
            {dashboardData?.reports && dashboardData.reports.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 mt-8"
              >
                <h3 className="text-xl font-bold text-[#004D61] mb-4 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
                  <FaFileMedical className="text-[#00C9A7]" />
                  <span>Recent Medical Reports</span>
                </h3>
                <div className="space-y-3" data-testid="recent-reports">
                  {dashboardData.reports.map((report, index) => (
                    <div key={index} className="bg-white/30 rounded-lg p-3">
                      <p className="text-[#004D61] font-medium text-sm">{report.file_name}</p>
                      <p className="text-[#004D61]/70 text-xs mt-1">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Link to="/medical-records" className="block mt-4 text-center btn-secondary">
                  View All Reports
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;