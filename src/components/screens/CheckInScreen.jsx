import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCamera, useCameraCapture } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';
import CameraPreview from '../ui/CameraPreview';
import LoadingSpinner from '../ui/LoadingSpinner';
import FlowNavigation from '../ui/FlowNavigation';
// import StatusIndicator from '../ui/StatusIndicator';
import ErrorRecovery from '../ui/ErrorRecovery';
import InstructionCard from '../ui/InstructionCard';
import ToastNotifications from '../ui/ToastNotifications';
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
  
  const { captureWithRetry, isCapturing } = useCameraCapture();
  const { processImage, isProcessing: isOcrProcessing } = useOCR();

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);


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

  // Handle document scan
  const handleScanDocument = async () => {
    if (!isCameraActive) {
      // setCameraError('Camera not active');
      return;
    }

    try {
      setScanAttempts(prev => prev + 1);
      setOcrProcessing(prev => ({ ...prev, isProcessing: true, error: null }));
      
      // Capture image
      const imageData = await captureWithRetry();
      if (imageData) {
        setCapturedImage(imageData);
        
        // Process with OCR
        const ocrResults = await processImage(imageData.blob);
        
        if (ocrResults && ocrResults.confidence > 0.7) {
          // Update form data with OCR results
          setFormData(prev => ({
            ...prev,
            idDocument: {
              ...prev.idDocument,
              rawData: imageData,
              ...ocrResults.extractedData,
            },
          }));
          
          // Navigate to verification screen
          navigate('/verify');
        } else {
          throw new Error('Document recognition failed. Please try again or enter manually.');
        }
      }
    } catch (error) {
      console.error('Document scan failed:', error);
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

  // Handle retry
  const handleRetry = () => {
    setOcrProcessing(prev => ({ 
      ...prev, 
      isProcessing: false, 
      error: null 
    }));
    setCapturedImage(null);
    // setCameraError(null);
  };

  // Handle camera capture
  const handleCameraCapture = (imageData) => {
    setCapturedImage(imageData);
    // Auto-process the captured image
    handleScanDocument();
  };

  // Handle camera error
  const handleCameraError = (error) => {
    // setCameraError(error);
  };

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
          Check In
        </h1>
        
        {/* Camera Preview */}
        <div className="mb-6">
          <CameraPreview
            onCapture={handleCameraCapture}
            onError={handleCameraError}
            className="w-full max-w-xs sm:max-w-sm h-48 sm:h-56 mx-auto rounded-lg overflow-hidden"
            showControls={false}
            autoStart={true}
          />
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="mb-6">
            <InstructionCard
              title="How to scan your ID document"
              icon="📷"
              steps={[
                "Place your ID document flat in front of the camera",
                "Ensure good lighting and avoid shadows",
                "Keep the document centered and fully visible",
                "Avoid glare from overhead lights or windows",
                "Wait for the green frame to appear before scanning"
              ]}
              variant="default"
            />
          </div>
        )}


        {/* Action Buttons */}
        <FlowNavigation
          onNext={handleScanDocument}
          onPrevious={() => navigate('/')}
          nextLabel={isCapturing ? 'Capturing...' : 
                     isOcrProcessing ? 'Processing...' : 
                     'Scan ID Document'}
          previousLabel="Back to Main Menu"
          nextDisabled={!isCameraActive || isCapturing || isOcrProcessing}
          nextLoading={isCapturing || isOcrProcessing}
          showPrevious={true}
          className="mt-8"
        />
        
        <div className="text-center mt-4">
          <button
            onClick={handleManualEntry}
            className="text-blue-600 hover:text-blue-800 underline kiosk-text"
          >
            Enter information manually instead
          </button>
        </div>

        {/* Scan Attempts Counter */}
        {scanAttempts > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Scan attempts: {scanAttempts}
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};

export default CheckInScreen;
