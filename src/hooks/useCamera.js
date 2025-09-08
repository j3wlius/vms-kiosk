import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import cameraService from '../services/cameraService';
import {
  cameraStatusAtom,
  availableDevicesAtom,
  selectedDevicesAtom,
  cameraSettingsAtom,
} from '../stores/atoms/systemAtoms';

/**
 * useCamera Hook
 * Manages camera device management, capture, and settings
 */
export const useCamera = () => {
  // State atoms
  const setCameraStatus = useSetAtom(cameraStatusAtom);
  const setAvailableDevices = useSetAtom(availableDevicesAtom);
  const setSelectedDevices = useSetAtom(selectedDevicesAtom);
  const setCameraSettings = useSetAtom(cameraSettingsAtom);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [permissions, setPermissions] = useState({
    granted: false,
    denied: false,
    prompt: false,
  });
  const [currentStream, setCurrentStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);

  // Refs
  const videoElementRef = useRef(null);
  const streamRef = useRef(null);

  /**
   * Initialize camera service
   */
  const initialize = useCallback(async () => {
    try {
      setCameraStatus(prev => ({ ...prev, isAvailable: true }));
      setCameraStatus(prev => ({ ...prev, lastError: null }));

      const success = await cameraService.initialize();
      if (success) {
        setIsInitialized(true);
        setCameraStatus(prev => ({ ...prev, isActive: false }));

        // Set up callbacks
        cameraService.onDeviceChange((devices, selectedDevice) => {
          setAvailableDevices(prev => ({ ...prev, cameras: devices }));
          setSelectedDevices(prev => ({ ...prev, camera: selectedDevice }));
        });

        cameraService.onPermissionChange(permissions => {
          setPermissions(permissions);
        });

        cameraService.onError((message, error) => {
          setCameraStatus(prev => ({ ...prev, lastError: message }));
        });

        return true;
      } else {
        throw new Error('Failed to initialize camera service');
      }
    } catch (error) {
      setCameraStatus(prev => ({ ...prev, lastError: error.message }));
      setCameraStatus(prev => ({ ...prev, isActive: false, isAvailable: false }));
      return false;
    }
  }, [setCameraStatus, setAvailableDevices, setSelectedDevices]);

  /**
   * Start camera preview
   * @param {HTMLVideoElement} videoElement - Video element for preview
   * @param {object} options - Camera options
   */
  const startPreview = useCallback(
    async (videoElement, options = {}) => {
      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          return false;
        }
      }

      try {
        setCameraStatus(prev => ({ ...prev, isActive: true }));
        setCameraStatus(prev => ({ ...prev, lastError: null }));

        // Request permissions first
        const permissionSuccess = await cameraService.requestPermissions();
        if (!permissionSuccess) {
          throw new Error('Camera permissions not granted');
        }

        // Get available devices
        const devices = await cameraService.getDevices();
        setAvailableDevices(prev => ({ ...prev, cameras: devices }));

        videoElementRef.current = videoElement;
        const success = await cameraService.startPreview(videoElement, options);

        if (success) {
          setIsActive(true);
          setCameraStatus(prev => ({ ...prev, isActive: true }));

          // Get stream info
          const streamInfo = cameraService.getStreamInfo();
          if (streamInfo) {
            setCameraSettings(prev => ({
              ...prev,
              resolution: {
                width: streamInfo.width,
                height: streamInfo.height,
              },
              frameRate: streamInfo.frameRate,
              facingMode: streamInfo.facingMode,
            }));
          }

          return true;
        } else {
          throw new Error('Failed to start camera preview');
        }
      } catch (error) {
        setCameraStatus(prev => ({ ...prev, lastError: error.message }));
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return false;
      }
    },
    [
      isInitialized,
      initialize,
      setCameraStatus,
      setCameraSettings,
      setAvailableDevices,
    ]
  );

  /**
   * Stop camera preview
   */
  const stopPreview = useCallback(async () => {
    try {
      setCameraStatus(prev => ({ ...prev, isActive: false }));

      const success = await cameraService.stopPreview();
      if (success) {
        setIsActive(false);
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        setCurrentStream(null);
        videoElementRef.current = null;
        return true;
      } else {
        throw new Error('Failed to stop camera preview');
      }
    } catch (error) {
      setCameraStatus(prev => ({ ...prev, lastError: error.message }));
      setCameraStatus(prev => ({ ...prev, isActive: false }));
      return false;
    }
  }, [setCameraStatus]);

  /**
   * Capture image from camera
   * @param {object} options - Capture options
   */
  const captureImage = useCallback(
    async (options = {}) => {
      if (!isActive) {
        setCameraStatus(prev => ({ ...prev, lastError: 'Camera not active' }));
        return null;
      }

      try {
        setCameraStatus(prev => ({ ...prev, isActive: true }));
        setCameraStatus(prev => ({ ...prev, lastError: null }));

        const imageBlob = await cameraService.captureImage(options);

        if (imageBlob) {
          // Add to captured images
          const imageData = {
            id: Date.now().toString(),
            blob: imageBlob,
            timestamp: new Date().toISOString(),
            size: imageBlob.size,
            type: imageBlob.type,
          };

          setCapturedImages(prev => [imageData, ...prev]);
          setCameraStatus(prev => ({ ...prev, isActive: true }));

          return imageData;
        } else {
          throw new Error('Failed to capture image');
        }
      } catch (error) {
        setCameraStatus(prev => ({ ...prev, lastError: error.message }));
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return null;
      }
    },
    [isActive, setCameraStatus]
  );

  /**
   * Capture image as base64
   * @param {object} options - Capture options
   */
  const captureImageAsBase64 = useCallback(
    async (options = {}) => {
      if (!isActive) {
        setCameraStatus(prev => ({ ...prev, lastError: 'Camera not active' }));
        return null;
      }

      try {
        setCameraStatus(prev => ({ ...prev, isActive: true }));
        setCameraStatus(prev => ({ ...prev, lastError: null }));

        const base64Data = await cameraService.captureImageAsBase64(options);

        if (base64Data) {
          setCameraStatus(prev => ({ ...prev, isActive: true }));
          return base64Data;
        } else {
          throw new Error('Failed to capture image as base64');
        }
      } catch (error) {
        setCameraStatus(prev => ({ ...prev, lastError: error.message }));
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return null;
      }
    },
    [isActive, setCameraStatus]
  );

  /**
   * Switch camera device
   * @param {string} deviceId - Device ID to switch to
   */
  const switchDevice = useCallback(
    async deviceId => {
      try {
        setCameraStatus(prev => ({ ...prev, isActive: true }));
        setCameraStatus(prev => ({ ...prev, lastError: null }));

        const success = await cameraService.switchDevice(deviceId);
        if (success) {
          setSelectedDevices(prev => ({ ...prev, camera: deviceId }));
          setCameraStatus(prev => ({ ...prev, isActive: true }));
          return true;
        } else {
          throw new Error('Failed to switch camera device');
        }
      } catch (error) {
        setCameraStatus(prev => ({ ...prev, lastError: error.message }));
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return false;
      }
    },
    [setCameraStatus, setSelectedDevices]
  );

  /**
   * Update camera settings
   * @param {object} settings - New settings
   */
  const updateSettings = useCallback(
    async settings => {
      try {
        setCameraStatus(prev => ({ ...prev, isActive: true }));
        setCameraStatus(prev => ({ ...prev, lastError: null }));

        const success = await cameraService.updateSettings(settings);
        if (success) {
          setCameraSettings(prev => ({ ...prev, ...settings }));
          setCameraStatus(prev => ({ ...prev, isActive: true }));
          return true;
        } else {
          throw new Error('Failed to update camera settings');
        }
      } catch (error) {
        setCameraStatus(prev => ({ ...prev, lastError: error.message }));
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return false;
      }
    },
    [setCameraStatus, setCameraSettings]
  );

  /**
   * Request camera permissions
   */
  const requestPermissions = useCallback(async () => {
    try {
      setCameraStatus(prev => ({ ...prev, isActive: true }));
      setCameraStatus(prev => ({ ...prev, lastError: null }));

      const success = await cameraService.requestPermissions();
      if (success) {
        setPermissions({
          granted: true,
          denied: false,
          prompt: false,
        });
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return true;
      } else {
        setPermissions({
          granted: false,
          denied: true,
          prompt: true,
        });
        setCameraStatus(prev => ({ ...prev, isActive: false }));
        return false;
      }
    } catch (error) {
      setCameraStatus(prev => ({ ...prev, lastError: error.message }));
      setCameraStatus(prev => ({ ...prev, isActive: false }));
      return false;
    }
  }, [setCameraStatus]);

  /**
   * Get available devices
   */
  const getDevices = useCallback(async () => {
    try {
      const devices = await cameraService.getDevices();
      setAvailableDevices(prev => ({ ...prev, cameras: devices }));
      return devices;
    } catch (error) {
      setCameraStatus(prev => ({ ...prev, lastError: error.message }));
      return [];
    }
  }, [setCameraStatus, setAvailableDevices]);

  /**
   * Clear captured images
   */
  const clearCapturedImages = useCallback(() => {
    setCapturedImages([]);
  }, []);

  /**
   * Remove specific captured image
   * @param {string} imageId - Image ID to remove
   */
  const removeCapturedImage = useCallback(imageId => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  /**
   * Get camera status
   */
  const getStatus = useCallback(() => {
    return {
      isInitialized,
      isActive,
      permissions,
      devices: cameraService.getStatus().devices,
      selectedDevice: cameraService.getStatus().selectedDevice,
      settings: cameraService.getStatus().settings,
      capturedImagesCount: capturedImages.length,
    };
  }, [isInitialized, isActive, permissions, capturedImages.length]);

  /**
   * Test camera functionality
   */
  const testCamera = useCallback(async () => {
    try {
      const results = await cameraService.testCamera();
      return results;
    } catch (error) {
      setCameraStatus(prev => ({ ...prev, lastError: error.message }));
      return null;
    }
  }, [setCameraStatus]);

  /**
   * Reset camera state
   */
  const reset = useCallback(() => {
    setIsActive(false);
    setCameraStatus(prev => ({ ...prev, isActive: false }));
    setCameraStatus(prev => ({ ...prev, lastError: null }));
    setCurrentStream(null);
    setCapturedImages([]);
    videoElementRef.current = null;
  }, [setCameraStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopPreview();
      }
    };
  }, [isActive, stopPreview]);

  return {
    // State
    isInitialized,
    isActive,
    permissions,
    capturedImages,
    currentStream,

    // Actions
    initialize,
    startPreview,
    stopPreview,
    captureImage,
    captureImageAsBase64,
    switchDevice,
    updateSettings,
    requestPermissions,
    getDevices,
    clearCapturedImages,
    removeCapturedImage,
    testCamera,
    reset,
    getStatus,
  };
};

