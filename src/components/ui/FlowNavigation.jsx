import React from 'react';
import { useNavigate } from 'react-router-dom';

const FlowNavigation = ({ 
  currentStep, 
  onNext, 
  onPrevious, 
  onCancel,
  nextLabel = 'Continue',
  previousLabel = 'Back',
  cancelLabel = 'Cancel',
  showPrevious = true,
  showCancel = false,
  nextDisabled = false,
  nextLoading = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default cancel behavior - go to welcome screen
      navigate('/');
    }
  };

  return (
    <div className={`flex justify-between items-center pt-6 border-t border-gray-200 ${className}`}>
      {/* Left side - Previous and Cancel */}
      <div className="flex space-x-3">
        {showPrevious && (
          <button
            onClick={onPrevious}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors touch-button kiosk-button"
          >
            {previousLabel}
          </button>
        )}
        
        {showCancel && (
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors touch-button kiosk-button"
          >
            {cancelLabel}
          </button>
        )}
      </div>

      {/* Right side - Next */}
      <button
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className={`
          px-8 py-3 rounded-lg font-medium transition-all duration-200 touch-button kiosk-button
          ${nextDisabled || nextLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
        `}
      >
        {nextLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
};

export default FlowNavigation;
