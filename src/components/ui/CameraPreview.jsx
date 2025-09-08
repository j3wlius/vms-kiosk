import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { cameraStatusAtom, cameraSettingsAtom } from '../../stores/atoms/systemAtoms';
import { useCamera } from '../../hooks/useCamera';
import { cameraService } from '../../services';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';

const CameraPreview = ({ 
  onCapture, 
  onError, 
  className = '',
  showControls = true,
  autoStart = true,
  captureButtonText = 'Capture Photo',
  ...props 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  
  // Camera hook
  const {
    isInitialized,
    isActive,
    permissions,
    initialize,
    startPreview,
    stopPreview,
    captureImage,
    requestPermissions,
    getStatus,
  } = useCamera();

  // Atom values
  const cameraStatus = useAtomValue(cameraStatusAtom);
  const cameraSettings = useAtomValue(cameraSettingsAtom);

  // Initialize camera on mount
  useEffect(() => {
    if (autoStart && !isInitialized && !isInitializing) {
      handleInitialize();
    }
  }, [autoStart, isInitialized, isInitializing]);

  // Check if camera devices are available
  useEffect(() => {
    const checkDevices = async () => {
      try {
        const hasDevices = await cameraService.hasAvailableDevices();
        if (!hasDevices) {
          setError('No camera devices found. Please connect a camera or use manual entry.');
        }
      } catch (err) {
        console.error('Failed to check camera devices:', err);
      }
    };
    
    checkDevices();
  }, []);

  // Handle initialization
  const handleInitialize = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const success = await initialize();
      if (!success) {
        throw new Error('Failed to initialize camera');
      }
    } catch (err) {
      const errorMessage = err.message || 'Camera initialization failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, [initialize, onError]);

  // Start preview when initialized
  useEffect(() => {
    if (isInitialized && !isActive && videoRef.current && autoStart) {
      handleStartPreview();
    }
  }, [isInitialized, isActive, autoStart]);

  // Handle starting preview
  const handleStartPreview = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      const success = await startPreview(videoRef.current);
      if (!success) {
        throw new Error('Failed to start camera preview');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to start camera preview';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [startPreview, onError]);

  // Handle capture
  const handleCapture = useCallback(async () => {
    if (!isActive) {
      setError('Camera not active');
      return;
    }

    try {
      const imageData = await captureImage();
      if (imageData && onCapture) {
        onCapture(imageData);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to capture image';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isActive, captureImage, onCapture, onError]);

  // Handle permission request
  const handleRequestPermissions = useCallback(async () => {
    try {
      const success = await requestPermissions();
      if (success) {
        await handleInitialize();
      } else {
        setError('Camera permissions denied');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to request camera permissions';
      setError(errorMessage);
    }
  }, [requestPermissions, handleInitialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopPreview();
      }
    };
  }, [isActive, stopPreview]);

  // Render permission prompt
  if (permissions.denied || permissions.prompt) {
    return (
      <Card className={`p-6 text-center ${className}`} {...props}>
        <div className="space-y-4">
          <div className="text-gray-600">
            <p className="text-lg font-medium mb-2">Camera Access Required</p>
            <p className="text-sm">
              Please allow camera access to take photos for visitor verification.
            </p>
          </div>
          <Button
            onClick={handleRequestPermissions}
            variant="primary"
            size="lg"
          >
            Allow Camera Access
          </Button>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    const isNoDeviceError = error.includes('No camera devices found');
    
    return (
      <Card className={`p-6 text-center ${className}`} {...props}>
        <div className="space-y-4">
          <div className="text-red-600">
            <p className="text-lg font-medium mb-2">Camera Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="flex gap-2 justify-center">
            {!isNoDeviceError && (
              <>
                <Button
                  onClick={handleInitialize}
                  variant="secondary"
                  size="sm"
                >
                  Retry
                </Button>
                <Button
                  onClick={handleRequestPermissions}
                  variant="primary"
                  size="sm"
                >
                  Request Permissions
                </Button>
              </>
            )}
            {isNoDeviceError && (
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                size="sm"
              >
                Refresh Page
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Render loading state
  if (isInitializing || (!isInitialized && !error)) {
    return (
      <Card className={`p-6 text-center ${className}`} {...props}>
        <div className="space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Initializing camera...</p>
        </div>
      </Card>
    );
  }

  // Render camera preview
  return (
    <Card className={`overflow-hidden ${className}`} {...props}>
      <div className="relative">
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto bg-gray-900"
          style={{
            transform: 'scaleX(-1)', // Mirror the video
          }}
        />
        
        {/* Canvas for capture (hidden) */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Overlay controls */}
        {showControls && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-2">
              <Button
                onClick={handleCapture}
                variant="primary"
                size="lg"
                disabled={!isActive}
                className="shadow-lg"
              >
                {captureButtonText}
              </Button>
            </div>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-4 right-4">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      </div>

      {/* Camera info */}
      {cameraSettings && (
        <div className="p-4 bg-gray-50 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Resolution: {cameraSettings.resolution?.width}x{cameraSettings.resolution?.height}</span>
            <span>FPS: {cameraSettings.frameRate}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

// Export with controls variant
export const CameraPreviewWithControls = (props) => (
  <CameraPreview {...props} showControls={true} />
);

// Export document scanner variant
export const DocumentScanner = (props) => (
  <CameraPreview 
    {...props} 
    showControls={true}
    captureButtonText="Scan Document"
    autoStart={true}
  />
);

export default CameraPreview;
