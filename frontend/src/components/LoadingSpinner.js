import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center" data-testid="loading-spinner">
      <div className={`${sizeClasses[size]} border-4 border-[#00C9A7]/20 border-t-[#00C9A7] rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;