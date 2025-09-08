import { renderHook, act } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import {
  printerStatusAtom,
  cameraStatusAtom,
  networkStatusAtom,
  systemHealthAtom,
  systemErrorsAtom,
  addSystemErrorAtom,
  resolveSystemErrorAtom,
  systemNotificationsAtom,
  addNotificationAtom,
  dismissNotificationAtom,
} from '../atoms/systemAtoms';

// Helper function to render hooks with provider
const renderHookWithProvider = hook => {
  const wrapper = ({ children }) => <Provider>{children}</Provider>;
  return renderHook(hook, { wrapper });
};

describe('System Atoms', () => {
  describe('printerStatusAtom', () => {
    it('should initialize with unavailable status', () => {
      const { result } = renderHookWithProvider(() => {
        const [status] = useAtom(printerStatusAtom);
        return status;
      });

      expect(result.current).toEqual({
        isAvailable: false,
        isConnected: false,
        isPrinting: false,
        queueLength: 0,
        lastError: null,
        deviceInfo: null,
      });
    });
  });

  describe('cameraStatusAtom', () => {
    it('should initialize with unavailable status', () => {
      const { result } = renderHookWithProvider(() => {
        const [status] = useAtom(cameraStatusAtom);
        return status;
      });

      expect(result.current).toEqual({
        isAvailable: false,
        isActive: false,
        devices: [],
        selectedDevice: null,
        lastError: null,
        permissions: {
          granted: false,
          denied: false,
          prompt: false,
        },
      });
    });
  });

  describe('networkStatusAtom', () => {
    it('should initialize with online status', () => {
      const { result } = renderHookWithProvider(() => {
        const [status] = useAtom(networkStatusAtom);
        return status;
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.connectionType).toBe('unknown');
    });
  });

  describe('systemHealthAtom', () => {
    it('should initialize with healthy status', () => {
      const { result } = renderHookWithProvider(() => {
        const [health] = useAtom(systemHealthAtom);
        return health;
      });

      expect(result.current).toEqual({
        status: 'healthy',
        lastCheck: null,
        components: {
          printer: 'unknown',
          camera: 'unknown',
          network: 'unknown',
          storage: 'unknown',
        },
        errors: [],
        warnings: [],
      });
    });
  });

  describe('systemErrorsAtom', () => {
    it('should initialize with empty errors array', () => {
      const { result } = renderHookWithProvider(() => {
        const [errors] = useAtom(systemErrorsAtom);
        return errors;
      });

      expect(result.current).toEqual([]);
    });
  });

  describe('addSystemErrorAtom', () => {
    it('should add new error to errors array', () => {
      const { result } = renderHookWithProvider(() => {
        const [errors] = useAtom(systemErrorsAtom);
        const [, addError] = useAtom(addSystemErrorAtom);
        return { errors, addError };
      });

      const newError = {
        type: 'printer',
        message: 'Printer not found',
        component: 'printer',
        severity: 'error',
      };

      act(() => {
        result.current.addError(newError);
      });

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0]).toMatchObject({
        type: 'printer',
        message: 'Printer not found',
        component: 'printer',
        severity: 'error',
        resolved: false,
      });
      expect(result.current.errors[0].id).toBeDefined();
      expect(result.current.errors[0].timestamp).toBeDefined();
    });
  });

  describe('resolveSystemErrorAtom', () => {
    it('should mark error as resolved', () => {
      const { result } = renderHookWithProvider(() => {
        const [errors] = useAtom(systemErrorsAtom);
        const [, addError] = useAtom(addSystemErrorAtom);
        const [, resolveError] = useAtom(resolveSystemErrorAtom);
        return { errors, addError, resolveError };
      });

      // Add an error
      act(() => {
        result.current.addError({
          type: 'printer',
          message: 'Printer not found',
          component: 'printer',
          severity: 'error',
        });
      });

      const errorId = result.current.errors[0].id;

      // Resolve the error
      act(() => {
        result.current.resolveError(errorId);
      });

      expect(result.current.errors[0].resolved).toBe(true);
    });
  });

  describe('systemNotificationsAtom', () => {
    it('should initialize with empty notifications array', () => {
      const { result } = renderHookWithProvider(() => {
        const [notifications] = useAtom(systemNotificationsAtom);
        return notifications;
      });

      expect(result.current).toEqual([]);
    });
  });

  describe('addNotificationAtom', () => {
    it('should add new notification to notifications array', () => {
      const { result } = renderHookWithProvider(() => {
        const [notifications] = useAtom(systemNotificationsAtom);
        const [, addNotification] = useAtom(addNotificationAtom);
        return { notifications, addNotification };
      });

      const newNotification = {
        type: 'info',
        title: 'System Ready',
        message: 'All systems are operational',
      };

      act(() => {
        result.current.addNotification(newNotification);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        type: 'info',
        title: 'System Ready',
        message: 'All systems are operational',
        duration: 5000,
        persistent: false,
        dismissed: false,
      });
      expect(result.current.notifications[0].id).toBeDefined();
      expect(result.current.notifications[0].timestamp).toBeDefined();
    });
  });

  describe('dismissNotificationAtom', () => {
    it('should mark notification as dismissed', () => {
      const { result } = renderHookWithProvider(() => {
        const [notifications] = useAtom(systemNotificationsAtom);
        const [, addNotification] = useAtom(addNotificationAtom);
        const [, dismissNotification] = useAtom(dismissNotificationAtom);
        return { notifications, addNotification, dismissNotification };
      });

      // Add a notification
      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'System Ready',
          message: 'All systems are operational',
        });
      });

      const notificationId = result.current.notifications[0].id;

      // Dismiss the notification
      act(() => {
        result.current.dismissNotification(notificationId);
      });

      expect(result.current.notifications[0].dismissed).toBe(true);
    });
  });
});
