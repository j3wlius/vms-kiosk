// Main store exports
export { AppProvider } from './providers/AppProvider';
export { VisitorProvider } from './providers/VisitorProvider';
export { SystemProvider } from './providers/SystemProvider';
export { UIProvider } from './providers/UIProvider';

// Atom exports
export * from './atoms/visitorAtoms';
export * from './atoms/systemAtoms';
export * from './atoms/uiAtoms';
export * from './atoms/derivedAtoms';

// Hook exports
export {
  useVisitor,
  useCurrentVisitor,
  useFormData,
  useVisitorSession,
  useFormValidation,
  useFormSteps,
  useOCR,
  useVisitorBadge,
  useVisitorActions,
} from './providers/VisitorProvider';

export {
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
} from './providers/SystemProvider';

export {
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
} from './providers/UIProvider';

// Component exports
export { default as ErrorBoundary } from './components/ErrorBoundary';

// Store configuration
export const storeConfig = {
  devtools: process.env.NODE_ENV === 'development',
  persistence: {
    enabled: true,
    storage: 'localStorage',
    keys: ['visitorSession', 'formData', 'uiPreferences'],
  },
};
