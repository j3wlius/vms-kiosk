import React, { useState, useEffect } from 'react';
import { cameraService } from '../services';
import Card from './ui/Card';
import Button from './ui/Button';

const CameraTest = () => {
  const [devices, setDevices] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const [hasDevices, setHasDevices] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    const checkCameraSupport = async () => {
      setIsSupported(cameraService.isSupported());
      setHasDevices(await cameraService.hasAvailableDevices());
      
      try {
        const deviceList = await cameraService.getDevices();
        setDevices(deviceList);
      } catch (error) {
        console.error('Failed to get devices:', error);
      }
    };

    checkCameraSupport();
  }, []);

  const runCameraTest = async () => {
    try {
      setTestResults('Running camera test...');
      const results = await cameraService.testCamera();
      setTestResults(JSON.stringify(results, null, 2));
    } catch (error) {
      setTestResults(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Camera Test</h2>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Camera Support</h3>
        <p>Supported: {isSupported ? '✅ Yes' : '❌ No'}</p>
        <p>Has Devices: {hasDevices ? '✅ Yes' : '❌ No'}</p>
        <p>Device Count: {devices.length}</p>
      </Card>

      {devices.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Available Devices</h3>
          <ul className="space-y-1">
            {devices.map((device, index) => (
              <li key={device.deviceId} className="text-sm">
                {index + 1}. {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Camera Test</h3>
        <Button onClick={runCameraTest} className="mb-2">
          Run Camera Test
        </Button>
        {testResults && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {testResults}
          </pre>
        )}
      </Card>
    </div>
  );
};

export default CameraTest;

