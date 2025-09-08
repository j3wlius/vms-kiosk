import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Card Component
 * Flexible card container for information display
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border transition-all duration-200';

  const variants = {
    default: 'border-gray-200',
    primary: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    outline: 'border-2 border-gray-300',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const cardClasses = cn(
    baseClasses,
    variants[variant],
    paddings[padding],
    shadows[shadow],
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header Component
 */
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

/**
 * Card Title Component
 */
const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    className={cn('text-lg font-semibold text-gray-900 kiosk-text', className)}
    {...props}
  >
    {children}
  </h3>
);

/**
 * Card Description Component
 */
const CardDescription = ({ children, className = '', ...props }) => (
  <p className={cn('text-sm text-gray-600 kiosk-text', className)} {...props}>
    {children}
  </p>
);

/**
 * Card Content Component
 */
const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

/**
 * Card Footer Component
 */
const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={cn('mt-4 pt-4 border-t border-gray-200', className)}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

