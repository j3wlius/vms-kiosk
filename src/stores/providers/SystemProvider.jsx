import React, { createContext, useContext } from 'react';
import {
  printerStatusAtom,
  printQueueAtom,
  printJobAtom,
  cameraStatusAtom,
  cameraSettingsAtom,
  networkStatusAtom,
  offlineQueueAtom,
  systemHealthAtom,
  systemConfigAtom,
  systemMetricsAtom,
  systemErrorsAtom,
  addSystemErrorAtom,
  resolveSystemErrorAtom,
  systemActionsAtom,
  availableDevicesAtom,
  selectedDevicesAtom,
  systemNotificationsAtom,
  addNotificationAtom,
  dismissNotificationAtom,
  resetSystemAtom,
} from '../atoms/systemAtoms';

// Create context for system-related state
const SystemContext = createContext();

// System Provider Component - just provides context, no separate store
export const SystemProvider = ({ children }) => {
  return (
    <SystemContext.Provider value={null}>
      {children}
    </SystemContext.Provider>
  );
};

// Hook to use system context (simplified)
export const useSystem = () => {
  const context = useContext(SystemContext);
  return context;
};

// Individual hooks for specific system state - return atoms directly
export const usePrinter = () => {
  return {
    printerStatus: printerStatusAtom,
    printQueue: printQueueAtom,
    printJob: printJobAtom,
  };
};

export const useCamera = () => {
  return {
    cameraStatus: cameraStatusAtom,
    cameraSettings: cameraSettingsAtom,
  };
};

export const useNetwork = () => {
  return {
    networkStatus: networkStatusAtom,
    offlineQueue: offlineQueueAtom,
  };
};

export const useSystemHealth = () => {
  return {
    systemHealth: systemHealthAtom,
    systemConfig: systemConfigAtom,
    systemMetrics: systemMetricsAtom,
  };
};

export const useSystemErrors = () => {
  return {
    systemErrors: systemErrorsAtom,
    addSystemError: addSystemErrorAtom,
    resolveSystemError: resolveSystemErrorAtom,
  };
};

export const useSystemActions = () => {
  return {
    systemActions: systemActionsAtom,
  };
};

export const useDevices = () => {
  return {
    availableDevices: availableDevicesAtom,
    selectedDevices: selectedDevicesAtom,
  };
};

export const useSystemNotifications = () => {
  return {
    systemNotifications: systemNotificationsAtom,
    addNotification: addNotificationAtom,
    dismissNotification: dismissNotificationAtom,
  };
};

export const useSystemReset = () => {
  return {
    resetSystem: resetSystemAtom,
  };
};

export default SystemProvider;
