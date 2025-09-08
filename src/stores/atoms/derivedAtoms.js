import { atom } from 'jotai';
import {
  formValidationAtom,
  currentFormStepAtom,
  canProceedAtom,
  visitorBadgeDataAtom,
  ocrProcessingAtom,
  ocrResultsAtom,
} from './visitorAtoms';
import {
  printerStatusAtom,
  printQueueAtom,
  cameraStatusAtom,
  networkStatusAtom,
  offlineQueueAtom,
  systemHealthAtom,
  systemErrorsAtom,
  systemMetricsAtom,
} from './systemAtoms';
import {
  isLoadingAtom,
  loadingStatesAtom,
  errorAtom,
  currentScreenAtom,
  screenHistoryAtom,
  accessibilityAtom,
  themeAtom,
  userInteractionAtom,
} from './uiAtoms';

// form completion status
export const formCompletionAtom = atom(get => {
  const validation = get(formValidationAtom);
  const currentStep = get(currentFormStepAtom);

  const totalSteps = 6;
  const completedSteps = Object.values(validation).filter(
    step => step.isValid
  ).length;

  return {
    currentStep,
    totalSteps,
    completedSteps,
    progress: (completedSteps / totalSteps) * 100,
    isComplete: completedSteps === totalSteps,
    canProceed: get(canProceedAtom),
  };
});

// overall system status
export const overallSystemStatusAtom = atom(get => {
  const printer = get(printerStatusAtom);
  const camera = get(cameraStatusAtom);
  const network = get(networkStatusAtom);
  const health = get(systemHealthAtom);
  const loading = get(isLoadingAtom);
  const error = get(errorAtom);

  const components = {
    printer: printer.isAvailable && printer.isConnected,
    camera: camera.isAvailable && camera.permissions.granted,
    network: network.isOnline,
    system: health.status === 'healthy',
  };

  const allComponentsWorking = Object.values(components).every(Boolean);
  const hasErrors =
    !!error || health.status === 'error' || health.status === 'critical';

  return {
    status: hasErrors ? 'error' : allComponentsWorking ? 'ready' : 'warning',
    components,
    loading,
    error: hasErrors,
    message: hasErrors
      ? 'System has errors'
      : allComponentsWorking
        ? 'All systems ready'
        : 'Some components unavailable',
  };
});

// OCR confidence and processing status
export const ocrStatusAtom = atom(get => {
  const processing = get(ocrProcessingAtom);
  const results = get(ocrResultsAtom);

  return {
    isProcessing: processing.isProcessing,
    progress: processing.progress,
    hasResults: !!results.extractedText,
    confidence: results.confidence,
    isHighConfidence: results.confidence >= 0.7,
    documentType: results.documentType,
    error: processing.error,
  };
});

// Print queue status
export const printQueueStatusAtom = atom(get => {
  const printer = get(printerStatusAtom);
  const printQueue = get(printQueueAtom);

  return {
    isAvailable: printer.isAvailable,
    isPrinting: printer.isPrinting,
    queueLength: printQueue.length,
    canPrint: printer.isAvailable && !printer.isPrinting,
    estimatedTime: printQueue.length * 30, // 30 seconds per print job
    lastError: printer.lastError,
  };
});

// Camera readiness status
export const cameraReadinessAtom = atom(get => {
  const camera = get(cameraStatusAtom);
  const loading = get(loadingStatesAtom);

  return {
    isReady:
      camera.isAvailable && camera.permissions.granted && !loading.camera,
    isInitializing: loading.camera,
    hasDevices: camera.devices.length > 0,
    selectedDevice: camera.selectedDevice,
    permissions: camera.permissions,
    error: camera.lastError,
  };
});

// Network connectivity status
export const networkConnectivityAtom = atom(get => {
  const network = get(networkStatusAtom);
  const offlineQueue = get(offlineQueueAtom);

  return {
    isOnline: network.isOnline,
    connectionType: network.connectionType,
    hasOfflineData: offlineQueue.length > 0,
    needsSync: network.pendingSync,
    lastSync: network.lastSync,
  };
});

