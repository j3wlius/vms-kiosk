import React from 'react';

const VisualFeedback = ({ 
  type, 
  message, 
  isVisible = true,
  duration = 3000,
  onClose,
  className = '' 
}) => {
  const [show, setShow] = React.useState(isVisible);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  React.useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: '✓'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: '⚠'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          icon: '⚠'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: 'ℹ'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: '•'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      ${styles.bg} ${styles.text} px-6 py-3 rounded-lg shadow-lg
      flex items-center space-x-3 animate-fade-in
      ${className}
    `}>
      <span className="text-lg">{styles.icon}</span>
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={() => {
            setShow(false);
            onClose();
          }}
          className="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default VisualFeedback;
