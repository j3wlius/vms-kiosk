/**
 * Camera Service
 * WebRTC integration with device management and image capture
 */
class CameraService {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.devices = [];
    this.selectedDevice = null;
    this.isActive = false;
    this.permissions = {
      granted: false,
      denied: false,
      prompt: false,
    };
    this.settings = {
      resolution: { width: 1280, height: 720 },
      quality: 0.8,
      facingMode: 'environment',
      flashMode: 'off',
    };
    this.callbacks = {
      onDeviceChange: null,
      onPermissionChange: null,
      onError: null,
    };
    this.deviceChangeListener = null;
    this.enumerationTimeout = null;
  }

  /**
   * Initialize camera service
   * @param {object} options - Initialization options
   * @returns {Promise<boolean>} Success status
   */
  async initialize(options = {}) {
    try {
      this.settings = { ...this.settings, ...options.settings };

      // Check for camera support
      if (!this.isSupported()) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('Camera service initialized successfully');
      return true;
    } catch (error) {
      this.handleError('Camera initialization failed', error);
      return false;
    }
  }

  /**
   * Check if camera is supported
   * @returns {boolean} Support status
   */
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check if any camera devices are available
   * @returns {Promise<boolean>} Device availability
   */
  async hasAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices.length > 0;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   * @returns {Promise<boolean>} Permission granted
   */
  async requestPermissions() {
    try {
      // First, try to get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Try with basic constraints first
      let constraints = {
        video: {
          width: { ideal: this.settings.resolution.width },
          height: { ideal: this.settings.resolution.height },
          facingMode: this.settings.facingMode,
        },
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // If facingMode fails, try without it
        if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
          console.log('Trying without facingMode constraint...');
          constraints = {
            video: {
              width: { ideal: this.settings.resolution.width },
              height: { ideal: this.settings.resolution.height },
            },
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          throw error;
        }
      }

      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());

      this.permissions = {
        granted: true,
        denied: false,
        prompt: false,
      };

      this.notifyPermissionChange();
      return true;
    } catch (error) {
      this.permissions = {
        granted: false,
        denied: error.name === 'NotAllowedError',
        prompt: error.name === 'NotAllowedError',
      };

      this.notifyPermissionChange();
      this.handleError('Permission denied', error);
      return false;
    }
  }

  /**
   * Get available camera devices
   * @returns {Promise<Array>} Available devices
   */
  async getDevices() {
    try {
      console.log('Enumerating camera devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('All devices:', devices);
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Video devices found:', videoDevices);
      
      this.devices = videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        groupId: device.groupId,
      }));

      console.log('Processed devices:', this.devices);

      // Select first device if none selected
      if (!this.selectedDevice && this.devices.length > 0) {
        this.selectedDevice = this.devices[0].deviceId;
        console.log('Selected device:', this.selectedDevice);
      }

      return this.devices;
    } catch (error) {
      this.handleError('Failed to get devices', error);
      return [];
    }
  }

  /**
   * Start camera preview
   * @param {HTMLVideoElement} videoElement - Video element for preview
   * @param {object} options - Camera options
   * @returns {Promise<boolean>} Success status
   */
  async startPreview(videoElement, options = {}) {
    try {
      if (this.isActive) {
        await this.stopPreview();
      }

      this.videoElement = videoElement;
      let constraints = this.buildConstraints(options);

      // Try to get stream with constraints
      let stream;
      try {
        console.log('Attempting to get media stream with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Successfully got media stream');
      } catch (error) {
        console.log('First attempt failed:', error.name, error.message);
        
        // Try different constraint combinations for DroidCam compatibility
        const fallbackConstraints = [
          // Try without device ID
          {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          // Try with minimal constraints
          {
            video: {
              width: { min: 320, ideal: 640 },
              height: { min: 240, ideal: 480 },
            },
          },
          // Try with just basic video
          {
            video: true,
          },
          // Try with specific device but no other constraints
          this.selectedDevice ? {
            video: {
              deviceId: { exact: this.selectedDevice },
            },
          } : null,
        ].filter(Boolean);

        for (let i = 0; i < fallbackConstraints.length; i++) {
          try {
            console.log(`Trying fallback constraint ${i + 1}:`, fallbackConstraints[i]);
            stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints[i]);
            console.log(`Success with fallback constraint ${i + 1}`);
            break;
          } catch (fallbackError) {
            console.log(`Fallback ${i + 1} failed:`, fallbackError.name, fallbackError.message);
            if (i === fallbackConstraints.length - 1) {
              throw error; // Throw original error if all fallbacks fail
            }
          }
        }
      }

      this.stream = stream;

      // Set video element source
      this.videoElement.srcObject = this.stream;

      // Wait for video to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 10000);
        
        this.videoElement.onloadedmetadata = () => {
          clearTimeout(timeout);
          // Force play the video
          this.videoElement.play().then(() => {
            resolve();
          }).catch(reject);
        };
        
        this.videoElement.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error('Video element error: ' + error.message));
        };
        
        this.videoElement.oncanplay = () => {
          clearTimeout(timeout);
          resolve();
        };
      });

      this.isActive = true;
      return true;
    } catch (error) {
      this.handleError('Failed to start preview', error);
      return false;
    }
  }

  /**
   * Stop camera preview
   * @returns {Promise<boolean>} Success status
   */
  async stopPreview() {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }

      this.isActive = false;
      return true;
    } catch (error) {
      this.handleError('Failed to stop preview', error);
      return false;
    }
  }

  /**
   * Capture image from camera
   * @param {object} options - Capture options
   * @returns {Promise<Blob>} Captured image blob
   */
  async captureImage(options = {}) {
    try {
      if (!this.isActive || !this.videoElement) {
        throw new Error('Camera not active');
      }

      // Check if video is ready
      if (this.videoElement.readyState < 2) {
        throw new Error('Video not ready for capture');
      }

      // Check video dimensions
      if (!this.videoElement.videoWidth || !this.videoElement.videoHeight) {
        throw new Error('Video dimensions not available');
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      console.log('Capturing image with dimensions:', canvas.width, 'x', canvas.height);

      // Draw video frame to canvas
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to blob with timeout and error handling
      const blob = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Canvas toBlob timeout'));
        }, 5000);

        canvas.toBlob((blob) => {
          clearTimeout(timeout);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        }, 'image/jpeg', this.settings.quality || 0.8);
      });

      console.log('Successfully captured image blob:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      this.handleError('Failed to capture image', error);
      throw error;
    }
  }

  /**
   * Capture image as base64
   * @param {object} options - Capture options
   * @returns {Promise<string>} Base64 image data
   */
  async captureImageAsBase64(options = {}) {
    try {
      if (!this.isActive || !this.videoElement) {
        throw new Error('Camera not active');
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      // Draw video frame to canvas
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      return canvas.toDataURL('image/jpeg', this.settings.quality);
    } catch (error) {
      this.handleError('Failed to capture image as base64', error);
      throw error;
    }
  }

  /**
   * Switch camera device
   * @param {string} deviceId - Device ID to switch to
   * @returns {Promise<boolean>} Success status
   */
  async switchDevice(deviceId) {
    try {
      if (this.selectedDevice === deviceId) {
        return true;
      }

      this.selectedDevice = deviceId;

      if (this.isActive) {
        await this.stopPreview();
        await this.startPreview(this.videoElement);
      }

      return true;
    } catch (error) {
      this.handleError('Failed to switch device', error);
      return false;
    }
  }

  /**
   * Update camera settings
   * @param {object} settings - New settings
   * @returns {Promise<boolean>} Success status
   */
  async updateSettings(settings) {
    try {
      this.settings = { ...this.settings, ...settings };

      if (this.isActive) {
        await this.stopPreview();
        await this.startPreview(this.videoElement);
      }

      return true;
    } catch (error) {
      this.handleError('Failed to update settings', error);
      return false;
    }
  }

  /**
   * Build media constraints
   * @param {object} options - Constraint options
   * @returns {object} Media constraints
   */
  buildConstraints(options = {}) {
    const constraints = {
      video: {
        width: { ideal: this.settings.resolution.width },
        height: { ideal: this.settings.resolution.height },
        facingMode: this.settings.facingMode,
      },
    };

    // Add device ID if specified
    if (this.selectedDevice) {
      constraints.video.deviceId = { exact: this.selectedDevice };
    }

    // Override with options
    if (options.resolution) {
      constraints.video.width = { ideal: options.resolution.width };
      constraints.video.height = { ideal: options.resolution.height };
    }

    if (options.facingMode) {
      constraints.video.facingMode = options.facingMode;
    }

    console.log('Built constraints:', constraints);
    return constraints;
  }

  /**
   * Setup device change listener
   */
  setupDeviceChangeListener() {
    // Only set up listener once
    if (this.deviceChangeListener) {
      return;
    }
    
    this.deviceChangeListener = async () => {
      console.log('Device change detected, scheduling re-enumeration...');
      
      // Clear existing timeout
      if (this.enumerationTimeout) {
        clearTimeout(this.enumerationTimeout);
      }
      
      // Debounce device enumeration
      this.enumerationTimeout = setTimeout(async () => {
        console.log('Re-enumerating devices after change...');
        await this.getDevices();
        this.notifyDeviceChange();
      }, 500); // Wait 500ms before re-enumerating
    };
    
    navigator.mediaDevices.addEventListener('devicechange', this.deviceChangeListener);
  }

  /**
   * Get current camera status
   * @returns {object} Camera status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      isSupported: this.isSupported(),
      permissions: this.permissions,
      devices: this.devices,
      selectedDevice: this.selectedDevice,
      settings: this.settings,
    };
  }

  /**
   * Get video stream info
   * @returns {object} Stream information
   */
  getStreamInfo() {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return null;

    const settings = videoTrack.getSettings();
    const capabilities = videoTrack.getCapabilities();

    return {
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      facingMode: settings.facingMode,
      deviceId: settings.deviceId,
      capabilities: {
        width: capabilities.width,
        height: capabilities.height,
        frameRate: capabilities.frameRate,
        facingMode: capabilities.facingMode,
      },
    };
  }

  /**
   * Set callback for device changes
   * @param {Function} callback - Callback function
   */
  onDeviceChange(callback) {
    this.callbacks.onDeviceChange = callback;
  }

  /**
   * Set callback for permission changes
   * @param {Function} callback - Callback function
   */
  onPermissionChange(callback) {
    this.callbacks.onPermissionChange = callback;
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }

  /**
   * Notify device change
   */
  notifyDeviceChange() {
    if (this.callbacks.onDeviceChange) {
      this.callbacks.onDeviceChange(this.devices, this.selectedDevice);
    }
  }

  /**
   * Notify permission change
   */
  notifyPermissionChange() {
    if (this.callbacks.onPermissionChange) {
      this.callbacks.onPermissionChange(this.permissions);
    }
  }

  /**
   * Handle errors
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  handleError(message, error) {
    console.error(`[CameraService] ${message}:`, error);

    if (this.callbacks.onError) {
      this.callbacks.onError(message, error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.stopPreview();
    this.devices = [];
    this.selectedDevice = null;
    this.permissions = {
      granted: false,
      denied: false,
      prompt: false,
    };
    
    // Remove device change listener
    if (this.deviceChangeListener) {
      navigator.mediaDevices.removeEventListener('devicechange', this.deviceChangeListener);
      this.deviceChangeListener = null;
    }
    
    // Clear enumeration timeout
    if (this.enumerationTimeout) {
      clearTimeout(this.enumerationTimeout);
      this.enumerationTimeout = null;
    }
  }

  /**
   * Test camera functionality
   * @returns {Promise<object>} Test results
   */
  async testCamera() {
    const results = {
      supported: this.isSupported(),
      permissions: false,
      devices: 0,
      preview: false,
      capture: false,
    };

    try {
      // Test permissions
      results.permissions = await this.requestPermissions();

      // Test device enumeration
      await this.getDevices();
      results.devices = this.devices.length;

      // Test preview (if permissions granted)
      if (results.permissions) {
        const testVideo = document.createElement('video');
        results.preview = await this.startPreview(testVideo);

        if (results.preview) {
          // Test capture
          try {
            await this.captureImage();
            results.capture = true;
          } catch (error) {
            results.capture = false;
          }

          await this.stopPreview();
        }
      }
    } catch (error) {
      console.error('Camera test failed:', error);
    }

    return results;
  }
}

// Create singleton instance
const cameraService = new CameraService();

export default cameraService;
