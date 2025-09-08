import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { apiService, storageService } from '../services';
import {
  networkStatusAtom,
  offlineQueueAtom,
  syncStatusAtom,
  syncProgressAtom,
} from '../stores/atoms/systemAtoms';

/**
 * useOfflineSync Hook
 * Manages network status, offline data synchronization, and conflict resolution
 */
export const useOfflineSync = () => {
  // State atoms
  const setNetworkStatus = useSetAtom(networkStatusAtom);
  const setOfflineQueue = useSetAtom(offlineQueueAtom);
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setSyncProgress = useSetAtom(syncProgressAtom);

  // Local state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);
  const [conflictResolution, setConflictResolution] = useState('server_wins'); // 'server_wins', 'client_wins', 'merge'
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60000); // 1 minute

  // Refs
  const syncIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  /**
   * Update network status
   */
  const updateNetworkStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    setNetworkStatus({
      isOnline: online,
      lastCheck: Date.now(),
      connectionType: navigator.connection?.effectiveType || 'unknown',
    });

    if (online && !isOnline) {
      // Just came back online, trigger sync
      triggerSync();
    }
  }, [isOnline, setNetworkStatus]);

  /**
   * Trigger data synchronization
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return { success: false, error: 'Device is offline' };
    }

    try {
      setSyncStatus('syncing');
      setSyncProgress(0);
      setSyncErrors([]);

      // Get offline queue
      const offlineQueue = storageService.getOfflineQueue();
      if (offlineQueue.length === 0) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());
        return { success: true, synced: 0 };
      }

      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each offline action
      for (let i = 0; i < offlineQueue.length; i++) {
        const action = offlineQueue[i];
        setSyncProgress((i / offlineQueue.length) * 100);

        try {
          await processOfflineAction(action);
          syncedCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            actionId: action.id,
            actionType: action.type,
            error: error.message,
            timestamp: Date.now(),
          });
        }
      }

      // Update sync status
      if (errorCount === 0) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());
        retryCountRef.current = 0;
      } else if (syncedCount > 0) {
        setSyncStatus('partial_sync');
        setLastSyncTime(Date.now());
      } else {
        setSyncStatus('sync_failed');
        retryCountRef.current++;
      }

      setSyncErrors(errors);
      setSyncProgress(100);

      return {
        success: errorCount === 0,
        synced: syncedCount,
        errors: errorCount,
        errorDetails: errors,
      };
    } catch (error) {
      setSyncStatus('sync_failed');
      setSyncErrors([
        {
          actionId: 'general',
          actionType: 'sync',
          error: error.message,
          timestamp: Date.now(),
        },
      ]);
      return { success: false, error: error.message };
    }
  }, [
    isOnline,
    setSyncStatus,
    setSyncProgress,
    setSyncErrors,
    setLastSyncTime,
  ]);

  /**
   * Process individual offline action
   * @param {object} action - Offline action to process
   */
  const processOfflineAction = useCallback(async action => {
    switch (action.type) {
      case 'api_request':
        return await processAPIRequest(action);
      case 'visitor_data':
        return await processVisitorData(action);
      case 'session_data':
        return await processSessionData(action);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }, []);

  /**
   * Process API request action
   * @param {object} action - API request action
   */
  const processAPIRequest = useCallback(async action => {
    const { method, endpoint, data, headers } = action;

    // Make API request
    const response = await apiService.request(endpoint, {
      method,
      data,
      headers,
    });

    return response;
  }, []);

  /**
   * Process visitor data action
   * @param {object} action - Visitor data action
   */
  const processVisitorData = useCallback(async action => {
    const { visitorData, operation } = action;

    switch (operation) {
      case 'create':
        return await apiService.createVisitor(visitorData);
      case 'update':
        return await apiService.updateVisitor(visitorData.id, visitorData);
      case 'delete':
        return await apiService.deleteVisitor(visitorData.id);
      default:
        throw new Error(`Unknown visitor operation: ${operation}`);
    }
  }, []);

  /**
   * Process session data action
   * @param {object} action - Session data action
   */
  const processSessionData = useCallback(async action => {
    const { sessionData, operation } = action;

    // For now, just log session data sync
    // In a real app, you might want to sync session data to the server
    console.log('Syncing session data:', operation, sessionData);

    return { success: true };
  }, []);

  /**
   * Start automatic synchronization
   */
  const startAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      if (isOnline && autoSyncEnabled) {
        triggerSync();
      }
    }, syncInterval);
  }, [isOnline, autoSyncEnabled, syncInterval, triggerSync]);

  /**
   * Stop automatic synchronization
   */
  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  /**
   * Retry failed synchronization
   */
  const retrySync = useCallback(async () => {
    if (retryCountRef.current >= maxRetries) {
      setSyncStatus('max_retries_exceeded');
      return { success: false, error: 'Maximum retries exceeded' };
    }

    // Wait before retry (exponential backoff)
    const delay = Math.pow(2, retryCountRef.current) * 1000;

    return new Promise(resolve => {
      retryTimeoutRef.current = setTimeout(async () => {
        const result = await triggerSync();
        resolve(result);
      }, delay);
    });
  }, [triggerSync, maxRetries]);

  /**
   * Resolve data conflicts
   * @param {object} localData - Local data
   * @param {object} serverData - Server data
   * @param {string} resolution - Resolution strategy
   */
  const resolveConflict = useCallback(
    (localData, serverData, resolution = conflictResolution) => {
      switch (resolution) {
        case 'server_wins':
          return serverData;
        case 'client_wins':
          return localData;
        case 'merge':
          return {
            ...serverData,
            ...localData,
            lastModified: new Date().toISOString(),
            conflictResolved: true,
          };
        default:
          return serverData;
      }
    },
    [conflictResolution]
  );

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback(() => {
    return {
      isOnline,
      syncStatus: useAtomValue(syncStatusAtom),
      lastSyncTime,
      syncErrors,
      offlineQueueLength: storageService.getOfflineQueue().length,
      autoSyncEnabled,
      syncInterval,
      retryCount: retryCountRef.current,
    };
  }, [isOnline, lastSyncTime, syncErrors, autoSyncEnabled, syncInterval]);

  /**
   * Clear sync errors
   */
  const clearSyncErrors = useCallback(() => {
    setSyncErrors([]);
    retryCountRef.current = 0;
  }, []);

  /**
   * Force sync all data
   */
  const forceSync = useCallback(async () => {
    clearSyncErrors();
    return await triggerSync();
  }, [clearSyncErrors, triggerSync]);

  /**
   * Get offline queue status
   */
  const getOfflineQueueStatus = useCallback(() => {
    const queue = storageService.getOfflineQueue();
    return {
      length: queue.length,
      actions: queue.map(action => ({
        id: action.id,
        type: action.type,
        timestamp: action.timestamp,
        status: 'pending',
      })),
    };
  }, []);

  /**
   * Clear offline queue
   */
  const clearOfflineQueue = useCallback(() => {
    storageService.clearOfflineQueue();
    setOfflineQueue([]);
  }, [setOfflineQueue]);

  /**
   * Set conflict resolution strategy
   * @param {string} strategy - Resolution strategy
   */
  const setConflictResolutionStrategy = useCallback(strategy => {
    setConflictResolution(strategy);
  }, []);

  /**
   * Update sync settings
   * @param {object} settings - New sync settings
   */
  const updateSyncSettings = useCallback(settings => {
    if (settings.autoSyncEnabled !== undefined) {
      setAutoSyncEnabled(settings.autoSyncEnabled);
    }

    if (settings.syncInterval !== undefined) {
      setSyncInterval(settings.syncInterval);
    }

    if (settings.conflictResolution !== undefined) {
      setConflictResolution(settings.conflictResolution);
    }
  }, []);

  // Set up network status listeners
  useEffect(() => {
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial status check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [updateNetworkStatus]);

  // Start auto-sync when online
  useEffect(() => {
    if (isOnline && autoSyncEnabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [isOnline, autoSyncEnabled, startAutoSync, stopAutoSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSync();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [stopAutoSync]);

  return {
    // State
    isOnline,
    lastSyncTime,
    syncErrors,
    conflictResolution,
    autoSyncEnabled,
    syncInterval,

    // Actions
    triggerSync,
    retrySync,
    forceSync,
    resolveConflict,
    clearSyncErrors,
    getSyncStatus,
    getOfflineQueueStatus,
    clearOfflineQueue,
    setConflictResolutionStrategy,
    updateSyncSettings,
    startAutoSync,
    stopAutoSync,
  };
};

/**
 * useNetworkStatus Hook
 * Specialized hook for network status monitoring
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [lastOnlineTime, setLastOnlineTime] = useState(null);
  const [lastOfflineTime, setLastOfflineTime] = useState(null);

  /**
   * Update network status
   */
  const updateStatus = useCallback(() => {
    const online = navigator.onLine;
    const connection = navigator.connection;

    setIsOnline(online);
    setConnectionType(connection?.effectiveType || 'unknown');

    if (online) {
      setLastOnlineTime(Date.now());
    } else {
      setLastOfflineTime(Date.now());
    }
  }, []);

  /**
   * Get connection quality
   */
  const getConnectionQuality = useCallback(() => {
    if (!navigator.connection) {
      return 'unknown';
    }

    const { effectiveType, downlink, rtt } = navigator.connection;

    if (effectiveType === '4g' && downlink > 2 && rtt < 100) {
      return 'excellent';
    } else if (effectiveType === '4g' && downlink > 1 && rtt < 200) {
      return 'good';
    } else if (
      effectiveType === '3g' ||
      (effectiveType === '4g' && downlink < 1)
    ) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, []);

  /**
   * Get network statistics
   */
  const getNetworkStats = useCallback(() => {
    return {
      isOnline,
      connectionType,
      lastOnlineTime,
      lastOfflineTime,
      quality: getConnectionQuality(),
      connection: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
          }
        : null,
    };
  }, [
    isOnline,
    connectionType,
    lastOnlineTime,
    lastOfflineTime,
    getConnectionQuality,
  ]);

  // Set up listeners
  useEffect(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Initial status check
    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [updateStatus]);

  return {
    isOnline,
    connectionType,
    lastOnlineTime,
    lastOfflineTime,
    getConnectionQuality,
    getNetworkStats,
  };
};

export default useOfflineSync;


