import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from 'react-icons/fa';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DoctorFinder = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchSpecialization, setSearchSpecialization] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchName, searchSpecialization, searchLocation, doctors]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API}/doctors`);
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchName) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchSpecialization) {
      filtered = filtered.filter(doc =>
        doc.specialization.toLowerCase().includes(searchSpecialization.toLowerCase())
      );
    }

    if (searchLocation) {
      filtered = filtered.filter(doc =>
        doc.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

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
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
            <span className="iridescent-text">Find Doctors</span>
          </h1>
          <p className="text-[#004D61] text-lg">Search and connect with qualified healthcare professionals</p>
        </motion.div>

        {/* Search Filters */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#004D61] font-medium mb-2">Name</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="input"
                placeholder="Search by name"
                data-testid="name-search-input"
              />
            </div>

            <div>
              <label className="block text-[#004D61] font-medium mb-2">Specialization</label>
              <input
                type="text"
                value={searchSpecialization}
                onChange={(e) => setSearchSpecialization(e.target.value)}
                className="input"
                placeholder="e.g., Cardiology"
                data-testid="specialization-search-input"
              />
            </div>

            <div>
              <label className="block text-[#004D61] font-medium mb-2">Location</label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="input"
                placeholder="e.g., New York"
                data-testid="location-search-input"
              />
            </div>
          </div>
        </motion.div>

        {/* Doctors List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="doctors-list"
          >
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-6"
                  data-testid={`doctor-card-${doctor.id}`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full border-2 border-white/50"
                      data-testid="doctor-photo"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#004D61]" style={{ fontFamily: 'Playfair Display' }}>
                        {doctor.name}
                      </h3>
                      <p className="text-[#00C9A7] font-medium">{doctor.specialization}</p>
                      {doctor.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <FaStar className="text-yellow-500" />
                          <span className="text-[#004D61] text-sm">{doctor.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#004D61]">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-[#00C9A7]" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-[#00C9A7]" />
                      <span>{doctor.contact}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-[#00C9A7]" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-[#004D61]">
                    <strong>Experience:</strong> {doctor.experience}
                  </p>

                  <button className="w-full mt-4 btn-primary" data-testid="contact-doctor-button">
                    Contact Doctor
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="no-doctors-found">
                <p className="text-[#004D61] text-lg">No doctors found matching your criteria</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorFinder;