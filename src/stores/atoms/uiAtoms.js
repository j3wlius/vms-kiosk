import { atom } from 'jotai';

// Screen navigation atoms
export const currentScreenAtom = atom('welcome'); // 'welcome', 'checkin', 'verify', 'contact', 'print', 'idle'

export const screenHistoryAtom = atom([]);

export const navigateToScreenAtom = atom(null, (get, set, screen) => {
  const currentScreen = get(currentScreenAtom);
  const history = get(screenHistoryAtom);

  set(screenHistoryAtom, [...history, currentScreen]);
  set(currentScreenAtom, screen);
});

export const goBackAtom = atom(null, (get, set) => {
  const history = get(screenHistoryAtom);
  if (history.length > 0) {
    const previousScreen = history[history.length - 1];
    set(screenHistoryAtom, history.slice(0, -1));
    set(currentScreenAtom, previousScreen);
  }
});

// Loading states atoms
export const isLoadingAtom = atom(false);

export const loadingStatesAtom = atom({
  ocr: false,
  camera: false,
  printer: false,
  api: false,
  form: false,
  navigation: false,
});

export const setLoadingAtom = atom(null, (get, set, { key, value }) => {
  const loadingStates = get(loadingStatesAtom);
  set(loadingStatesAtom, { ...loadingStates, [key]: value });

  // Update global loading state
  const hasAnyLoading = Object.values({ ...loadingStates, [key]: value }).some(
    Boolean
  );
  set(isLoadingAtom, hasAnyLoading);
});

// Error handling atoms
export const errorAtom = atom(null);

export const errorHistoryAtom = atom([]);

export const setErrorAtom = atom(null, (get, set, error) => {
  const errorHistory = get(errorHistoryAtom);
  const newError = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    message: error.message || 'An unknown error occurred',
    type: error.type || 'error',
    component: error.component || 'unknown',
    details: error.details || null,
    resolved: false,
  };

  set(errorAtom, newError);
  set(errorHistoryAtom, [...errorHistory, newError]);
});

export const clearErrorAtom = atom(null, (get, set) => {
  set(errorAtom, null);
});

export const resolveErrorAtom = atom(null, (get, set, errorId) => {
  const errorHistory = get(errorHistoryAtom);
  set(
    errorHistoryAtom,
    errorHistory.map(error =>
      error.id === errorId ? { ...error, resolved: true } : error
    )
  );
});

// Toast notifications atoms
export const toastNotificationsAtom = atom([]);

export const addToastAtom = atom(null, (get, set, toast) => {
  const notifications = get(toastNotificationsAtom);
  const newToast = {
    id: Date.now(),
    type: toast.type || 'info', // 'success', 'error', 'warning', 'info'
    title: toast.title || '',
    message: toast.message,
    duration: toast.duration || 5000,
    persistent: toast.persistent || false,
    dismissed: false,
  };
  set(toastNotificationsAtom, [...notifications, newToast]);
});

export const dismissToastAtom = atom(null, (get, set, toastId) => {
  const notifications = get(toastNotificationsAtom);
  set(
    toastNotificationsAtom,
    notifications.map(toast =>
      toast.id === toastId ? { ...toast, dismissed: true } : toast
    )
  );
});

// Language and internationalization atoms
export const languageAtom = atom('en');

export const availableLanguagesAtom = atom([
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
]);

export const translationsAtom = atom({});

// Theme and accessibility atoms
export const themeAtom = atom({
  mode: 'light', // 'light', 'dark', 'auto'
  primaryColor: '#3B82F6',
  fontSize: 'medium', // 'small', 'medium', 'large', 'xlarge'
  highContrast: false,
  reducedMotion: false,
});

export const accessibilityAtom = atom({
  screenReader: false,
  keyboardNavigation: true,
  focusVisible: true,
  announcements: [],
});

// Modal and overlay atoms
export const modalAtom = atom({
  isOpen: false,
  type: null, // 'confirmation', 'error', 'info', 'custom'
  title: '',
  content: null,
  actions: [],
});

export const overlayAtom = atom({
  isVisible: false,
  type: 'loading', // 'loading', 'error', 'success', 'custom'
  message: '',
  progress: 0,
});

// Form state atoms
export const formStateAtom = atom({
  isDirty: false,
  isSubmitting: false,
  isValid: false,
  errors: {},
  touched: {},
});

export const formFieldAtom = atom(get => fieldName => {
  const formState = get(formStateAtom);
  return {
    value: formState[fieldName] || '',
    error: formState.errors[fieldName] || '',
    touched: formState.touched[fieldName] || false,
  };
});

// User interaction atoms
export const userInteractionAtom = atom({
  lastActivity: Date.now(),
  isIdle: false,
  idleTimeout: 30000, // 30 seconds
  touchEnabled: 'ontouchstart' in window,
  keyboardUsed: false,
});

export const updateUserActivityAtom = atom(null, (get, set) => {
  set(userInteractionAtom, {
    ...get(userInteractionAtom),
    lastActivity: Date.now(),
    isIdle: false,
  });
});

// UI preferences atoms
export const uiPreferencesAtom = atom({
  animations: true,
  sounds: true,
  hapticFeedback: true,
  autoAdvance: false,
  showHints: true,
  compactMode: false,
});

// Screen size and responsive atoms
export const screenSizeAtom = atom({
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
  breakpoint: 'desktop', // 'mobile', 'tablet', 'desktop', 'kiosk'
});

// Focus management atoms
export const focusAtom = atom({
  current: null,
  trap: false,
  restore: null,
});

export const setFocusAtom = atom(null, (get, set, elementId) => {
  set(focusAtom, {
    ...get(focusAtom),
    current: elementId,
    restore: get(focusAtom).current,
  });
});

// UI reset atom
export const resetUIAtom = atom(null, (get, set) => {
  set(currentScreenAtom, 'welcome');
  set(screenHistoryAtom, []);
  set(isLoadingAtom, false);
  set(loadingStatesAtom, {
    ocr: false,
    camera: false,
    printer: false,
    api: false,
    form: false,
    navigation: false,
  });
  set(errorAtom, null);
  set(toastNotificationsAtom, []);
  set(modalAtom, {
    isOpen: false,
    type: null,
    title: '',
    content: null,
    actions: [],
  });
  set(overlayAtom, {
    isVisible: false,
    type: 'loading',
    message: '',
    progress: 0,
  });
  set(formStateAtom, {
    isDirty: false,
    isSubmitting: false,
    isValid: false,
    errors: {},
    touched: {},
  });
});
