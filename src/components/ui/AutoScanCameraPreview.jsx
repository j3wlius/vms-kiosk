import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useCamera } from '../../hooks/useCamera';
import { useAutoScan } from '../../hooks/useAutoScan';
import { cameraStatusAtom, cameraSettingsAtom } from '../../stores/atoms/systemAtoms';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';
import { cn } from '../../utils/cn';

const AutoScanCameraPreview = ({ 
  onScanComplete, 
  onError, 
  onTimeout,
  className = '',
  autoStart = true,
  showInstructions = true,
  showQualityIndicator = true,
  ...props 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Camera hook
  const {
    isInitialized,
    isActive,
    permissions,
    initialize,
    startPreview,
    stopPreview,
    requestPermissions,
  } = useCamera();

  // Auto-scan hook
  const {
    isAutoScanning,
    documentStatus,
    isScanning,
    initialize: initAutoScan,
    startAutoScan,
    stopAutoScan,
    manualScan,
    reset: resetAutoScan,
    canScan,
    hasDocument,
    isPositioned,
    quality,
    instructions,
  } = useAutoScan();

  // Atom values
  const cameraStatus = useAtomValue(cameraStatusAtom);
  const cameraSettings = useAtomValue(cameraSettingsAtom);

  // Initialize camera and auto-scan on mount
  useEffect(() => {
    if (autoStart && !isInitialized && !isInitializing) {
      handleInitialize();
    }
  }, [autoStart, isInitialized, isInitializing]);

  // Initialize auto-scan when camera is ready
  useEffect(() => {
    if (isInitialized && !isAutoScanning) {
      initAutoScan();
    }
  }, [isInitialized, initAutoScan, isAutoScanning]);

  // Start auto-scan when video is loaded
  useEffect(() => {
    if (videoLoaded && isActive && videoRef.current && !isAutoScanning) {
      startAutoScan(videoRef.current, onTimeout);
    }
  }, [videoLoaded, isActive, isAutoScanning, startAutoScan, onTimeout]);

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
      const timer = setTimeout(() => {
        handleStartPreview();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isActive, autoStart]);

  // Handle starting preview
  const handleStartPreview = useCallback(async () => {
    if (!videoRef.current) {
      console.error('Video element not available');
      return;
    }
    
    try {
      console.log('Starting camera preview...');
      const success = await startPreview(videoRef.current);
      if (!success) {
        throw new Error('Failed to start camera preview');
      }
      console.log('Camera preview started successfully');
    } catch (err) {
      console.error('Camera preview error:', err);
      const errorMessage = err.message || 'Failed to start camera preview';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [startPreview, onError]);

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

  // Handle manual scan
  const handleManualScan = useCallback(async () => {
    try {
      const results = await manualScan();
      if (results && onScanComplete) {
        onScanComplete(results);
      }
    } catch (err) {
      const errorMessage = err.message || 'Manual scan failed';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [manualScan, onScanComplete, onError]);

  // Handle scan complete
  const handleScanComplete = useCallback((results) => {
    if (onScanComplete) {
      onScanComplete(results);
    }
  }, [onScanComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopPreview();
      }
      stopAutoScan();
    };
  }, [isActive, stopPreview, stopAutoScan]);

  // Render permission prompt
  if (permissions.denied || permissions.prompt) {
    return (
      <Card className={`p-6 text-center ${className}`} {...props}>
        <div className="space-y-4">
          <div className="text-gray-600">
            <p className="text-lg font-medium mb-2">Camera Access Required</p>
            <p className="text-sm">
              Please allow camera access for automatic document scanning.
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

  // Render camera preview with auto-scan
  return (
    <Card className={`overflow-hidden ${className}`} {...props}>
      <div className="relative">
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover bg-gray-100"
          style={{
            transform: 'scaleX(-1)', // Mirror the video
            minHeight: '200px',
          }}
          onLoadedData={() => {
            console.log('Video data loaded');
            setVideoLoaded(true);
          }}
          onError={(e) => {
            console.error('Video element error:', e);
            setError('Video failed to load');
          }}
        />
        
        {/* Loading overlay */}
        {!videoLoaded && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 mt-2">Loading camera...</p>
            </div>
          </div>
        )}
        
        {/* Canvas for capture (hidden) */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Document Detection Overlay */}
        {hasDocument && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Document outline */}
            <div
              className={cn(
                "absolute border-2 rounded-lg transition-all duration-300",
                isPositioned && quality >= 0.7
                  ? "border-green-500 bg-green-500/10"
                  : isPositioned
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-blue-500 bg-blue-500/10"
              )}
              style={{
                left: `${documentStatus.position.x}px`,
                top: `${documentStatus.position.y}px`,
                width: `${documentStatus.position.width}px`,
                height: `${documentStatus.position.height}px`,
              }}
            />
            
            {/* Corner guides */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/80"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/80"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/80"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/80"></div>
          </div>
        )}

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <LoadingSpinner size="lg" color="white" />
              <p className="text-lg font-medium mt-4">Scanning Document...</p>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Camera status */}
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Auto-scan status */}
          <div className={`w-3 h-3 rounded-full ${
            isAutoScanning ? 'bg-blue-500' : 'bg-gray-400'
          }`} />
        </div>

        {/* Quality indicator */}
        {showQualityIndicator && hasDocument && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
            <div className="text-xs font-medium mb-1">Quality</div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-600 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    quality >= 0.7 ? "bg-green-500" : quality >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${quality * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(quality * 100)}%</span>
            </div>
          </div>
        )}

        {/* Manual scan button */}
        {canScan && !isScanning && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button
              onClick={handleManualScan}
              variant="primary"
              size="lg"
              className="shadow-lg"
            >
              Scan Now
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-center">
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              isPositioned && quality >= 0.7
                ? "text-green-700"
                : isPositioned
                ? "text-yellow-700"
                : "text-gray-700"
            )}>
              {instructions}
            </p>
            
            {/* Status indicators */}
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  hasDocument ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>Document</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  isPositioned ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>Positioned</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  quality >= 0.7 ? 'bg-green-500' : quality >= 0.5 ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                <span>Quality</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera info */}
      {cameraSettings && (
        <div className="p-2 bg-gray-50 text-xs text-gray-600 border-t">
          <div className="flex justify-between">
            <span>Resolution: {cameraSettings.resolution?.width}x{cameraSettings.resolution?.height}</span>
            <span>FPS: {cameraSettings.frameRate}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AutoScanCameraPreview;
