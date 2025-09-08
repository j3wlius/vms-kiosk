import React from 'react';
import { cn } from '../../utils/cn';

/**
 * LoadingSpinner Component
 * Various loading indicators for different use cases
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white',
  };

  const spinnerClasses = cn(
    'animate-spin',
    sizes[size],
    colors[color],
    className
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div
              className={cn(
                'w-2 h-2 bg-current rounded-full animate-bounce',
                colors[color]
              )}
              style={{ animationDelay: '0ms' }}
            />
            <div
              className={cn(
                'w-2 h-2 bg-current rounded-full animate-bounce',
                colors[color]
              )}
              style={{ animationDelay: '150ms' }}
            />
            <div
              className={cn(
                'w-2 h-2 bg-current rounded-full animate-bounce',
                colors[color]
              )}
              style={{ animationDelay: '300ms' }}
            />
          </div>
        );

      case 'pulse':
        return (
          <div
            className={cn('rounded-full bg-current animate-pulse', sizes[size])}
          />
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            <div
              className={cn('w-1 bg-current animate-pulse', colors[color])}
              style={{ height: '16px', animationDelay: '0ms' }}
            />
            <div
              className={cn('w-1 bg-current animate-pulse', colors[color])}
              style={{ height: '20px', animationDelay: '150ms' }}
            />
            <div
              className={cn('w-1 bg-current animate-pulse', colors[color])}
              style={{ height: '16px', animationDelay: '300ms' }}
            />
            <div
              className={cn('w-1 bg-current animate-pulse', colors[color])}
              style={{ height: '12px', animationDelay: '450ms' }}
            />
          </div>
        );

      case 'circular':
        return (
          <div className={cn('relative', sizes[size])}>
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
                className="opacity-75"
              />
            </svg>
          </div>
        );

      default: // spinner
        return (
          <svg
            className={spinnerClasses}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <div className="flex flex-col items-center space-y-2">
        {renderSpinner()}
        {text && (
          <p className={cn('text-sm font-medium', colors[color])}>{text}</p>
        )}
      </div>
    </div>
  );
};

/**
 * LoadingOverlay Component
 * Full-screen loading overlay
 */
const LoadingOverlay = ({
  isVisible = false,
  text = 'Loading...',
  variant = 'spinner',
  color = 'primary',
  className = '',
  ...props
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        className
      )}
      {...props}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner variant={variant} color={color} size="lg" text={text} />
      </div>
    </div>
  );
};

/**
 * LoadingButton Component
 * Button with integrated loading state
 */
const LoadingButton = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  ...buttonProps
}) => {
  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || loading}
      className={cn(buttonProps.className, loading && 'cursor-wait')}
    >
      {loading ? (
        <div className="flex items-center">
          <LoadingSpinner size="sm" color="white" className="mr-2" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

LoadingSpinner.Overlay = LoadingOverlay;
LoadingSpinner.Button = LoadingButton;

export default LoadingSpinner;

