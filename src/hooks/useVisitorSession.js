import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { apiService, storageService } from '../services';
import {
  currentVisitorAtom,
  visitorFormDataAtom,
  sessionDataAtom,
  sessionStatusAtom,
  sessionStartTimeAtom,
  sessionEndTimeAtom,
} from '../stores/atoms/visitorAtoms';

/**
 * useVisitorSession Hook
 * Manages visitor session lifecycle, data persistence, and state management
 */
export const useVisitorSession = () => {
  // State atoms
  const setCurrentVisitor = useSetAtom(currentVisitorAtom);
  const setVisitorFormData = useSetAtom(visitorFormDataAtom);
  const setSessionData = useSetAtom(sessionDataAtom);
  const setSessionStatus = useSetAtom(sessionStatusAtom);
  const setSessionStartTime = useSetAtom(sessionStartTimeAtom);
  const setSessionEndTime = useSetAtom(sessionEndTimeAtom);

  // Local state
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutes

  // Refs
  const autoSaveIntervalRef = useRef(null);
  const sessionTimeoutRef = useRef(null);

  /**
   * Generate unique session ID
   */
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Start new visitor session
   * @param {object} initialData - Initial visitor data
   */
  const startSession = useCallback(
    async (initialData = {}) => {
      try {
        const newSessionId = generateSessionId();
        const startTime = new Date().toISOString();

        setSessionId(newSessionId);
        setIsActive(true);
        setSessionStatus('active');
        setSessionStartTime(startTime);
        setSessionEndTime(null);

        // Initialize visitor data
        const visitorData = {
          id: `visitor_${Date.now()}`,
          ...initialData,
          sessionId: newSessionId,
          startTime,
          status: 'checking_in',
        };

        setCurrentVisitor(visitorData);
        setVisitorFormData(initialData);

        // Initialize session data
        const sessionData = {
          id: newSessionId,
          visitorId: visitorData.id,
          startTime,
          status: 'active',
          steps: ['welcome'],
          currentStep: 'welcome',
          data: initialData,
        };

        setSessionData(sessionData);

        // Store in local storage
        storageService.storeVisitorData(visitorData.id, visitorData);
        storageService.storeSessionData(newSessionId, sessionData);

        // Add to session history
        setSessionHistory(prev => [sessionData, ...prev.slice(0, 9)]); // Keep last 10

        // Start auto-save
        if (autoSaveEnabled) {
          startAutoSave();
        }

        // Start session timeout
        startSessionTimeout();

        return {
          sessionId: newSessionId,
          visitorId: visitorData.id,
          success: true,
        };
      } catch (error) {
        console.error('Failed to start session:', error);
        return { success: false, error: error.message };
      }
    },
    [
      generateSessionId,
      setSessionId,
      setIsActive,
      setSessionStatus,
      setSessionStartTime,
      setSessionEndTime,
      setCurrentVisitor,
      setVisitorFormData,
      setSessionData,
      autoSaveEnabled,
    ]
  );

  /**
   * Update visitor data
   * @param {object} data - Updated visitor data
   */
  const updateVisitorData = useCallback(
    async data => {
      try {
        setVisitorFormData(prev => ({ ...prev, ...data }));

        if (isActive && sessionId) {
          // Update current visitor
          setCurrentVisitor(prev => (prev ? { ...prev, ...data } : null));

          // Update session data
          setSessionData(prev =>
            prev
              ? {
                  ...prev,
                  data: { ...prev.data, ...data },
                  lastUpdated: new Date().toISOString(),
                }
              : null
          );

          // Auto-save to storage
          if (autoSaveEnabled) {
            const currentVisitor = useAtomValue(currentVisitorAtom);
            if (currentVisitor) {
              storageService.storeVisitorData(currentVisitor.id, {
                ...currentVisitor,
                ...data,
              });
            }
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to update visitor data:', error);
        return false;
      }
    },
    [
      isActive,
      sessionId,
      setVisitorFormData,
      setCurrentVisitor,
      setSessionData,
      autoSaveEnabled,
    ]
  );

  /**
   * Update session step
   * @param {string} step - New step name
   * @param {object} stepData - Step-specific data
   */
  const updateSessionStep = useCallback(
    async (step, stepData = {}) => {
      try {
        if (!isActive || !sessionId) {
          return false;
        }

        setSessionData(prev => {
          if (!prev) return null;

          const updatedSession = {
            ...prev,
            currentStep: step,
            steps: [...prev.steps, step],
            lastUpdated: new Date().toISOString(),
            data: { ...prev.data, ...stepData },
          };

          // Store updated session
          storageService.storeSessionData(sessionId, updatedSession);

          return updatedSession;
        });

        return true;
      } catch (error) {
        console.error('Failed to update session step:', error);
        return false;
      }
    },
    [isActive, sessionId, setSessionData]
  );

  /**
   * Complete visitor check-in
   * @param {object} finalData - Final visitor data
   */
  const completeCheckIn = useCallback(
    async (finalData = {}) => {
      try {
        if (!isActive || !sessionId) {
          return { success: false, error: 'No active session' };
        }

        const checkInTime = new Date().toISOString();

        // Update visitor data
        const updatedVisitor = {
          ...finalData,
          status: 'checked_in',
          checkInTime,
          sessionId,
        };

        setCurrentVisitor(prev =>
          prev ? { ...prev, ...updatedVisitor } : null
        );
        setSessionStatus('checked_in');

        // Update session data
        setSessionData(prev =>
          prev
            ? {
                ...prev,
                status: 'checked_in',
                currentStep: 'badge_print',
                data: { ...prev.data, ...finalData, checkInTime },
              }
            : null
        );

        // Store updated data
        const currentVisitor = useAtomValue(currentVisitorAtom);
        if (currentVisitor) {
          storageService.storeVisitorData(currentVisitor.id, {
            ...currentVisitor,
            ...updatedVisitor,
          });
        }

        // Try to sync with API
        try {
          await apiService.createVisitor(updatedVisitor);
        } catch (error) {
          console.warn('Failed to sync with API, data stored locally:', error);
        }

        return { success: true, visitorId: currentVisitor?.id };
      } catch (error) {
        console.error('Failed to complete check-in:', error);
        return { success: false, error: error.message };
      }
    },
    [isActive, sessionId, setCurrentVisitor, setSessionStatus, setSessionData]
  );

  /**
   * Complete visitor check-out
   * @param {string} visitorId - Visitor ID
   */
  const completeCheckOut = useCallback(async visitorId => {
    try {
      const checkOutTime = new Date().toISOString();

      // Update visitor data
      const updatedVisitor = {
        status: 'checked_out',
        checkOutTime,
      };

      // Store updated data
      storageService.storeVisitorData(visitorId, updatedVisitor);

      // Try to sync with API
      try {
        await apiService.updateVisitor(visitorId, updatedVisitor);
      } catch (error) {
        console.warn('Failed to sync with API, data stored locally:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to complete check-out:', error);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * End current session
   * @param {string} reason - Reason for ending session
   */
  const endSession = useCallback(
    async (reason = 'completed') => {
      try {
        if (!isActive || !sessionId) {
          return { success: false, error: 'No active session' };
        }

        const endTime = new Date().toISOString();

        // Update session data
        setSessionData(prev =>
          prev
            ? {
                ...prev,
                status: 'ended',
                endTime,
                reason,
              }
            : null
        );

        setSessionStatus('ended');
        setSessionEndTime(endTime);
        setIsActive(false);

        // Store final session data
        storageService.storeSessionData(sessionId, {
          id: sessionId,
          status: 'ended',
          endTime,
          reason,
        });

        // Clear auto-save and timeout
        stopAutoSave();
        clearSessionTimeout();

        return { success: true };
      } catch (error) {
        console.error('Failed to end session:', error);
        return { success: false, error: error.message };
      }
    },
    [
      isActive,
      sessionId,
      setSessionData,
      setSessionStatus,
      setSessionEndTime,
      setIsActive,
    ]
  );

  /**
   * Start auto-save functionality
   */
  const startAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(async () => {
      if (isActive && sessionId) {
        const currentVisitor = useAtomValue(currentVisitorAtom);
        const currentSession = useAtomValue(sessionDataAtom);

        if (currentVisitor) {
          storageService.storeVisitorData(currentVisitor.id, currentVisitor);
        }

        if (currentSession) {
          storageService.storeSessionData(sessionId, currentSession);
        }
      }
    }, 30000); // Auto-save every 30 seconds
  }, [isActive, sessionId]);

  /**
   * Stop auto-save functionality
   */
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  /**
   * Start session timeout
   */
  const startSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      if (isActive) {
        endSession('timeout');
      }
    }, sessionTimeout);
  }, [isActive, sessionTimeout, endSession]);

  /**
   * Clear session timeout
   */
  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  /**
   * Reset session timeout
   */
  const resetSessionTimeout = useCallback(() => {
    clearSessionTimeout();
    if (isActive) {
      startSessionTimeout();
    }
  }, [isActive, clearSessionTimeout, startSessionTimeout]);

  /**
   * Get session status
   */
  const getSessionStatus = useCallback(() => {
    return {
      isActive,
      sessionId,
      sessionStatus: useAtomValue(sessionStatusAtom),
      startTime: useAtomValue(sessionStartTimeAtom),
      endTime: useAtomValue(sessionEndTimeAtom),
      autoSaveEnabled,
      sessionTimeout,
    };
  }, [isActive, sessionId, autoSaveEnabled, sessionTimeout]);

  /**
   * Clear session data
   */
  const clearSessionData = useCallback(() => {
    setCurrentVisitor(null);
    setVisitorFormData({});
    setSessionData(null);
    setSessionStatus('idle');
    setSessionStartTime(null);
    setSessionEndTime(null);
    setSessionId(null);
    setIsActive(false);

    // Clear auto-save and timeout
    stopAutoSave();
    clearSessionTimeout();
  }, [
    setCurrentVisitor,
    setVisitorFormData,
    setSessionData,
    setSessionStatus,
    setSessionStartTime,
    setSessionEndTime,
    stopAutoSave,
    clearSessionTimeout,
  ]);

  /**
   * Load session from storage
   * @param {string} sessionId - Session ID to load
   */
  const loadSession = useCallback(
    async sessionId => {
      try {
        const sessionData = storageService.getSessionData(sessionId);
        if (sessionData) {
          setSessionData(sessionData);
          setSessionId(sessionId);
          setIsActive(true);
          setSessionStatus(sessionData.status);
          setSessionStartTime(sessionData.startTime);
          setSessionEndTime(sessionData.endTime);

          // Load visitor data if available
          if (sessionData.visitorId) {
            const visitorData = storageService.getVisitorData(
              sessionData.visitorId
            );
            if (visitorData) {
              setCurrentVisitor(visitorData);
              setVisitorFormData(visitorData);
            }
          }

          return { success: true, sessionData };
        } else {
          return { success: false, error: 'Session not found' };
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        return { success: false, error: error.message };
      }
    },
    [
      setSessionData,
      setSessionId,
      setIsActive,
      setSessionStatus,
      setSessionStartTime,
      setSessionEndTime,
      setCurrentVisitor,
      setVisitorFormData,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
      clearSessionTimeout();
    };
  }, [stopAutoSave, clearSessionTimeout]);

  return {
    // State
    isActive,
    sessionId,
    sessionHistory,
    autoSaveEnabled,
    sessionTimeout,

    // Actions
    startSession,
    updateVisitorData,
    updateSessionStep,
    completeCheckIn,
    completeCheckOut,
    endSession,
    loadSession,
    clearSessionData,
    startAutoSave,
    stopAutoSave,
    resetSessionTimeout,
    getSessionStatus,
  };
};

