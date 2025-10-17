import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaUtensils, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MealTracker = () => {
  const { user } = useAuth();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mealHistory, setMealHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const fetchMealHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/meals/history/${user.uid}`);
      setMealHistory(response.data);
    } catch (error) {
      console.error('Error fetching meal history:', error);
      toast.error('Failed to load meal history');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMeal = async (e) => {
    e.preventDefault();
    
    if (!foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/meals/analyze`, {
        user_id: user.uid,
        food_name: foodName,
        quantity: quantity
      });

      setCurrentAnalysis(response.data.analysis);
      toast.success('Meal analyzed successfully!');
      
      // Refresh history
      fetchMealHistory();
      
      // Clear form
      setFoodName('');
      setQuantity('1 serving');
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('Failed to analyze meal');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await axios.delete(`${API}/meals/${mealId}?user_id=${user.uid}`);
      toast.success('Meal deleted');
      fetchMealHistory();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
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
            <span className="iridescent-text">Meal Tracker</span>
          </h1>
          <p className="text-[#004D61] text-lg">Track your meals and get personalized nutritional insights</p>
        </motion.div>

        {/* Add Meal Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          <form onSubmit={handleAnalyzeMeal} className="space-y-6" data-testid="meal-form">
            <div>
              <label className="block text-[#004D61] font-medium mb-2">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="input"
                placeholder="e.g., Grilled chicken salad"
                required
                data-testid="food-name-input"
              />
            </div>

            <div>
              <label className="block text-[#004D61] font-medium mb-2">Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input"
                placeholder="e.g., 1 plate, 200g"
                data-testid="quantity-input"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full btn-primary flex items-center justify-center space-x-2"
              data-testid="analyze-meal-button"
            >
              {analyzing ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FaPlus />
                  <span>Analyze Meal</span>
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
              Nutritional Analysis
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-[#004D61] whitespace-pre-wrap">{currentAnalysis}</p>
            </div>
          </motion.div>
        )}

        {/* Meal History */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="text-2xl font-bold text-[#004D61] mb-6 flex items-center space-x-2" style={{ fontFamily: 'Playfair Display' }}>
            <FaUtensils className="text-[#00C9A7]" />
            <span>Meal History</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : mealHistory.length > 0 ? (
            <div className="space-y-4" data-testid="meal-history">
              {mealHistory.map((meal) => (
                <div key={meal.id} className="bg-white/30 rounded-lg p-4" data-testid={`meal-${meal.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#004D61] text-lg">{meal.food_name}</h4>
                      <p className="text-[#004D61] text-sm mt-1">Quantity: {meal.quantity}</p>
                      <p className="text-[#004D61]/70 text-xs mt-2">
                        {new Date(meal.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      data-testid={`delete-meal-${meal.id}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {meal.gemini_suggestions && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-[#004D61] text-sm whitespace-pre-wrap">{meal.gemini_suggestions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#004D61] py-8" data-testid="no-meals">No meals tracked yet. Start by adding your first meal!</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MealTracker;