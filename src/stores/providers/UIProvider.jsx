import React, { createContext, useContext } from 'react';
import {
  currentScreenAtom,
  screenHistoryAtom,
  navigateToScreenAtom,
  goBackAtom,
  isLoadingAtom,
  loadingStatesAtom,
  setLoadingAtom,
  errorAtom,
  errorHistoryAtom,
  setErrorAtom,
  clearErrorAtom,
  resolveErrorAtom,
  toastNotificationsAtom,
  addToastAtom,
  dismissToastAtom,
  languageAtom,
  availableLanguagesAtom,
  translationsAtom,
  themeAtom,
  accessibilityAtom,
  modalAtom,
  overlayAtom,
  formStateAtom,
  formFieldAtom,
  userInteractionAtom,
  updateUserActivityAtom,
  uiPreferencesAtom,
  screenSizeAtom,
  focusAtom,
  setFocusAtom,
  resetUIAtom,
} from '../atoms/uiAtoms';

// Create context for UI-related state
const UIContext = createContext();

// UI Provider Component - just provides context, no separate store
export const UIProvider = ({ children }) => {
  return (
    <UIContext.Provider value={null}>
      {children}
    </UIContext.Provider>
  );
};

// Hook to use UI context (simplified)
export const useUI = () => {
  const context = useContext(UIContext);
  return context;
};

// Individual hooks for specific UI state - return atoms directly
export const useNavigation = () => {
  return { 
    currentScreen: currentScreenAtom, 
    screenHistory: screenHistoryAtom, 
    navigateToScreen: navigateToScreenAtom, 
    goBack: goBackAtom 
  };
};

export const useLoading = () => {
  return { 
    isLoading: isLoadingAtom, 
    loadingStates: loadingStatesAtom, 
    setLoading: setLoadingAtom 
  };
};

export const useError = () => {
  return { 
    error: errorAtom, 
    errorHistory: errorHistoryAtom, 
    setError: setErrorAtom, 
    clearError: clearErrorAtom, 
    resolveError: resolveErrorAtom 
  };
};

export const useToast = () => {
  return { 
    toastNotifications: toastNotificationsAtom, 
    addToast: addToastAtom, 
    dismissToast: dismissToastAtom 
  };
};

export const useLanguage = () => {
  return { 
    language: languageAtom, 
    availableLanguages: availableLanguagesAtom, 
    translations: translationsAtom 
  };
};

export const useTheme = () => {
  return { 
    theme: themeAtom, 
    accessibility: accessibilityAtom 
  };
};

export const useModal = () => {
  return { 
    modal: modalAtom, 
    overlay: overlayAtom 
  };
};

export const useForm = () => {
  return { 
    formState: formStateAtom, 
    formField: formFieldAtom 
  };
};

export const useUserInteraction = () => {
  return { 
    userInteraction: userInteractionAtom, 
    updateUserActivity: updateUserActivityAtom 
  };
};

export const useUIPreferences = () => {
  return uiPreferencesAtom;
};

export const useScreenSize = () => {
  return screenSizeAtom;
};

export const useFocus = () => {
  return { 
    focus: focusAtom, 
    setFocus: setFocusAtom 
  };
};

export const useUIActions = () => {
  return { resetUI: resetUIAtom };
};

export default UIProvider;
