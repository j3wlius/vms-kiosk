import { useState, useEffect, useCallback } from 'react';

const useIdleDetection = (idleTime = 30000) => {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetIdleTimer = useCallback(() => {
    setLastActivity(Date.now());
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let idleTimer;

    const handleActivity = () => {
      resetIdleTimer();
    };

    const startIdleTimer = () => {
      idleTimer = setTimeout(() => {
        setIsIdle(true);
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
  }, [idleTime, resetIdleTimer]);

  return {
    isIdle,
    resetIdleTimer,
    lastActivity,
  };
};

export default useIdleDetection;
