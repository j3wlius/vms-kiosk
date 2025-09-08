import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraPreview, DocumentScanner } from '../ui';
import { Button, Card, LoadingSpinner } from '../ui';

const CheckOutScreen = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitorFound, setVisitorFound] = useState(null);

  const handleQRScanned = (blob, imageUrl, scanCount) => {
    console.log('QR code scanned:', { blob, imageUrl, scanCount });
    setScannedQR({ blob, imageUrl, scanCount });
    setIsScanning(false);
  };

  const handleScanError = (error) => {
    console.error('QR scan error:', error);
    setIsScanning(false);
  };

  const handleProcessQR = async () => {
    if (!scannedQR) return;
    
    setIsProcessing(true);
    try {
      // Simulate QR code processing and visitor lookup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock visitor data
      const mockVisitor = {
        id: 'visitor_123',
        name: 'John Doe',
        company: 'Acme Corp',
        checkInTime: '2024-01-15T09:30:00Z',
        hostName: 'Jane Smith'
      };
      
      setVisitorFound(mockVisitor);
    } catch (error) {
      console.error('QR processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!visitorFound) return;
    
    setIsProcessing(true);
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Visitor checked out:', visitorFound);
      
      // Navigate back to welcome screen
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setScannedQR(null);
    setVisitorFound(null);
    setIsScanning(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full">
        <Card className="p-6 sm:p-8">
          <Card.Header>
            <Card.Title>Check Out</Card.Title>
            <Card.Description>
              Please scan your visitor badge QR code to check out
            </Card.Description>
          </Card.Header>

          <div className="space-y-6">
            {!visitorFound ? (
              <div className="text-center">
                {!scannedQR ? (
                  <div>
                    <DocumentScanner
                      onDocumentScanned={handleQRScanned}
                      onError={handleScanError}
                      className="mb-6"
                    />
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleBack}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <img
                        src={scannedQR.imageUrl}
                        alt="Scanned QR code"
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                    
                    <p className="text-gray-600 mb-6 kiosk-text">
                      QR code scanned successfully! Click "Process" to look up visitor information.
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleRetake}
                      >
                        Retake
                      </Button>
                      
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleProcessQR}
                        loading={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Process QR Code'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Visitor Found
                  </h3>
                  
                  <div className="text-left max-w-md mx-auto space-y-2">
                    <p><strong>Name:</strong> {visitorFound.name}</p>
                    <p><strong>Company:</strong> {visitorFound.company}</p>
                    <p><strong>Host:</strong> {visitorFound.hostName}</p>
                    <p><strong>Check-in Time:</strong> {new Date(visitorFound.checkInTime).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleRetake}
                  >
                    Scan Different QR
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckOut}
                    loading={isProcessing}
                  >
                    {isProcessing ? 'Checking Out...' : 'Check Out'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckOutScreen;