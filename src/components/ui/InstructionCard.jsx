import React from 'react';

const InstructionCard = ({ 
  title, 
  steps = [], 
  icon, 
  variant = 'default',
  className = '' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`
      ${styles.bg} ${styles.border} border rounded-lg p-6
      ${className}
    `}>
      <div className="flex items-start space-x-4">
        {icon && (
          <div className={`
            flex-shrink-0 w-12 h-12 ${styles.iconBg} rounded-lg 
            flex items-center justify-center
          `}>
            <span className={`text-2xl ${styles.iconColor}`}>
              {icon}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className={`text-lg font-semibold ${styles.titleColor} mb-3`}>
              {title}
            </h3>
          )}
          
          {steps.length > 0 && (
            <ul className={`space-y-2 ${styles.textColor}`}>
              {steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionCard;
