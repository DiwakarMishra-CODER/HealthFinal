import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaSearch, FaStethoscope } from 'react-icons/fa';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SymptomChecker = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast.error('Please enter at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const symptomList = symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await axios.post(`${API}/symptoms/analyze`, {
        user_id: user?.uid || 'guest',
        symptoms: symptomList,
        age: parseInt(age) || 30,
        sex: sex
      });

      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-12 px-6"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
            <span className="iridescent-text">Symptom Checker</span>
          </h1>
          <p className="text-[#004D61] text-lg">Describe your symptoms and get AI-powered health insights</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleAnalyze} className="space-y-6" data-testid="symptom-form">
            <div>
              <label className="block text-[#004D61] font-medium mb-2">Symptoms (comma-separated)</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="input min-h-[120px]"
                placeholder="e.g., headache, fever, cough"
                required
                data-testid="symptoms-input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#004D61] font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input"
                  placeholder="30"
                  min="1"
                  max="120"
                  data-testid="age-input"
                />
              </div>

              <div>
                <label className="block text-[#004D61] font-medium mb-2">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="input"
                  data-testid="sex-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
              data-testid="analyze-button"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FaSearch />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {result && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-8 space-y-6"
            data-testid="results-section"
          >
            {/* Possible Conditions */}
            {result.conditions && result.conditions.length > 0 && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-[#004D61] mb-4 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
                  <FaStethoscope className="text-[#00C9A7]" />
                  <span>Possible Conditions</span>
                </h3>
                <div className="space-y-3">
                  {result.conditions.map((condition, index) => (
                    <div key={index} className="bg-white/30 rounded-lg p-4" data-testid={`condition-${index}`}>
                      <p className="font-semibold text-[#004D61]">
                        {condition.common_name || condition.name}
                      </p>
                      {condition.probability && (
                        <div className="mt-2">
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#00C9A7] to-[#0078FF] h-2 rounded-full"
                              style={{ width: `${(condition.probability * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-[#004D61] mt-1">
                            Probability: {(condition.probability * 100).toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gemini Advice */}
            {result.advice && (
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold text-[#004D61] mb-4" style={{ fontFamily: 'Playfair Display' }}>
                  Health Advice
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[#004D61] whitespace-pre-wrap" data-testid="gemini-advice">{result.advice}</p>
                </div>
                <div className="mt-4 p-4 bg-yellow-100/30 rounded-lg">
                  <p className="text-sm text-[#004D61]">
                    <strong>Disclaimer:</strong> This is AI-assisted analysis and not a medical diagnosis. Please consult a healthcare professional for accurate diagnosis and treatment.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SymptomChecker;