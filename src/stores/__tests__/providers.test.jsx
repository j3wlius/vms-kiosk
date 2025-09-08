import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  AppProvider,
  VisitorProvider,
  SystemProvider,
  UIProvider,
} from '../providers/AppProvider';
import {
  useVisitor,
  useSystem,
  useUI,
  useCurrentVisitor,
  useFormData,
  usePrinter,
  useCamera,
  useNavigation,
  useLoading,
} from '../providers/AppProvider';

// Test components to verify provider functionality
const TestVisitorComponent = () => {
  const visitor = useVisitor();
  const currentVisitor = useCurrentVisitor();
  const formData = useFormData();

  return (
    <div>
      <div data-testid="visitor-context">
        {visitor ? 'visitor-context-loaded' : 'no-context'}
      </div>
      <div data-testid="current-visitor">
        {currentVisitor ? 'visitor-loaded' : 'no-visitor'}
      </div>
      <div data-testid="form-data">{formData ? 'form-loaded' : 'no-form'}</div>
    </div>
  );
};

const TestSystemComponent = () => {
  const system = useSystem();
  const printer = usePrinter();
  const camera = useCamera();

  return (
    <div>
      <div data-testid="system-context">
        {system ? 'system-context-loaded' : 'no-context'}
      </div>
      <div data-testid="printer-context">
        {printer ? 'printer-loaded' : 'no-printer'}
      </div>
      <div data-testid="camera-context">
        {camera ? 'camera-loaded' : 'no-camera'}
      </div>
    </div>
  );
};

const TestUIComponent = () => {
  const ui = useUI();
  const navigation = useNavigation();
  const loading = useLoading();

  return (
    <div>
      <div data-testid="ui-context">
        {ui ? 'ui-context-loaded' : 'no-context'}
      </div>
      <div data-testid="navigation-context">
        {navigation ? 'navigation-loaded' : 'no-navigation'}
      </div>
      <div data-testid="loading-context">
        {loading ? 'loading-loaded' : 'no-loading'}
      </div>
    </div>
  );
};

const TestErrorComponent = () => {
  throw new Error('Test error for ErrorBoundary');
};

describe('Providers', () => {
  describe('VisitorProvider', () => {
    it('should provide visitor context', () => {
      render(
        <VisitorProvider>
          <TestVisitorComponent />
        </VisitorProvider>
      );

      expect(screen.getByTestId('visitor-context')).toHaveTextContent(
        'visitor-context-loaded'
      );
      expect(screen.getByTestId('current-visitor')).toHaveTextContent(
        'no-visitor'
      );
      expect(screen.getByTestId('form-data')).toHaveTextContent('form-loaded');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestVisitorComponent />);
      }).toThrow('useVisitor must be used within a VisitorProvider');

      console.error = originalError;
    });
  });

  describe('SystemProvider', () => {
    it('should provide system context', () => {
      render(
        <SystemProvider>
          <TestSystemComponent />
        </SystemProvider>
      );

      expect(screen.getByTestId('system-context')).toHaveTextContent(
        'system-context-loaded'
      );
      expect(screen.getByTestId('printer-context')).toHaveTextContent(
        'printer-loaded'
      );
      expect(screen.getByTestId('camera-context')).toHaveTextContent(
        'camera-loaded'
      );
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestSystemComponent />);
      }).toThrow('useSystem must be used within a SystemProvider');

      console.error = originalError;
    });
  });

  describe('UIProvider', () => {
    it('should provide UI context', () => {
      render(
        <UIProvider>
          <TestUIComponent />
        </UIProvider>
      );

      expect(screen.getByTestId('ui-context')).toHaveTextContent(
        'ui-context-loaded'
      );
      expect(screen.getByTestId('navigation-context')).toHaveTextContent(
        'navigation-loaded'
      );
      expect(screen.getByTestId('loading-context')).toHaveTextContent(
        'loading-loaded'
      );
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestUIComponent />);
      }).toThrow('useUI must be used within a UIProvider');

      console.error = originalError;
    });
  });

  describe('AppProvider', () => {
    it('should provide all contexts', () => {
      render(
        <AppProvider>
          <TestVisitorComponent />
          <TestSystemComponent />
          <TestUIComponent />
        </AppProvider>
      );

      // Visitor context
      expect(screen.getByTestId('visitor-context')).toHaveTextContent(
        'visitor-context-loaded'
      );
      expect(screen.getByTestId('current-visitor')).toHaveTextContent(
        'no-visitor'
      );
      expect(screen.getByTestId('form-data')).toHaveTextContent('form-loaded');

      // System context
      expect(screen.getByTestId('system-context')).toHaveTextContent(
        'system-context-loaded'
      );
      expect(screen.getByTestId('printer-context')).toHaveTextContent(
        'printer-loaded'
      );
      expect(screen.getByTestId('camera-context')).toHaveTextContent(
        'camera-loaded'
      );

      // UI context
      expect(screen.getByTestId('ui-context')).toHaveTextContent(
        'ui-context-loaded'
      );
      expect(screen.getByTestId('navigation-context')).toHaveTextContent(
        'navigation-loaded'
      );
      expect(screen.getByTestId('loading-context')).toHaveTextContent(
        'loading-loaded'
      );
    });

    it('should handle errors with ErrorBoundary', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <AppProvider>
          <TestErrorComponent />
        </AppProvider>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reset App')).toBeInTheDocument();

      console.error = originalError;
    });
  });
});
