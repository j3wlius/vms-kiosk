import { renderHook, act } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import {
  currentScreenAtom,
  screenHistoryAtom,
  navigateToScreenAtom,
  goBackAtom,
  isLoadingAtom,
  loadingStatesAtom,
  setLoadingAtom,
  errorAtom,
  setErrorAtom,
  clearErrorAtom,
  toastNotificationsAtom,
  addToastAtom,
  dismissToastAtom,
  languageAtom,
  themeAtom,
  modalAtom,
  overlayAtom,
} from '../atoms/uiAtoms';

// Helper function to render hooks with provider
const renderHookWithProvider = hook => {
  const wrapper = ({ children }) => <Provider>{children}</Provider>;
  return renderHook(hook, { wrapper });
};

describe('UI Atoms', () => {
  describe('currentScreenAtom', () => {
    it('should initialize with welcome screen', () => {
      const { result } = renderHookWithProvider(() => {
        const [screen] = useAtom(currentScreenAtom);
        return screen;
      });

      expect(result.current).toBe('welcome');
    });
  });

  describe('screenHistoryAtom', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHookWithProvider(() => {
        const [history] = useAtom(screenHistoryAtom);
        return history;
      });

      expect(result.current).toEqual([]);
    });
  });

  describe('navigateToScreenAtom', () => {
    it('should navigate to new screen and update history', () => {
      const { result } = renderHookWithProvider(() => {
        const [currentScreen] = useAtom(currentScreenAtom);
        const [history] = useAtom(screenHistoryAtom);
        const [, navigateToScreen] = useAtom(navigateToScreenAtom);
        return { currentScreen, history, navigateToScreen };
      });

      act(() => {
        result.current.navigateToScreen('checkin');
      });

      expect(result.current.currentScreen).toBe('checkin');
      expect(result.current.history).toEqual(['welcome']);
    });
  });

  describe('goBackAtom', () => {
    it('should go back to previous screen', () => {
      const { result } = renderHookWithProvider(() => {
        const [currentScreen] = useAtom(currentScreenAtom);
        const [history] = useAtom(screenHistoryAtom);
        const [, navigateToScreen] = useAtom(navigateToScreenAtom);
        const [, goBack] = useAtom(goBackAtom);
        return { currentScreen, history, navigateToScreen, goBack };
      });

      // Navigate to checkin first
      act(() => {
        result.current.navigateToScreen('checkin');
      });

      // Then go back
      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentScreen).toBe('welcome');
      expect(result.current.history).toEqual([]);
    });

    it('should not go back when history is empty', () => {
      const { result } = renderHookWithProvider(() => {
        const [currentScreen] = useAtom(currentScreenAtom);
        const [, goBack] = useAtom(goBackAtom);
        return { currentScreen, goBack };
      });

      const initialScreen = result.current.currentScreen;

      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentScreen).toBe(initialScreen);
    });
  });

  describe('isLoadingAtom', () => {
    it('should initialize with false', () => {
      const { result } = renderHookWithProvider(() => {
        const [isLoading] = useAtom(isLoadingAtom);
        return isLoading;
      });

      expect(result.current).toBe(false);
    });
  });

  describe('loadingStatesAtom', () => {
    it('should initialize with all loading states false', () => {
      const { result } = renderHookWithProvider(() => {
        const [loadingStates] = useAtom(loadingStatesAtom);
        return loadingStates;
      });

      expect(result.current).toEqual({
        ocr: false,
        camera: false,
        printer: false,
        api: false,
        form: false,
        navigation: false,
      });
    });
  });

  describe('setLoadingAtom', () => {
    it('should update specific loading state', () => {
      const { result } = renderHookWithProvider(() => {
        const [loadingStates] = useAtom(loadingStatesAtom);
        const [isLoading] = useAtom(isLoadingAtom);
        const [, setLoading] = useAtom(setLoadingAtom);
        return { loadingStates, isLoading, setLoading };
      });

      act(() => {
        result.current.setLoading({ key: 'ocr', value: true });
      });

      expect(result.current.loadingStates.ocr).toBe(true);
      expect(result.current.isLoading).toBe(true);
    });

    it('should update global loading state when any loading is true', () => {
      const { result } = renderHookWithProvider(() => {
        const [isLoading] = useAtom(isLoadingAtom);
        const [, setLoading] = useAtom(setLoadingAtom);
        return { isLoading, setLoading };
      });

      act(() => {
        result.current.setLoading({ key: 'camera', value: true });
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should update global loading state to false when all loading is false', () => {
      const { result } = renderHookWithProvider(() => {
        const [isLoading] = useAtom(isLoadingAtom);
        const [, setLoading] = useAtom(setLoadingAtom);
        return { isLoading, setLoading };
      });

      // Set loading to true first
      act(() => {
        result.current.setLoading({ key: 'camera', value: true });
      });

      expect(result.current.isLoading).toBe(true);

      // Set loading to false
      act(() => {
        result.current.setLoading({ key: 'camera', value: false });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('errorAtom', () => {
    it('should initialize with null', () => {
      const { result } = renderHookWithProvider(() => {
        const [error] = useAtom(errorAtom);
        return error;
      });

      expect(result.current).toBeNull();
    });
  });

  describe('setErrorAtom', () => {
    it('should set error with provided data', () => {
      const { result } = renderHookWithProvider(() => {
        const [error] = useAtom(errorAtom);
        const [, setError] = useAtom(setErrorAtom);
        return { error, setError };
      });

      const errorData = {
        message: 'Test error',
        type: 'error',
        component: 'test',
      };

      act(() => {
        result.current.setError(errorData);
      });

      expect(result.current.error).toMatchObject({
        message: 'Test error',
        type: 'error',
        component: 'test',
        resolved: false,
      });
      expect(result.current.error.id).toBeDefined();
      expect(result.current.error.timestamp).toBeDefined();
    });
  });

  describe('clearErrorAtom', () => {
    it('should clear current error', () => {
      const { result } = renderHookWithProvider(() => {
        const [error] = useAtom(errorAtom);
        const [, setError] = useAtom(setErrorAtom);
        const [, clearError] = useAtom(clearErrorAtom);
        return { error, setError, clearError };
      });

      // Set an error first
      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'error',
          component: 'test',
        });
      });

      expect(result.current.error).not.toBeNull();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('toastNotificationsAtom', () => {
    it('should initialize with empty array', () => {
      const { result } = renderHookWithProvider(() => {
        const [toasts] = useAtom(toastNotificationsAtom);
        return toasts;
      });

      expect(result.current).toEqual([]);
    });
  });

  describe('addToastAtom', () => {
    it('should add new toast notification', () => {
      const { result } = renderHookWithProvider(() => {
        const [toasts] = useAtom(toastNotificationsAtom);
        const [, addToast] = useAtom(addToastAtom);
        return { toasts, addToast };
      });

      const toastData = {
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully',
      };

      act(() => {
        result.current.addToast(toastData);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully',
        duration: 5000,
        persistent: false,
        dismissed: false,
      });
      expect(result.current.toasts[0].id).toBeDefined();
      expect(result.current.toasts[0].timestamp).toBeDefined();
    });
  });

  describe('dismissToastAtom', () => {
    it('should mark toast as dismissed', () => {
      const { result } = renderHookWithProvider(() => {
        const [toasts] = useAtom(toastNotificationsAtom);
        const [, addToast] = useAtom(addToastAtom);
        const [, dismissToast] = useAtom(dismissToastAtom);
        return { toasts, addToast, dismissToast };
      });

      // Add a toast
      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Success',
          message: 'Operation completed successfully',
        });
      });

      const toastId = result.current.toasts[0].id;

      // Dismiss the toast
      act(() => {
        result.current.dismissToast(toastId);
      });

      expect(result.current.toasts[0].dismissed).toBe(true);
    });
  });

  describe('languageAtom', () => {
    it('should initialize with en', () => {
      const { result } = renderHookWithProvider(() => {
        const [language] = useAtom(languageAtom);
        return language;
      });

      expect(result.current).toBe('en');
    });
  });

  describe('themeAtom', () => {
    it('should initialize with default theme', () => {
      const { result } = renderHookWithProvider(() => {
        const [theme] = useAtom(themeAtom);
        return theme;
      });

      expect(result.current).toEqual({
        mode: 'light',
        primaryColor: '#3B82F6',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
      });
    });
  });

  describe('modalAtom', () => {
    it('should initialize with closed modal', () => {
      const { result } = renderHookWithProvider(() => {
        const [modal] = useAtom(modalAtom);
        return modal;
      });

      expect(result.current).toEqual({
        isOpen: false,
        type: null,
        title: '',
        content: null,
        actions: [],
      });
    });
  });

  describe('overlayAtom', () => {
    it('should initialize with hidden overlay', () => {
      const { result } = renderHookWithProvider(() => {
        const [overlay] = useAtom(overlayAtom);
        return overlay;
      });

      expect(result.current).toEqual({
        isVisible: false,
        type: 'loading',
        message: '',
        progress: 0,
      });
    });
  });
});
