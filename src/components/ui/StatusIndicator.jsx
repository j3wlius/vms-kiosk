import React from 'react';

const StatusIndicator = ({ 
  status, 
  message, 
  showIcon = true,
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: '⚠',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: 'ℹ',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'loading':
        return {
          icon: '⟳',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          icon: '•',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      flex items-center space-x-3 p-4 rounded-lg border
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      ${className}
    `}>
      {showIcon && (
        <div className={`
          flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg
          ${config.iconColor}
          ${status === 'loading' ? 'animate-spin' : ''}
        `}>
          {config.icon}
        </div>
      )}
      
      {message && (
        <div className="flex-1">
          <p className="text-sm font-medium kiosk-text">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
