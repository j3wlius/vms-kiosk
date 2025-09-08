import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { printingService } from '../services';
import {
  printerStatusAtom,
  printerErrorAtom,
  printQueueAtom,
  currentPrintJobAtom,
  printerSettingsAtom,
} from '../stores/atoms/systemAtoms';

/**
 * usePrinter Hook
 * Manages print job management, queue status, and printer settings
 */
export const usePrinter = () => {
  // State atoms
  const setPrinterStatus = useSetAtom(printerStatusAtom);
  const setPrinterError = useSetAtom(printerErrorAtom);
  const setPrintQueue = useSetAtom(printQueueAtom);
  const setCurrentPrintJob = useSetAtom(currentPrintJobAtom);
  const setPrinterSettings = useSetAtom(printerSettingsAtom);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printHistory, setPrintHistory] = useState([]);
  const [templates, setTemplates] = useState({});

  // Refs
  const statusCallbackRef = useRef(null);
  const jobCompleteCallbackRef = useRef(null);
  const errorCallbackRef = useRef(null);

  /**
   * Initialize printing service
   */
  const initialize = useCallback(async () => {
    try {
      setPrinterStatus('initializing');
      setPrinterError(null);

      const success = await printingService.initialize();
      if (success) {
        setIsInitialized(true);
        setPrinterStatus('ready');

        // Set up callbacks
        statusCallbackRef.current = status => {
          setPrintQueue(status);
          setIsPrinting(status.isPrinting);
          setCurrentPrintJob(status.currentJob);
        };

        jobCompleteCallbackRef.current = job => {
          setPrintHistory(prev => [job, ...prev.slice(0, 49)]); // Keep last 50 jobs
        };

        errorCallbackRef.current = (message, error) => {
          setPrinterError(message);
        };

        printingService.onStatusChange(statusCallbackRef.current);
        printingService.onJobComplete(jobCompleteCallbackRef.current);
        printingService.onError(errorCallbackRef.current);

        // Load available templates
        const availableTemplates = {
          default: {
            name: 'Default Badge',
            description: 'Standard visitor badge template',
            width: 85,
            height: 54,
            qrSize: 40,
          },
          compact: {
            name: 'Compact Badge',
            description: 'Smaller badge for limited space',
            width: 70,
            height: 45,
            qrSize: 30,
          },
          large: {
            name: 'Large Badge',
            description: 'Larger badge with more information',
            width: 100,
            height: 65,
            qrSize: 50,
          },
        };

        setTemplates(availableTemplates);

        return true;
      } else {
        throw new Error('Failed to initialize printing service');
      }
    } catch (error) {
      setPrinterError(error.message);
      setPrinterStatus('error');
      return false;
    }
  }, [setPrinterStatus, setPrinterError, setPrintQueue, setCurrentPrintJob]);

  /**
   * Print visitor badge
   * @param {object} visitorData - Visitor data
   * @param {object} options - Print options
   */
  const printBadge = useCallback(
    async (visitorData, options = {}) => {
      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          return null;
        }
      }

      try {
        setPrinterStatus('printing');
        setPrinterError(null);

        const jobId = await printingService.printBadge(visitorData, options);

        if (jobId) {
          setPrinterStatus('ready');
          return jobId;
        } else {
          throw new Error('Failed to create print job');
        }
      } catch (error) {
        setPrinterError(error.message);
        setPrinterStatus('error');
        return null;
      }
    },
    [isInitialized, initialize, setPrinterStatus, setPrinterError]
  );

  /**
   * Print badge immediately (bypass queue)
   * @param {object} visitorData - Visitor data
   * @param {object} options - Print options
   */
  const printBadgeImmediate = useCallback(
    async (visitorData, options = {}) => {
      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          return null;
        }
      }

      try {
        setPrinterStatus('printing');
        setPrinterError(null);

        const jobId = await printingService.printBadge(visitorData, {
          ...options,
          immediate: true,
        });

        if (jobId) {
          setPrinterStatus('ready');
          return jobId;
        } else {
          throw new Error('Failed to print badge immediately');
        }
      } catch (error) {
        setPrinterError(error.message);
        setPrinterStatus('error');
        return null;
      }
    },
    [isInitialized, initialize, setPrinterStatus, setPrinterError]
  );

  /**
   * Get print queue status
   */
  const getQueueStatus = useCallback(() => {
    return printingService.getQueueStatus();
  }, []);

  /**
   * Clear print queue
   */
  const clearQueue = useCallback(() => {
    try {
      printingService.clearQueue();
      setPrintQueue({
        isPrinting: false,
        queueLength: 0,
        currentJob: null,
        isAvailable: true,
      });
      return true;
    } catch (error) {
      setPrinterError(error.message);
      return false;
    }
  }, [setPrinterError, setPrintQueue]);

  /**
   * Cancel specific print job
   * @param {string} jobId - Job ID to cancel
   */
  const cancelJob = useCallback(
    jobId => {
      try {
        const success = printingService.cancelJob(jobId);
        if (success) {
          return true;
        } else {
          setPrinterError('Job not found or already completed');
          return false;
        }
      } catch (error) {
        setPrinterError(error.message);
        return false;
      }
    },
    [setPrinterError]
  );

  /**
   * Update printer settings
   * @param {object} settings - New settings
   */
  const updateSettings = useCallback(
    settings => {
      try {
        printingService.updateSettings(settings);
        setPrinterSettings(prev => ({ ...prev, ...settings }));
        return true;
      } catch (error) {
        setPrinterError(error.message);
        return false;
      }
    },
    [setPrinterError, setPrinterSettings]
  );

  /**
   * Get printer status
   */
  const getStatus = useCallback(() => {
    const queueStatus = printingService.getQueueStatus();
    return {
      isInitialized,
      isPrinting: queueStatus.isPrinting,
      queueLength: queueStatus.queueLength,
      currentJob: queueStatus.currentJob,
      isAvailable: queueStatus.isAvailable,
      printHistoryCount: printHistory.length,
    };
  }, [isInitialized, printHistory.length]);

  /**
   * Test printing functionality
   */
  const testPrinting = useCallback(async () => {
    try {
      const results = await printingService.testPrinting();
      return results;
    } catch (error) {
      setPrinterError(error.message);
      return null;
    }
  }, [setPrinterError]);

  /**
   * Clear print history
   */
  const clearHistory = useCallback(() => {
    setPrintHistory([]);
  }, []);

  /**
   * Reset printer state
   */
  const reset = useCallback(() => {
    setIsPrinting(false);
    setPrinterStatus('ready');
    setPrinterError(null);
    setPrintQueue({
      isPrinting: false,
      queueLength: 0,
      currentJob: null,
      isAvailable: true,
    });
    setCurrentPrintJob(null);
  }, [setPrinterStatus, setPrinterError, setPrintQueue, setCurrentPrintJob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isPrinting) {
        clearQueue();
      }
    };
  }, [isPrinting, clearQueue]);

  return {
    // State
    isInitialized,
    isPrinting,
    printHistory,
    templates,

    // Actions
    initialize,
    printBadge,
    printBadgeImmediate,
    getQueueStatus,
    clearQueue,
    cancelJob,
    updateSettings,
    testPrinting,
    clearHistory,
    reset,
    getStatus,
  };
};

