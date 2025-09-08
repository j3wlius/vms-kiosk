import { atom } from 'jotai';

// Test atom to verify Jotai is working
export const testAtom = atom('test');

// Simple test atom
export const simpleTestAtom = atom('simple test');

// Very simple atom for debugging
export const debugAtom = atom('debug');

// Printer status atoms
export const printerStatusAtom = atom({
  isAvailable: false,
  isConnected: false,
  isPrinting: false,
  queueLength: 0,
  lastError: null,
  deviceInfo: null,
});

export const printerErrorAtom = atom(null);

export const printQueueAtom = atom([]);

export const printJobAtom = atom({
  id: null,
  status: 'idle', // 'idle', 'printing', 'completed', 'failed'
  progress: 0,
  error: null,
  data: null,
});

export const currentPrintJobAtom = atom(null);

export const printerSettingsAtom = atom({
  defaultPrinter: null,
  paperSize: 'A4',
  orientation: 'portrait',
  quality: 'high',
});

// Camera status atoms
export const cameraStatusAtom = atom({
  isAvailable: false,
  isActive: false,
  devices: [],
  selectedDevice: null,
  lastError: null,
  permissions: {
    granted: false,
    denied: false,
    prompt: false,
  },
});

// Scanning activity atom to prevent idle screen during scanning
export const scanningActivityAtom = atom({
  isScanning: false,
  isAutoScanning: false,
  isProcessing: false,
  lastActivity: Date.now(),
});

export const cameraErrorAtom = atom(null);

export const cameraSettingsAtom = atom({
  resolution: { width: 1280, height: 720 },
  quality: 0.8,
  facingMode: 'environment', // 'user', 'environment'
  flashMode: 'off', // 'off', 'on', 'auto'
});

// Network status atoms
export const networkStatusAtom = atom({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  connectionType: 'unknown', // 'wifi', 'ethernet', 'cellular', 'unknown'
  lastCheck: null,
  lastSync: null,
  pendingSync: false,
});

export const offlineQueueAtom = atom([]);

// Sync status atoms
export const syncStatusAtom = atom('idle'); // 'idle', 'syncing', 'synced', 'sync_failed', 'partial_sync', 'offline'
export const syncProgressAtom = atom(0); // 0-100

// System health atoms
export const systemHealthAtom = atom({
  status: 'healthy', // 'healthy', 'warning', 'error', 'critical'
  lastCheck: null,
  components: {
    printer: 'unknown',
    camera: 'unknown',
    network: 'unknown',
    storage: 'unknown',
  },
  errors: [],
  warnings: [],
});

// System configuration atoms
export const systemConfigAtom = atom({
  kioskId: null,
  location: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  autoLogout: 30, // minutes
  badgeTemplate: 'default',
  ocrSettings: {
    confidenceThreshold: 0.7,
    documentTypes: ['drivers_license', 'passport', 'national_id'],
    preprocessing: {
      enhance: true,
      denoise: true,
      deskew: true,
    },
  },
  cameraSettings: {
    autoCapture: false,
    captureDelay: 2000, // milliseconds
    retryAttempts: 3,
  },
  printerSettings: {
    defaultPrinter: null,
    paperSize: 'A4',
    orientation: 'portrait',
    quality: 'high',
  },
});

// System monitoring atoms
export const systemMetricsAtom = atom({
  uptime: 0,
  totalVisitors: 0,
  todayVisitors: 0,
  averageProcessingTime: 0,
  errorRate: 0,
  lastReset: null,
});

// Error handling atoms
export const systemErrorsAtom = atom([]);

export const addSystemErrorAtom = atom(null, (get, set, error) => {
  const errors = get(systemErrorsAtom);
  const newError = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type: error.type || 'unknown',
    message: error.message,
    component: error.component || 'system',
    severity: error.severity || 'error',
    resolved: false,
  };
  set(systemErrorsAtom, [...errors, newError]);
});

export const resolveSystemErrorAtom = atom(null, (get, set, errorId) => {
  const errors = get(systemErrorsAtom);
  set(
    systemErrorsAtom,
    errors.map(error =>
      error.id === errorId ? { ...error, resolved: true } : error
    )
  );
});

// System actions atoms
export const systemActionsAtom = atom({
  restart: false,
  shutdown: false,
  maintenance: false,
  update: false,
});

// Device management atoms
export const availableDevicesAtom = atom({
  cameras: [],
  printers: [],
  lastScan: null,
});

export const selectedDevicesAtom = atom({
  camera: null,
  printer: null,
});

// System notifications atoms
export const systemNotificationsAtom = atom([]);

export const addNotificationAtom = atom(null, (get, set, notification) => {
  const notifications = get(systemNotificationsAtom);
  const newNotification = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type: notification.type || 'info', // 'info', 'warning', 'error', 'success'
    title: notification.title,
    message: notification.message,
    duration: notification.duration || 5000,
    persistent: notification.persistent || false,
    dismissed: false,
  };
  set(systemNotificationsAtom, [...notifications, newNotification]);
});

export const dismissNotificationAtom = atom(
  null,
  (get, set, notificationId) => {
    const notifications = get(systemNotificationsAtom);
    set(
      systemNotificationsAtom,
      notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, dismissed: true }
          : notification
      )
    );
  }
);

// System reset atom
export const resetSystemAtom = atom(null, (get, set) => {
  set(printerStatusAtom, {
    isAvailable: false,
    isConnected: false,
    isPrinting: false,
    queueLength: 0,
    lastError: null,
    deviceInfo: null,
  });
  set(printQueueAtom, []);
  set(cameraStatusAtom, {
    isAvailable: false,
    isActive: false,
    devices: [],
    selectedDevice: null,
    lastError: null,
    permissions: {
      granted: false,
      denied: false,
      prompt: false,
    },
  });
  set(systemHealthAtom, {
    status: 'healthy',
    lastCheck: null,
    components: {
      printer: 'unknown',
      camera: 'unknown',
      network: 'unknown',
      storage: 'unknown',
    },
    errors: [],
    warnings: [],
  });
  set(systemErrorsAtom, []);
  set(systemNotificationsAtom, []);
});
