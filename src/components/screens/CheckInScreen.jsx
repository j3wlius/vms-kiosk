import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCamera } from '../../hooks/useCamera';
import AutoScanCameraPreview from '../ui/AutoScanCameraPreview';
import LoadingSpinner from '../ui/LoadingSpinner';
import ToastNotifications from '../ui/ToastNotifications';
import ErrorRecovery from '../ui/ErrorRecovery';
import {
  formDataAtom,
  ocrProcessingAtom,
  // currentFormStepAtom,
  // formStepsAtom,
} from '../../stores/atoms/visitorAtoms';
import {
  // cameraStatusAtom,
  cameraErrorAtom,
} from '../../stores/atoms/systemAtoms';

const CheckInScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'new'; // 'new' or 'registered'
  // const videoRef = useRef(null);
  
  // Atom values
  const formData = useAtomValue(formDataAtom);
  const ocrProcessing = useAtomValue(ocrProcessingAtom);
  // const cameraStatus = useAtomValue(cameraStatusAtom);
  const cameraError = useAtomValue(cameraErrorAtom);
  
  // Atom setters
  const setFormData = useSetAtom(formDataAtom);
  const setOcrProcessing = useSetAtom(ocrProcessingAtom);
  // const setCameraError = useSetAtom(cameraErrorAtom);

  // Camera hooks
  const {
    initialize: initCamera,
    // startPreview,
    // stopPreview,
    isActive: isCameraActive,
    permissions,
    requestPermissions,
  } = useCamera();
  

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('ready'); // 'ready', 'scanning', 'processing', 'success', 'error'
  const [scanMessage, setScanMessage] = useState(
    mode === 'registered' 
      ? 'Scan your visitor badge or ID to check in' 
      : 'Position your ID document in front of the camera'
  );
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showCountdown, setShowCountdown] = useState(false);


  // Camera initialization
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        await initCamera();
        setIsInitialized(true);
      } catch (error) {
        console.error('Camera initialization failed:', error);
        // setCameraError(error.message);
      }
    };

    initializeCamera();
  }, [initCamera]);

  // Handle camera permissions
  const handleRequestPermissions = async () => {
    try {
      await requestPermissions();
      setShowInstructions(false);
    } catch (error) {
      console.error('Permission request failed:', error);
      // setCameraError(error.message);
    }
  };

  // Handle auto-scan completion
  const handleScanComplete = async (ocrResults) => {
    try {
      if (ocrResults && ocrResults.confidence > 0.7) {
        setScanningStatus('success');
        setScanMessage(`Document recognized! Confidence: ${Math.round(ocrResults.confidence * 100)}%`);
        setShowCountdown(false); // Stop countdown on successful scan
        
        // Update form data with OCR results
        setFormData(prev => ({
          ...prev,
          idDocument: {
            ...prev.idDocument,
            ...ocrResults.fields,
            documentType: ocrResults.documentType,
          },
        }));
        
        // Navigate to verification screen after a brief success message
        setTimeout(() => {
          navigate('/verify');
        }, 1500);
      } else {
        const confidence = ocrResults ? Math.round(ocrResults.confidence * 100) : 0;
        setScanningStatus('error');
        setScanMessage(`Document recognition failed (${confidence}% confidence). Please ensure the ID is clearly visible and try again.`);
        setOcrProcessing(prev => ({ 
          ...prev, 
          isProcessing: false, 
          error: 'Low confidence OCR result' 
        }));
      }
    } catch (error) {
      console.error('Scan completion failed:', error);
      setScanningStatus('error');
      setScanMessage(`Scan failed: ${error.message}`);
      setOcrProcessing(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error.message 
      }));
    }
  };

  // Handle manual entry fallback
  const handleManualEntry = () => {
    navigate('/verify');
  };

  // Handle back to options
  const handleBackToOptions = () => {
    navigate('/checkin-options');
  };

  // Handle retry
  const handleRetry = () => {
    setOcrProcessing(prev => ({ 
      ...prev, 
      isProcessing: false, 
      error: null 
    }));
    setScanningStatus('ready');
    setScanMessage(
      mode === 'registered' 
        ? 'Scan your visitor badge or ID to check in' 
        : 'Position your ID document in front of the camera'
    );
    setShowCountdown(false);
    setTimeRemaining(60);
  };

  // Handle camera error
  const handleCameraError = (error) => {
    setScanningStatus('error');
    setScanMessage(`Camera error: ${error}`);
    setOcrProcessing(prev => ({ 
      ...prev, 
      isProcessing: false, 
      error: error 
    }));
  };

  // Handle auto-scan timeout
  const handleAutoScanTimeout = () => {
    setScanningStatus('timeout');
    setScanMessage('Auto-scan timed out. Redirecting to manual entry...');
    setShowCountdown(false);
    
    // Navigate to manual entry after a brief delay
    setTimeout(() => {
      navigate('/verify');
    }, 2000);
  };

  // Start countdown when auto-scan begins
  useEffect(() => {
    if (scanningStatus === 'ready' && !showCountdown) {
      // Start countdown after a 5-second delay to give users time to position document
      const startCountdownTimer = setTimeout(() => {
        setShowCountdown(true);
        setTimeRemaining(55); // 55 seconds remaining after 5-second delay
      }, 5000);

      return () => clearTimeout(startCountdownTimer);
    }
  }, [scanningStatus, showCountdown]);

  // Countdown effect
  useEffect(() => {
    let countdownInterval;
    
    if (showCountdown && timeRemaining > 0) {
      countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setShowCountdown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showCountdown, timeRemaining]);

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 kiosk-text">
            Initializing camera...
          </p>
        </div>
      </div>
    );
  }

  // Show permission request
  if (permissions.denied || permissions.prompt) {
    return (
      <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 kiosk-text">
            Camera Permission Required
          </h1>
          <p className="text-gray-600 mb-6 kiosk-text">
            Please allow camera access to scan your ID document
          </p>
          <button
            onClick={handleRequestPermissions}
            className="bg-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-blue-700 transition-colors touch-button kiosk-button"
          >
            Allow Camera Access
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (cameraError || ocrProcessing.error) {
    return (
      <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-center kiosk-text">
            Check In
          </h1>
          
          <ErrorRecovery
            error={cameraError || ocrProcessing.error}
            onRetry={handleRetry}
            onSkip={handleManualEntry}
            skipLabel="Enter Manually"
            showSkip={true}
            className="mb-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-center kiosk-text">
          {mode === 'registered' ? 'Already Registered - Check In' : 'New Visitor - Check In'}
        </h1>
        
        {/* Auto-Scan Camera Preview */}
        <div className="mb-6">
          <AutoScanCameraPreview
            onScanComplete={handleScanComplete}
            onError={handleCameraError}
            onTimeout={handleAutoScanTimeout}
            className="w-full max-w-xs sm:max-w-sm h-48 sm:h-56 mx-auto rounded-lg overflow-hidden"
            autoStart={true}
            showInstructions={true}
            showQualityIndicator={true}
          />
        </div>

        {/* Scanning Status Display */}
        <div className="mb-6">
          {scanningStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Document Scanned Successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{scanMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanningStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Scan Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{scanMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanningStatus === 'ready' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Auto-Scan Ready
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {mode === 'registered' 
                        ? 'Scan your visitor badge or ID document. The system will automatically detect and process it when properly positioned.'
                        : 'Position your ID document in front of the camera. The system will automatically detect and scan it when properly positioned.'
                      }
                    </p>
                    {showCountdown && (
                      <div className="mt-2 flex items-center">
                        <svg className="h-4 w-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-orange-700">
                          Auto-entry in {timeRemaining} seconds
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {scanningStatus === 'timeout' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Auto-Scan Timeout
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>{scanMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        

        {/* Manual Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToOptions}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Back to Options
          </button>
          
          {scanningStatus === 'error' && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={handleManualEntry}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};

export default CheckInScreen;
