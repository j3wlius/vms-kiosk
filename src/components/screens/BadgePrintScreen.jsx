import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { usePrinter } from '../../hooks/usePrinter';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import VisitorBadge from '../ui/VisitorBadge';
import ToastNotifications from '../ui/ToastNotifications';
import {
  formDataAtom,
  visitorBadgeDataAtom,
  currentFormStepAtom,
  formStepsAtom,
  visitorSessionAtom,
} from '../../stores/atoms/visitorAtoms';
import {
  printerStatusAtom,
  printerErrorAtom,
} from '../../stores/atoms/systemAtoms';

const BadgePrintScreen = () => {
  const navigate = useNavigate();
  
  // State atoms
  const formData = useAtomValue(formDataAtom);
  const badgeData = useAtomValue(visitorBadgeDataAtom);
  const setCurrentFormStep = useSetAtom(currentFormStepAtom);
  const setFormSteps = useSetAtom(formStepsAtom);
  const setVisitorSession = useSetAtom(visitorSessionAtom);
  const printerStatus = useAtomValue(printerStatusAtom);
  const printerError = useAtomValue(printerErrorAtom);

  // Hooks
  const { printBadge, isPrinting, printQueue, clearQueue } = usePrinter();

  // Local state
  const [printStatus, setPrintStatus] = useState('ready'); // 'ready', 'printing', 'success', 'error'
  const [printProgress, setPrintProgress] = useState(0);
  const [badgePreview, setBadgePreview] = useState(null);

  // Generate QR code and badge preview
  useEffect(() => {
    if (badgeData) {
      // Generate QR code data
      const qrData = {
        visitorId: badgeData.id,
        name: badgeData.name,
        company: badgeData.company,
        hostName: badgeData.hostName,
        visitDate: badgeData.visitDate,
        visitTime: badgeData.visitTime,
        checkInTime: new Date().toISOString(),
      };

      // Update visitor session with QR code
      setVisitorSession(prev => ({
        ...prev,
        id: badgeData.id,
        startTime: new Date().toISOString(),
        status: 'checked_in',
        qrCode: JSON.stringify(qrData),
      }));

      // Create badge preview
      setBadgePreview({
        ...badgeData,
        qrCode: JSON.stringify(qrData),
        checkInTime: new Date().toISOString(),
      });
    }
  }, [badgeData, setVisitorSession]);

  // Handle print badge
  const handlePrintBadge = async () => {
    if (!badgePreview || isPrinting) return;

    try {
      setPrintStatus('printing');
      setPrintProgress(0);

      // Simulate print progress
      const progressInterval = setInterval(() => {
        setPrintProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Print badge
      const success = await printBadge(badgePreview, {
        template: 'visitor_badge',
        quality: 'high',
        copies: 1,
      });

      clearInterval(progressInterval);
      setPrintProgress(100);

      if (success) {
        setPrintStatus('success');
        
        // Update form steps
        setFormSteps(prev => prev.map((step, index) => 
          index === 5 ? { ...step, completed: true } : step
        ));

        // Update visitor session
        setVisitorSession(prev => ({
          ...prev,
          badgePrinted: true,
        }));

        // Show success message
        setTimeout(() => {
          setPrintStatus('ready');
          setPrintProgress(0);
        }, 3000);
      } else {
        throw new Error('Print failed');
      }
    } catch (error) {
      console.error('Print error:', error);
      setPrintStatus('error');
      setPrintProgress(0);
    }
  };

  // Handle done
  const handleDone = () => {
    // Reset form and navigate to welcome
    navigate('/');
  };

  // Handle retry print
  const handleRetryPrint = () => {
    setPrintStatus('ready');
    setPrintProgress(0);
  };

  // Handle reprint
  const handleReprint = () => {
    setPrintStatus('ready');
    setPrintProgress(0);
  };

  if (!badgePreview) {
    return (
      <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 kiosk-text">
            Preparing badge...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-center kiosk-text">
          Print Badge
        </h1>

        {/* Badge Preview */}
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Badge Preview
            </h2>
            <div className="flex justify-center">
              <VisitorBadge
                data={badgePreview}
                className="w-64 h-40"
                showPreview={true}
              />
            </div>
          </div>
        </Card>

        {/* Print Status */}
        {printStatus === 'printing' && (
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Printing Badge...
              </h3>
            </div>
          </Card>
        )}

        {/* Print Success */}
        {printStatus === 'success' && (
          <Card className="mb-6 p-4 bg-green-50 border-green-200">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-2">✓</div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Badge Printed Successfully!
              </h3>
              <p className="text-green-700">
                Your visitor badge has been printed and is ready for pickup.
              </p>
            </div>
          </Card>
        )}

        {/* Print Error */}
        {printStatus === 'error' && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-2">✗</div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Print Failed
              </h3>
              <p className="text-red-700 mb-4">
                {printerError || 'An error occurred while printing the badge.'}
              </p>
              <Button
                onClick={handleRetryPrint}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Print Queue Status */}
        {printQueue.length > 0 && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Print Queue
              </h3>
              <p className="text-blue-700">
                {printQueue.length} badge(s) in queue
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          {printStatus === 'ready' && (
            <Button
              onClick={handlePrintBadge}
              disabled={isPrinting}
              className="w-full bg-green-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-green-700 transition-colors touch-button kiosk-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? 'Printing...' : 'Print Badge'}
            </Button>
          )}

          {printStatus === 'success' && (
            <Button
              onClick={handleDone}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-blue-700 transition-colors touch-button kiosk-button"
            >
              Done
            </Button>
          )}

          {printStatus === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={handleRetryPrint}
                className="w-full bg-green-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-green-700 transition-colors touch-button kiosk-button"
              >
                Try Again
              </Button>
              <Button
                onClick={handleDone}
                variant="outline"
                className="w-full kiosk-button"
              >
                Continue Without Printing
              </Button>
            </div>
          )}

          {printStatus === 'ready' && (
            <Button
              onClick={handleReprint}
              variant="outline"
              className="w-full kiosk-button"
            >
              Reprint Badge
            </Button>
          )}
        </div>

        {/* Badge Information */}
        <Card className="mt-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Visitor:</span>
                <p className="text-gray-900">{badgePreview.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Company:</span>
                <p className="text-gray-900">{badgePreview.company}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Host:</span>
                <p className="text-gray-900">{badgePreview.hostName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Visit Date:</span>
                <p className="text-gray-900">{badgePreview.visitDate}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Visit Time:</span>
                <p className="text-gray-900">{badgePreview.visitTime}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Check-in Time:</span>
                <p className="text-gray-900">
                  {new Date(badgePreview.checkInTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};

export default BadgePrintScreen;
