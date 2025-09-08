import React from 'react';

/**
 * ProgressBar Component
 * Linear progress indicator
 */
const ProgressBar = ({
  progress = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
  };

  const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
  const progressClasses = `h-full transition-all duration-300 ease-in-out rounded-full ${variants[variant]}`;

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className={`${baseClasses} ${sizes[size]}`}>
        <div
          className={progressClasses}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
};

export default ProgressBar;