/**
 * usePrintQueue Hook
 * Specialized hook for print queue management
 */
export const usePrintQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  });

  const { getQueueStatus, clearQueue, cancelJob } = usePrinter();

  /**
   * Refresh queue status
   */
  const refreshQueue = useCallback(() => {
    const status = getQueueStatus();
    setQueue(prev => {
      // Update queue based on status
      const newQueue = [...prev];
      return newQueue;
    });

    setQueueStats(prev => ({
      ...prev,
      total: status.queueLength,
      pending: status.queueLength,
      isProcessing: status.isPrinting,
    }));
  }, [getQueueStatus]);

  /**
   * Add job to queue
   * @param {object} jobData - Job data
   */
  const addJob = useCallback(jobData => {
    const job = {
      id: Date.now().toString(),
      ...jobData,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    setQueue(prev => [job, ...prev]);
    setQueueStats(prev => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1,
    }));

    return job.id;
  }, []);

  /**
   * Update job status
   * @param {string} jobId - Job ID
   * @param {string} status - New status
   */
  const updateJobStatus = useCallback((jobId, status) => {
    setQueue(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status } : job))
    );

    setQueueStats(prev => {
      const newStats = { ...prev };
      if (status === 'completed') {
        newStats.completed += 1;
        newStats.pending -= 1;
      } else if (status === 'failed') {
        newStats.failed += 1;
        newStats.pending -= 1;
      }
      return newStats;
    });
  }, []);

  /**
   * Remove job from queue
   * @param {string} jobId - Job ID
   */
  const removeJob = useCallback(jobId => {
    setQueue(prev => prev.filter(job => job.id !== jobId));
    setQueueStats(prev => ({
      ...prev,
      total: prev.total - 1,
      pending: Math.max(0, prev.pending - 1),
    }));
  }, []);

  /**
   * Clear all jobs
   */
  const clearAllJobs = useCallback(() => {
    setQueue([]);
    setQueueStats({
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    });
    clearQueue();
  }, [clearQueue]);

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   */
  const getJob = useCallback(
    jobId => {
      return queue.find(job => job.id === jobId);
    },
    [queue]
  );

  /**
   * Get jobs by status
   * @param {string} status - Job status
   */
  const getJobsByStatus = useCallback(
    status => {
      return queue.filter(job => job.status === status);
    },
    [queue]
  );

  return {
    // State
    queue,
    isProcessing,
    queueStats,

    // Actions
    refreshQueue,
    addJob,
    updateJobStatus,
    removeJob,
    clearAllJobs,
    getJob,
    getJobsByStatus,
  };
};

