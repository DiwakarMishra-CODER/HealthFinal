import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStethoscope, FaUserMd, FaUtensils, FaFileMedical, FaHeartbeat, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FaStethoscope className="text-4xl" />,
      title: 'Symptom Checker',
      description: 'AI-powered symptom analysis with personalized health advice',
      link: '/symptom-checker',
      testId: 'feature-symptom-checker'
    },
    {
      icon: <FaUserMd className="text-4xl" />,
      title: 'Find Doctors',
      description: 'Search and connect with qualified healthcare professionals',
      link: '/doctor-finder',
      testId: 'feature-doctor-finder'
    },
    {
      icon: <FaUtensils className="text-4xl" />,
      title: 'Meal Tracker',
      description: 'Track your nutrition and get dietary recommendations',
      link: user ? '/meal-tracker' : '/signin',
      testId: 'feature-meal-tracker'
    },
    {
      icon: <FaFileMedical className="text-4xl" />,
      title: 'Medical Records',
      description: 'Upload and analyze medical reports with AI assistance',
      link: user ? '/medical-records' : '/signin',
      testId: 'feature-medical-records'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ fontFamily: 'Playfair Display' }}>
              <span className="iridescent-text">Your Health,</span>
              <br />
              <span className="text-[#004D61]">Our Priority</span>
            </h1>
            <p className="text-lg md:text-xl text-[#004D61] mb-8 max-w-2xl mx-auto">
              Comprehensive health management platform powered by AI. Check symptoms, find doctors, track nutrition, and manage medical records - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="hero-cta">
              <Link to={user ? "/dashboard" : "/signin"} className="btn-primary" data-testid="get-started-button">
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Link>
              <Link to="/symptom-checker" className="btn-secondary" data-testid="try-symptom-checker-button">
                Try Symptom Checker
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            style={{ fontFamily: 'Playfair Display' }}
          >
            <span className="iridescent-text">Features</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link to={feature.link} data-testid={feature.testId}>
                  <div className="glass-card p-8 h-full hover:shadow-2xl transition-all duration-300">
                    <div className="text-[#00C9A7] mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#004D61] mb-3" style={{ fontFamily: 'Playfair Display' }}>
                      {feature.title}
                    </h3>
                    <p className="text-[#004D61] text-sm">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-8 text-center"
            >
              <FaHeartbeat className="text-5xl text-[#00C9A7] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#004D61] mb-3">AI-Powered Insights</h3>
              <p className="text-[#004D61] text-sm">Advanced AI algorithms provide accurate health insights and recommendations</p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 text-center"
            >
              <FaShieldAlt className="text-5xl text-[#00C9A7] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#004D61] mb-3">Secure & Private</h3>
              <p className="text-[#004D61] text-sm">Your health data is encrypted and protected with industry-standard security</p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 text-center"
            >
              <FaFileMedical className="text-5xl text-[#00C9A7] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#004D61] mb-3">Complete Health Records</h3>
              <p className="text-[#004D61] text-sm">Centralize all your health information in one secure location</p>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;