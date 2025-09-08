import { useState, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { scanningActivityAtom } from '../stores/atoms/systemAtoms';

const useIdleDetection = (idleTime = 30000) => {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const scanningActivity = useAtomValue(scanningActivityAtom);

  const resetIdleTimer = useCallback(() => {
    setLastActivity(Date.now());
    setIsIdle(false);
  }, []);

  // Reset idle state when scanning becomes active
  useEffect(() => {
    if (scanningActivity.isScanning || scanningActivity.isAutoScanning || scanningActivity.isProcessing) {
      setIsIdle(false);
    }
  }, [scanningActivity.isScanning, scanningActivity.isAutoScanning, scanningActivity.isProcessing]);

  useEffect(() => {
    let idleTimer;

    const handleActivity = () => {
      resetIdleTimer();
    };

    const startIdleTimer = () => {
      idleTimer = setTimeout(() => {
        // Don't set idle if scanning is active
        if (!scanningActivity.isScanning && !scanningActivity.isAutoScanning && !scanningActivity.isProcessing) {
          setIsIdle(true);
        }
      }, idleTime);
    };

    // event listeners for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // start the idle timer
    startIdleTimer();

    // cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [idleTime, resetIdleTimer, scanningActivity]);

  return {
    isIdle,
    resetIdleTimer,
    lastActivity,
  };
};

export default useIdleDetection;
