import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaUpload, FaFileMedical, FaEye } from 'react-icons/fa';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MedicalRecords = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/history/${user.uid}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only images (JPEG, PNG) or PDF files');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', user.uid);

      const response = await axios.post(`${API}/reports/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCurrentAnalysis(response.data.analysis);
      toast.success('Report analyzed successfully!');
      
      // Refresh reports list
      fetchReports();
      
      // Clear selection
      setSelectedFile(null);
      e.target.reset();
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to analyze report');
    } finally {
      setUploading(false);
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
            <span className="iridescent-text">Medical Records</span>
          </h1>
          <p className="text-[#004D61] text-lg">Upload and analyze your medical reports with AI</p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          <form onSubmit={handleUpload} className="space-y-6" data-testid="upload-form">
            <div>
              <label className="block text-[#004D61] font-medium mb-2">Upload Medical Report/Image</label>
              <div className="border-2 border-dashed border-white/50 rounded-lg p-8 text-center hover:border-[#00C9A7] transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="file-upload"
                  data-testid="file-input"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FaUpload className="text-4xl text-[#00C9A7] mx-auto mb-4" />
                  {selectedFile ? (
                    <p className="text-[#004D61] font-medium">{selectedFile.name}</p>
                  ) : (
                    <p className="text-[#004D61]">Click to browse or drag and drop your file here</p>
                  )}
                  <p className="text-[#004D61] text-sm mt-2">Supported: JPEG, PNG, PDF (Max 10MB)</p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full btn-primary flex items-center justify-center space-x-2"
              data-testid="upload-button"
            >
              {uploading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FaUpload />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Current Analysis */}
        {currentAnalysis && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-8 mb-8"
            data-testid="current-analysis"
          >
            <h3 className="text-2xl font-bold text-[#004D61] mb-4" style={{ fontFamily: 'Playfair Display' }}>
              Analysis Report
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-[#004D61] whitespace-pre-wrap">{currentAnalysis}</p>
            </div>
            <div className="mt-4 p-4 bg-yellow-100/30 rounded-lg">
              <p className="text-sm text-[#004D61]">
                <strong>Disclaimer:</strong> This is AI-assisted analysis and not a medical diagnosis. Always consult with healthcare professionals for accurate interpretation.
              </p>
            </div>
          </motion.div>
        )}

        {/* Reports History */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="text-2xl font-bold text-[#004D61] mb-6 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
            <FaFileMedical className="text-[#00C9A7]" />
            <span>Report History</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4" data-testid="reports-list">
              {reports.map((report) => (
                <div key={report.id} className="bg-white/30 rounded-lg p-4" data-testid={`report-${report.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#004D61] text-lg">{report.file_name}</h4>
                      <p className="text-[#004D61] text-sm mt-1">Type: {report.file_type}</p>
                      <p className="text-[#004D61]/70 text-xs mt-2">
                        {new Date(report.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <FaEye className="text-[#00C9A7] cursor-pointer" />
                  </div>
                  {report.analysis && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-[#004D61] text-sm whitespace-pre-wrap">{report.analysis}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#004D61] py-8" data-testid="no-reports">No reports uploaded yet. Upload your first medical report!</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MedicalRecords;