import { renderHook, act } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import {
  formCompletionAtom,
  overallSystemStatusAtom,
  ocrStatusAtom,
  printQueueStatusAtom,
  cameraReadinessAtom,
  networkConnectivityAtom,
  visitorSessionStatusAtom,
  errorSummaryAtom,
  loadingSummaryAtom,
  navigationStatusAtom,
  dataValidationSummaryAtom,
  performanceMetricsAtom,
  accessibilityStatusAtom,
} from '../atoms/derivedAtoms';
import {
  formValidationAtom,
  currentFormStepAtom,
  ocrProcessingAtom,
  visitorBadgeDataAtom,
} from '../atoms/visitorAtoms';
import {
  printerStatusAtom,
  cameraStatusAtom,
  networkStatusAtom,
  systemHealthAtom,
  systemErrorsAtom,
} from '../atoms/systemAtoms';
import {
  isLoadingAtom,
  loadingStatesAtom,
  errorAtom,
  currentScreenAtom,
  screenHistoryAtom,
} from '../atoms/uiAtoms';

// Helper function to render hooks with provider
const renderHookWithProvider = hook => {
  const wrapper = ({ children }) => <Provider>{children}</Provider>;
  return renderHook(hook, { wrapper });
};

describe('Derived Atoms', () => {
  describe('formCompletionAtom', () => {
    it('should calculate form completion correctly', () => {
      const { result } = renderHookWithProvider(() => {
        const [completion] = useAtom(formCompletionAtom);
        return completion;
      });

      expect(result.current).toEqual({
        currentStep: 0,
        totalSteps: 6,
        completedSteps: 0,
        progress: 0,
        isComplete: false,
        canProceed: true,
      });
    });
  });

  describe('overallSystemStatusAtom', () => {
    it('should show ready status when all components are working', () => {
      const { result } = renderHookWithProvider(() => {
        const [status] = useAtom(overallSystemStatusAtom);
        return status;
      });

      expect(result.current.status).toBe('ready');
      expect(result.current.components).toEqual({
        printer: false,
        camera: false,
        network: true,
        system: true,
      });
    });
  });

  describe('ocrStatusAtom', () => {
    it('should reflect OCR processing state', () => {
      const { result } = renderHookWithProvider(() => {
        const [ocrStatus] = useAtom(ocrStatusAtom);
        return ocrStatus;
      });

      expect(result.current).toEqual({
        isProcessing: false,
        progress: 0,
        hasResults: false,
        confidence: 0,
        isHighConfidence: false,
        documentType: null,
        error: null,
      });
    });
  });

  describe('printQueueStatusAtom', () => {
    it('should reflect print queue status', () => {
      const { result } = renderHookWithProvider(() => {
        const [printStatus] = useAtom(printQueueStatusAtom);
        return printStatus;
      });

      expect(result.current).toEqual({
        isAvailable: false,
        isPrinting: false,
        queueLength: 0,
        canPrint: false,
        estimatedTime: 0,
        lastError: null,
      });
    });
  });

  describe('cameraReadinessAtom', () => {
    it('should reflect camera readiness state', () => {
      const { result } = renderHookWithProvider(() => {
        const [cameraReadiness] = useAtom(cameraReadinessAtom);
        return cameraReadiness;
      });

      expect(result.current).toEqual({
        isReady: false,
        isInitializing: false,
        hasDevices: false,
        selectedDevice: null,
        permissions: {
          granted: false,
          denied: false,
          prompt: false,
        },
        error: null,
      });
    });
  });

  describe('networkConnectivityAtom', () => {
    it('should reflect network connectivity state', () => {
      const { result } = renderHookWithProvider(() => {
        const [networkConnectivity] = useAtom(networkConnectivityAtom);
        return networkConnectivity;
      });

      expect(result.current).toEqual({
        isOnline: true,
        connectionType: 'unknown',
        hasOfflineData: false,
        needsSync: false,
        lastSync: null,
      });
    });
  });

  describe('visitorSessionStatusAtom', () => {
    it('should reflect visitor session status', () => {
      const { result } = renderHookWithProvider(() => {
        const [sessionStatus] = useAtom(visitorSessionStatusAtom);
        return sessionStatus;
      });

      expect(result.current).toEqual({
        hasVisitor: false,
        isComplete: false,
        canPrint: false,
        canCheckIn: false,
        badgePrinted: false,
      });
    });
  });

  describe('errorSummaryAtom', () => {
    it('should summarize errors correctly', () => {
      const { result } = renderHookWithProvider(() => {
        const [errorSummary] = useAtom(errorSummaryAtom);
        return errorSummary;
      });

      expect(result.current).toEqual({
        hasErrors: false,
        errorCount: 0,
        criticalErrors: 0,
        warnings: 0,
        latestError: null,
      });
    });
  });

  describe('loadingSummaryAtom', () => {
    it('should summarize loading states correctly', () => {
      const { result } = renderHookWithProvider(() => {
        const [loadingSummary] = useAtom(loadingSummaryAtom);
        return loadingSummary;
      });

      expect(result.current).toEqual({
        isLoading: false,
        activeLoaders: [],
        loaderCount: 0,
        primaryLoader: null,
      });
    });
  });

  describe('navigationStatusAtom', () => {
    it('should reflect navigation status', () => {
      const { result } = renderHookWithProvider(() => {
        const [navigationStatus] = useAtom(navigationStatusAtom);
        return navigationStatus;
      });

      expect(result.current).toEqual({
        currentScreen: 'welcome',
        canGoBack: false,
        canProceed: true,
        isLastStep: false,
        progress: 0,
        nextScreen: 'checkin',
      });
    });
  });

  describe('dataValidationSummaryAtom', () => {
    it('should summarize data validation', () => {
      const { result } = renderHookWithProvider(() => {
        const [validationSummary] = useAtom(dataValidationSummaryAtom);
        return validationSummary;
      });

      expect(result.current).toEqual({
        sections: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            isValid: expect.any(Boolean),
            errorCount: expect.any(Number),
          }),
        ]),
        totalErrors: expect.any(Number),
        allValid: false,
        ocrValid: false,
      });
    });
  });

  describe('performanceMetricsAtom', () => {
    it('should reflect performance metrics', () => {
      const { result } = renderHookWithProvider(() => {
        const [metrics] = useAtom(performanceMetricsAtom);
        return metrics;
      });

      expect(result.current).toEqual({
        averageProcessingTime: 0,
        errorRate: 0,
        currentLoaders: 0,
        systemUptime: 0,
        totalVisitors: 0,
      });
    });
  });

  describe('accessibilityStatusAtom', () => {
    it('should reflect accessibility status', () => {
      const { result } = renderHookWithProvider(() => {
        const [accessibilityStatus] = useAtom(accessibilityStatusAtom);
        return accessibilityStatus;
      });

      expect(result.current).toEqual({
        screenReader: false,
        keyboardNavigation: true,
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        touchEnabled: expect.any(Boolean),
        keyboardUsed: false,
      });
    });
  });
});


