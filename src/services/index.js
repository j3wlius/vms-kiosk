// Main services exports
export { default as storageService } from './storageService';
export { default as apiService } from './apiService';
export { default as cameraService } from './cameraService';
export { default as ocrService } from './ocrService';
export { default as printingService } from './printingService';
export { default as documentDetectionService } from './documentDetectionService';

// Service configuration
export const serviceConfig = {
  storage: {
    encryptionKey: 'kiosk_encryption_key',
    retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    prefix: 'kiosk_visitor_',
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  camera: {
    defaultResolution: { width: 1280, height: 720 },
    defaultQuality: 0.8,
    defaultFacingMode: 'environment',
  },
  ocr: {
    language: 'eng',
    confidenceThreshold: 0.7,
    preprocessing: {
      enhance: true,
      denoise: true,
      deskew: true,
    },
  },
  printing: {
    paperSize: 'A4',
    orientation: 'portrait',
    quality: 'high',
    defaultTemplate: 'default',
  },
};

// Service initialization helper
export const initializeServices = async () => {
  const results = {
    storage: false,
    api: false,
    camera: false,
    ocr: false,
    printing: false,
  };

  try {
    // Initialize storage service
    results.storage = storageService.isStorageAvailable();
  } catch (error) {
    console.error('Storage service initialization failed:', error);
  }

  try {
    // Initialize API service (no async init needed)
    results.api = true;
  } catch (error) {
    console.error('API service initialization failed:', error);
  }

  try {
    // Initialize camera service
    results.camera = await cameraService.initialize();
  } catch (error) {
    console.error('Camera service initialization failed:', error);
  }

  try {
    // Initialize OCR service
    results.ocr = await ocrService.initialize();
  } catch (error) {
    console.error('OCR service initialization failed:', error);
  }

  try {
    // Initialize printing service
    results.printing = await printingService.initialize();
  } catch (error) {
    console.error('Printing service initialization failed:', error);
  }

  return results;
};

// Service health check
export const checkServiceHealth = async () => {
  const health = {
    storage: storageService.isStorageAvailable(),
    api: await apiService.checkAPIHealth(),
    camera: cameraService.getStatus().isInitialized,
    ocr: ocrService.getStatus().isInitialized,
    printing: printingService.getQueueStatus().isAvailable,
    overall: false,
  };

  health.overall = Object.values(health).every(status => status === true);
  return health;
};

// Service cleanup helper
export const cleanupServices = async () => {
  try {
    await cameraService.cleanup();
    await ocrService.terminate();
    printingService.cleanup();
    console.log('All services cleaned up successfully');
  } catch (error) {
    console.error('Service cleanup failed:', error);
  }
};