/**
 * usePrintTemplates Hook
 * Specialized hook for print template management
 */
export const usePrintTemplates = () => {
  const [templates, setTemplates] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState('default');
  const [templateSettings, setTemplateSettings] = useState({});

  /**
   * Load available templates
   */
  const loadTemplates = useCallback(() => {
    const availableTemplates = {
      default: {
        name: 'Default Badge',
        description: 'Standard visitor badge template',
        width: 85,
        height: 54,
        qrSize: 40,
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
      },
      compact: {
        name: 'Compact Badge',
        description: 'Smaller badge for limited space',
        width: 70,
        height: 45,
        qrSize: 30,
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
      },
      large: {
        name: 'Large Badge',
        description: 'Larger badge with more information',
        width: 100,
        height: 65,
        qrSize: 50,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
      },
    };

    setTemplates(availableTemplates);
    return availableTemplates;
  }, []);

  /**
   * Set current template
   * @param {string} templateName - Template name
   */
  const setTemplate = useCallback(
    templateName => {
      if (templates[templateName]) {
        setCurrentTemplate(templateName);
        setTemplateSettings(templates[templateName]);
      }
    },
    [templates]
  );

  /**
   * Update template settings
   * @param {object} settings - New settings
   */
  const updateTemplateSettings = useCallback(settings => {
    setTemplateSettings(prev => ({ ...prev, ...settings }));
  }, []);

  /**
   * Get template configuration
   * @param {string} templateName - Template name
   */
  const getTemplate = useCallback(
    (templateName = currentTemplate) => {
      return templates[templateName] || templates.default;
    },
    [templates, currentTemplate]
  );

  return {
    // State
    templates,
    currentTemplate,
    templateSettings,

    // Actions
    loadTemplates,
    setTemplate,
    updateTemplateSettings,
    getTemplate,
  };
};

export default usePrinter;