/**
 * useVisitorForm Hook
 * Specialized hook for visitor form management
 */
export const useVisitorForm = () => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  /**
   * Update form field
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));

    // Clear error for this field
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Validate form field
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   */
  const validateField = useCallback((fieldName, value) => {
    const errors = {};

    // Required field validation
    if (fieldName === 'name' && (!value || value.trim().length === 0)) {
      errors[fieldName] = 'Name is required';
    }

    if (fieldName === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      errors[fieldName] = 'Email format is invalid';
    }

    if (fieldName === 'phone' && value && !/^\+?[\d\s-()]+$/.test(value)) {
      errors[fieldName] = 'Phone format is invalid';
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    const errors = {};

    // Required fields
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Name is required';
    }

    if (!formData.hostName || formData.hostName.trim().length === 0) {
      errors.hostName = 'Host name is required';
    }

    // Optional field validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email format is invalid';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Phone format is invalid';
    }

    setFormErrors(errors);
    setIsValid(Object.keys(errors).length === 0);

    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({});
    setFormErrors({});
    setFormTouched({});
    setIsValid(false);
  }, []);

  /**
   * Get field status
   * @param {string} fieldName - Field name
   */
  const getFieldStatus = useCallback(
    fieldName => {
      return {
        value: formData[fieldName] || '',
        error: formErrors[fieldName],
        touched: formTouched[fieldName] || false,
        isValid: !formErrors[fieldName] && formTouched[fieldName],
      };
    },
    [formData, formErrors, formTouched]
  );

  return {
    // State
    formData,
    formErrors,
    formTouched,
    isValid,

    // Actions
    updateField,
    validateField,
    validateForm,
    resetForm,
    getFieldStatus,
  };
};

export default useVisitorSession;


