import React from 'react';
import Button from './Button';

const ErrorRecovery = ({ 
  error, 
  onRetry, 
  onSkip, 
  onCancel,
  retryLabel = 'Try Again',
  skipLabel = 'Skip',
  cancelLabel = 'Cancel',
  showSkip = false,
  showCancel = false,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-lg">⚠</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-700 mb-4">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onRetry}
              variant="primary"
              size="sm"
            >
              {retryLabel}
            </Button>
            
            {showSkip && (
              <Button
                onClick={onSkip}
                variant="secondary"
                size="sm"
              >
                {skipLabel}
              </Button>
            )}
            
            {showCancel && (
              <Button
                onClick={onCancel}
                variant="danger"
                size="sm"
              >
                {cancelLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorRecovery;
