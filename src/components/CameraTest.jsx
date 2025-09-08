import React, { useState, useRef, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import Button from './ui/Button';
import Card from './ui/Card';

const CameraTest = () => {
  const videoRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  
  const {
    isInitialized,
    isActive,
    permissions,
    initialize,
    startPreview,
    stopPreview,
    requestPermissions,
    getStatus,
  } = useCamera();

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[CameraTest] ${message}`);
  };

  const handleInitialize = async () => {
    setIsTesting(true);
    addLog('Starting camera initialization...');
    
    try {
      const success = await initialize();
      if (success) {
        addLog('Camera initialized successfully');
        addLog('Camera service is ready for use');
      } else {
        addLog('Camera initialization failed');
      }
    } catch (error) {
      addLog(`Initialization error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStartPreview = async () => {
    if (!videoRef.current) {
      addLog('Video element not available');
      return;
    }
    
    addLog('Starting camera preview...');
    try {
      const success = await startPreview(videoRef.current);
      if (success) {
        addLog('Camera preview started successfully');
      } else {
        addLog('Camera preview failed to start');
      }
    } catch (error) {
      addLog(`Preview error: ${error.message}`);
    }
  };

  const handleStopPreview = async () => {
    addLog('Stopping camera preview...');
    try {
      await stopPreview();
      addLog('Camera preview stopped');
    } catch (error) {
      addLog(`Stop error: ${error.message}`);
    }
  };

  const handleRequestPermissions = async () => {
    addLog('Requesting camera permissions...');
    try {
      const success = await requestPermissions();
      if (success) {
        addLog('Camera permissions granted');
      } else {
        addLog('Camera permissions denied');
      }
    } catch (error) {
      addLog(`Permission error: ${error.message}`);
    }
  };

  const handleGetStatus = () => {
    const status = getStatus();
    addLog(`Status: ${JSON.stringify(status, null, 2)}`);
  };

  const handleEnumerateDevices = async () => {
    addLog('Enumerating all devices...');
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      addLog(`Found ${devices.length} total devices:`);
      devices.forEach((device, index) => {
        addLog(`  ${index + 1}. ${device.kind}: ${device.label || 'Unlabeled'} (${device.deviceId})`);
      });
      
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      addLog(`Video devices: ${videoDevices.length}`);
      videoDevices.forEach((device, index) => {
        addLog(`  Video ${index + 1}: ${device.label || 'Unlabeled'} (${device.deviceId})`);
      });
    } catch (error) {
      addLog(`Device enumeration error: ${error.message}`);
    }
  };

  const handleDirectCameraTest = async () => {
    addLog('Testing direct camera access...');
    try {
      // Test basic getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      addLog('Direct camera access successful!');
      addLog(`Stream tracks: ${stream.getTracks().length}`);
      
      // Get video track info
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        addLog(`Video settings: ${JSON.stringify(settings)}`);
      }
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      addLog('Direct test stream stopped');
    } catch (error) {
      addLog(`Direct camera test failed: ${error.name} - ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Camera Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Preview */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Camera Preview</h2>
          
          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-100 border rounded"
              style={{ transform: 'scaleX(-1)' }}
              onLoadedData={() => addLog('Video data loaded')}
              onError={(e) => addLog(`Video error: ${e.message}`)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={handleInitialize}
                disabled={isTesting}
                size="sm"
              >
                {isTesting ? 'Initializing...' : 'Initialize'}
              </Button>
              
              <Button
                onClick={handleRequestPermissions}
                disabled={!isInitialized}
                size="sm"
              >
                Request Permissions
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleStartPreview}
                disabled={!isInitialized || isActive}
                size="sm"
              >
                Start Preview
              </Button>
              
              <Button
                onClick={handleStopPreview}
                disabled={!isActive}
                size="sm"
                variant="secondary"
              >
                Stop Preview
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleGetStatus}
                size="sm"
                variant="outline"
              >
                Get Status
              </Button>
              
              <Button
                onClick={handleEnumerateDevices}
                size="sm"
                variant="outline"
              >
                List Devices
              </Button>
            </div>
            
            <Button
              onClick={handleDirectCameraTest}
              size="sm"
              variant="secondary"
            >
              Direct Camera Test
            </Button>
          </div>
        </Card>
        
        {/* Status and Logs */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Status & Logs</h2>
            <Button onClick={clearLogs} size="sm" variant="outline">
              Clear Logs
            </Button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
            <div><strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}</div>
            <div><strong>Active:</strong> {isActive ? 'Yes' : 'No'}</div>
            <div><strong>Permissions:</strong> {JSON.stringify(permissions)}</div>
          </div>
          
          <div className="h-64 overflow-y-auto bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CameraTest;