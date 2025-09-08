// Main hooks exports
export { default as useIdleDetection } from './useIdleDetection';
export { default as useOCR } from './useOCR';
export { default as useCamera } from './useCamera';
export { default as usePrinter } from './usePrinter';
export { default as useVisitorSession } from './useVisitorSession';
export { default as useOfflineSync } from './useOfflineSync';

// Specialized hooks
export { useOCRFieldExtraction, useOCRTemplate } from './useOCR';
export { useCameraCapture } from './useCamera';
export { usePrintQueue, usePrintTemplates } from './usePrinter';
export { useVisitorForm } from './useVisitorSession';
export { useNetworkStatus } from './useOfflineSync';

// Hook utilities
export const useServiceHealth = () => {
  const [health, setHealth] = useState({
    storage: false,
    api: false,
    camera: false,
    ocr: false,
    printing: false,
    overall: false,
  });

  const checkHealth = useCallback(async () => {
    try {
      const { checkServiceHealth } = await import('../services');
      const serviceHealth = await checkServiceHealth();
      setHealth(serviceHealth);
      return serviceHealth;
    } catch (error) {
      console.error('Failed to check service health:', error);
      return health;
    }
  }, [health]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return { health, checkHealth };
};

// Hook for managing all services
export const useServices = () => {
  const [services, setServices] = useState({
    storage: null,
    api: null,
    camera: null,
    ocr: null,
    printing: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  const initializeServices = useCallback(async () => {
    try {
      setInitializationError(null);

      const { initializeServices } = await import('../services');
      const results = await initializeServices();

      setServices(results);
      setIsInitialized(true);

      return results;
    } catch (error) {
      setInitializationError(error.message);
      return null;
    }
  }, []);

  const cleanupServices = useCallback(async () => {
    try {
      const { cleanupServices } = await import('../services');
      await cleanupServices();

      setServices({
        storage: null,
        api: null,
        camera: null,
        ocr: null,
        printing: null,
      });
      setIsInitialized(false);
    } catch (error) {
      console.error('Failed to cleanup services:', error);
    }
  }, []);

  return {
    services,
    isInitialized,
    initializationError,
    initializeServices,
    cleanupServices,
  };
};

// Hook for error handling across all services
export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const addError = useCallback(error => {
    const errorData = {
      id: Date.now().toString(),
      message: error.message || 'An unknown error occurred',
      type: error.type || 'general',
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    setErrors(prev => [errorData, ...prev.slice(0, 49)]); // Keep last 50 errors
    setIsErrorVisible(true);
  }, []);

  const removeError = useCallback(errorId => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsErrorVisible(false);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorVisible(false);
  }, []);

  return {
    errors,
    isErrorVisible,
    addError,
    removeError,
    clearErrors,
    hideError,
  };
};

// Hook for managing application state
export const useAppState = () => {
  const [appState, setAppState] = useState({
    isInitialized: false,
    currentScreen: 'welcome',
    isLoading: false,
    error: null,
  });

  const setCurrentScreen = useCallback(screen => {
    setAppState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const setLoading = useCallback(loading => {
    setAppState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback(error => {
    setAppState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setAppState(prev => ({ ...prev, error: null }));
  }, []);

  const initializeApp = useCallback(() => {
    setAppState(prev => ({ ...prev, isInitialized: true }));
  }, []);

  return {
    appState,
    setCurrentScreen,
    setLoading,
    setError,
    clearError,
    initializeApp,
  };
};
