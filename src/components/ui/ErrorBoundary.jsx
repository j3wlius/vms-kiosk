import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now(),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          variant={this.props.variant}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback Component
 * Default error display component
 */
const ErrorFallback = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReload,
  variant = 'default',
  showDetails = false,
}) => {
  const [showDetailsState, setShowDetailsState] = React.useState(showDetails);

  const variants = {
    default: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
    },
    minimal: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-400',
      title: 'text-gray-800',
      message: 'text-gray-700',
    },
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className={cn(
          'max-w-md w-full rounded-lg border-l-4 p-6 shadow-lg',
          variantStyles.bg,
          variantStyles.border
        )}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className={cn('h-8 w-8', variantStyles.icon)}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="ml-3">
            <h3 className={cn('text-lg font-medium', variantStyles.title)}>
              Something went wrong
            </h3>

            <div className={cn('mt-2 text-sm', variantStyles.message)}>
              <p>
                We're sorry, but something unexpected happened. Please try again
                or contact support if the problem persists.
              </p>

              {errorId && (
                <p className="mt-2 text-xs opacity-75">Error ID: {errorId}</p>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="sm" onClick={onRetry}>
                Try Again
              </Button>

              <Button variant="secondary" size="sm" onClick={onReload}>
                Reload Page
              </Button>

              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsState(!showDetailsState)}
                >
                  {showDetailsState ? 'Hide' : 'Show'} Details
                </Button>
              )}
            </div>

            {showDetailsState && error && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Error Details:
                </h4>
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ErrorPage Component
 * Full-page error display
 */
const ErrorPage = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  errorId,
  onRetry,
  onReload,
  showDetails = false,
}) => {
  const [showDetailsState, setShowDetailsState] = React.useState(showDetails);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 kiosk-text">
            {title}
          </h1>

          <p className="text-lg text-gray-600 mb-6 kiosk-text">{message}</p>

          {errorId && (
            <p className="text-sm text-gray-500 mb-6">Error ID: {errorId}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={onRetry}>
            Try Again
          </Button>

          <Button variant="secondary" size="lg" onClick={onReload}>
            Reload Page
          </Button>
        </div>

        {showDetailsState && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Technical Details:
            </h3>
            <pre className="text-xs text-gray-700 overflow-auto max-h-32">
              {errorId
                ? `Error ID: ${errorId}`
                : 'No additional details available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * withErrorBoundary HOC
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = props => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
export { ErrorFallback, ErrorPage };