// Visitor session status
export const visitorSessionStatusAtom = atom(get => {
  const badgeData = get(visitorBadgeDataAtom);
  const formCompletion = get(formCompletionAtom);
  const systemStatus = get(overallSystemStatusAtom);

  return {
    hasVisitor: !!badgeData,
    isComplete: formCompletion.isComplete,
    canPrint: systemStatus.components.printer && badgeData,
    canCheckIn: formCompletion.isComplete && systemStatus.status === 'ready',
    badgePrinted: badgeData?.badgePrinted || false,
  };
});

// Error summary
export const errorSummaryAtom = atom(get => {
  const error = get(errorAtom);
  const systemHealth = get(systemHealthAtom);
  const systemErrors = get(systemErrorsAtom);

  const allErrors = [
    ...(error ? [error] : []),
    ...systemHealth.errors,
    ...systemErrors.filter(e => !e.resolved),
  ];

  return {
    hasErrors: allErrors.length > 0,
    errorCount: allErrors.length,
    criticalErrors: allErrors.filter(e => e.severity === 'critical').length,
    warnings: allErrors.filter(e => e.severity === 'warning').length,
    latestError: allErrors[0] || null,
  };
});

// Loading summary
export const loadingSummaryAtom = atom(get => {
  const globalLoading = get(isLoadingAtom);
  const loadingStates = get(loadingStatesAtom);

  const activeLoaders = Object.entries(loadingStates)
    .filter(([_, isLoading]) => isLoading)
    .map(([key, _]) => key);

  return {
    isLoading: globalLoading,
    activeLoaders,
    loaderCount: activeLoaders.length,
    primaryLoader: activeLoaders[0] || null,
  };
});

// Screen navigation status
export const navigationStatusAtom = atom(get => {
  const currentScreen = get(currentScreenAtom);
  const screenHistory = get(screenHistoryAtom);
  const formCompletion = get(formCompletionAtom);

  const canGoBack = screenHistory.length > 0;
  const canProceed = get(canProceedAtom);
  const isLastStep =
    formCompletion.currentStep === formCompletion.totalSteps - 1;

  return {
    currentScreen,
    canGoBack,
    canProceed,
    isLastStep,
    progress: formCompletion.progress,
    nextScreen: isLastStep ? 'complete' : getNextScreen(currentScreen),
  };
});

// Helper function for next screen logic
function getNextScreen(currentScreen) {
  const screenFlow = {
    welcome: 'checkin',
    checkin: 'verify',
    verify: 'contact',
    contact: 'print',
    print: 'complete',
  };
  return screenFlow[currentScreen] || 'welcome';
}

// Data validation summary
export const dataValidationSummaryAtom = atom(get => {
  const validation = get(formValidationAtom);
  const ocrStatus = get(ocrStatusAtom);

  const sections = Object.entries(validation).map(([key, section]) => ({
    name: key,
    isValid: section.isValid,
    errorCount: Object.values(section.errors).filter(error => error).length,
  }));

  return {
    sections,
    totalErrors: sections.reduce((sum, section) => sum + section.errorCount, 0),
    allValid: sections.every(section => section.isValid),
    ocrValid: ocrStatus.hasResults && ocrStatus.isHighConfidence,
  };
});

// Performance metrics
export const performanceMetricsAtom = atom(get => {
  const loadingStates = get(loadingStatesAtom);
  const systemMetrics = get(systemMetricsAtom);

  return {
    averageProcessingTime: systemMetrics.averageProcessingTime,
    errorRate: systemMetrics.errorRate,
    currentLoaders: Object.keys(loadingStates).filter(key => loadingStates[key])
      .length,
    systemUptime: systemMetrics.uptime,
    totalVisitors: systemMetrics.totalVisitors,
  };
});

// Accessibility status
export const accessibilityStatusAtom = atom(get => {
  const accessibility = get(accessibilityAtom);
  const theme = get(themeAtom);
  const userInteraction = get(userInteractionAtom);

  return {
    screenReader: accessibility.screenReader,
    keyboardNavigation: accessibility.keyboardNavigation,
    highContrast: theme.highContrast,
    reducedMotion: theme.reducedMotion,
    fontSize: theme.fontSize,
    touchEnabled: userInteraction.touchEnabled,
    keyboardUsed: userInteraction.keyboardUsed,
  };
});
