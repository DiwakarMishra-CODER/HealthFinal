import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative py-12 bg-gradient-to-t from-white/5 to-transparent">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
              <span className="iridescent-text">HealthNest</span>
            </h3>
            <p className="text-[#004D61] text-sm">Your comprehensive health companion. Analyze symptoms, find doctors, track meals, and manage your health records.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#004D61] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/symptom-checker" className="text-[#004D61] hover:text-[#00C9A7] transition-colors">Symptom Checker</a></li>
              <li><a href="/doctor-finder" className="text-[#004D61] hover:text-[#00C9A7] transition-colors">Find Doctors</a></li>
              <li><a href="/meal-tracker" className="text-[#004D61] hover:text-[#00C9A7] transition-colors">Meal Tracker</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#004D61] mb-4">Contact</h4>
            <p className="text-[#004D61] text-sm">Email: support@healthnest.com</p>
            <p className="text-[#004D61] text-sm">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-[#004D61] text-sm flex items-center justify-center space-x-2">
            <span>Made with</span>
            <FaHeart className="text-red-400" />
            <span>by HealthNest Team</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;