import React from 'react';
import { Provider, createStore } from 'jotai';
import VisitorProvider from './VisitorProvider';
import SystemProvider from './SystemProvider';
import UIProvider from './UIProvider';
import ErrorBoundary from '../components/ErrorBoundary';

// Create single Jotai store for the entire app
const appStore = createStore();

// Main app provider that combines all providers
export const AppProvider = ({ children }) => {
  return (
    <ErrorBoundary>
      <Provider store={appStore}>
        <UIProvider>
          <SystemProvider>
            <VisitorProvider>{children}</VisitorProvider>
          </SystemProvider>
        </UIProvider>
      </Provider>
    </ErrorBoundary>
  );
};

// Export individual providers for granular usage
export { VisitorProvider, SystemProvider, UIProvider };

// Export all hooks for convenience
export {
  // Visitor hooks
  useVisitor,
  useCurrentVisitor,
  useFormData,
  useVisitorSession,
  useFormValidation,
  useFormSteps,
  useOCR,
  useVisitorBadge,
  useVisitorActions,
} from './VisitorProvider';

export {
  // System hooks
  useSystem,
  usePrinter,
  useCamera,
  useNetwork,
  useSystemHealth,
  useSystemErrors,
  useSystemActions,
  useSystemReset,
  useDevices,
  useSystemNotifications,
} from './SystemProvider';

export {
  // UI hooks
  useUI,
  useNavigation,
  useLoading,
  useError,
  useToast,
  useLanguage,
  useTheme,
  useModal,
  useForm,
  useUserInteraction,
  useUIPreferences,
  useScreenSize,
  useFocus,
  useUIActions,
} from './UIProvider';

export default AppProvider;