/**
 * useCameraCapture Hook
 * Specialized hook for image capture with retry logic
 */
export const useCameraCapture = () => {
  const [captureState, setCaptureState] = useState({
    isCapturing: false,
    lastCapture: null,
    captureHistory: [],
    retryCount: 0,
    maxRetries: 3,
  });

  const { captureImage, captureImageAsBase64, isActive } = useCamera();

  /**
   * Capture image with retry logic
   * @param {object} options - Capture options
   * @param {boolean} asBase64 - Whether to capture as base64
   */
  const captureWithRetry = useCallback(
    async (options = {}, asBase64 = false) => {
      if (!isActive) {
        throw new Error('Camera not active');
      }

      setCaptureState(prev => ({
        ...prev,
        isCapturing: true,
        retryCount: 0,
      }));

      let lastError = null;

      for (let attempt = 0; attempt < captureState.maxRetries; attempt++) {
        try {
          const result = asBase64
            ? await captureImageAsBase64(options)
            : await captureImage(options);

          if (result) {
            setCaptureState(prev => ({
              ...prev,
              isCapturing: false,
              lastCapture: result,
              captureHistory: [result, ...prev.captureHistory.slice(0, 9)], // Keep last 10
              retryCount: 0,
            }));

            return result;
          }
        } catch (error) {
          lastError = error;
          setCaptureState(prev => ({
            ...prev,
            retryCount: attempt + 1,
          }));

          // Wait before retry
          if (attempt < captureState.maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      setCaptureState(prev => ({
        ...prev,
        isCapturing: false,
      }));

      throw lastError || new Error('Capture failed after all retries');
    },
    [isActive, captureImage, captureImageAsBase64, captureState.maxRetries]
  );

  /**
   * Clear capture history
   */
  const clearHistory = useCallback(() => {
    setCaptureState(prev => ({
      ...prev,
      captureHistory: [],
      lastCapture: null,
    }));
  }, []);

  return {
    ...captureState,
    captureWithRetry,
    clearHistory,
  };
};

export default useCamera;