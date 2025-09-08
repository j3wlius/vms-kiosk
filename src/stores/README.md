# State Management System

This directory contains the complete state management system for the kiosk app using Jotai for atomic state management.

## Architecture

The state management system is organized into three main layers:

1. **Atoms** - Individual pieces of state
2. **Providers** - React context providers for different domains
3. **Hooks** - Custom hooks for easy state access

## Directory Structure

```
src/stores/
├── atoms/
│   ├── visitorAtoms.js      # Visitor-related state
│   ├── systemAtoms.js       # System status and configuration
│   ├── uiAtoms.js          # UI state and interactions
│   └── derivedAtoms.js     # Computed/derived state
├── providers/
│   ├── AppProvider.jsx     # Main provider combining all others
│   ├── VisitorProvider.jsx # Visitor state provider
│   ├── SystemProvider.jsx  # System state provider
│   └── UIProvider.jsx      # UI state provider
├── components/
│   └── ErrorBoundary.jsx   # Error boundary component
├── __tests__/
│   ├── visitorAtoms.test.js
│   ├── systemAtoms.test.js
│   ├── uiAtoms.test.js
│   ├── derivedAtoms.test.js
│   ├── providers.test.jsx
│   └── setup.js
├── index.js                # Main exports
└── README.md              # This file
```

## Usage

### Basic Setup

```jsx
import { AppProvider } from './stores';

function App() {
  return (
    <AppProvider>
      <YourAppComponents />
    </AppProvider>
  );
}
```

### Using State in Components

```jsx
import { useFormData, useNavigation, useLoading } from './stores';

function MyComponent() {
  const formData = useFormData();
  const { currentScreen, navigateToScreen } = useNavigation();
  const { isLoading, setLoading } = useLoading();

  // Use the state...
}
```

## Atom Categories

### Visitor Atoms (`visitorAtoms.js`)

- **Data Atoms**: `currentVisitorAtom`, `formDataAtom`, `visitorSessionAtom`
- **Validation Atoms**: `formValidationAtom`, `canProceedAtom`
- **OCR Atoms**: `ocrProcessingAtom`, `ocrResultsAtom`
- **Computed Atoms**: `visitorBadgeDataAtom`, `formCompletionAtom`

### System Atoms (`systemAtoms.js`)

- **Device Atoms**: `printerStatusAtom`, `cameraStatusAtom`
- **Network Atoms**: `networkStatusAtom`, `offlineQueueAtom`
- **Health Atoms**: `systemHealthAtom`, `systemMetricsAtom`
- **Error Atoms**: `systemErrorsAtom`, `addSystemErrorAtom`
- **Notification Atoms**: `systemNotificationsAtom`, `addNotificationAtom`

### UI Atoms (`uiAtoms.js`)

- **Navigation Atoms**: `currentScreenAtom`, `screenHistoryAtom`
- **Loading Atoms**: `isLoadingAtom`, `loadingStatesAtom`
- **Error Atoms**: `errorAtom`, `setErrorAtom`
- **Toast Atoms**: `toastNotificationsAtom`, `addToastAtom`
- **Theme Atoms**: `themeAtom`, `accessibilityAtom`

### Derived Atoms (`derivedAtoms.js`)

- **Form Status**: `formCompletionAtom`
- **System Status**: `overallSystemStatusAtom`
- **Device Status**: `ocrStatusAtom`, `printQueueStatusAtom`, `cameraReadinessAtom`
- **Error Summary**: `errorSummaryAtom`, `loadingSummaryAtom`

## Providers

### AppProvider

The main provider that combines all other providers and provides error boundary functionality.

### VisitorProvider

Provides visitor-related state and hooks:

- `useVisitor()` - Access to all visitor state
- `useCurrentVisitor()` - Current visitor data
- `useFormData()` - Form data state
- `useFormValidation()` - Form validation state
- `useOCR()` - OCR processing state

### SystemProvider

Provides system-related state and hooks:

- `useSystem()` - Access to all system state
- `usePrinter()` - Printer status and controls
- `useCamera()` - Camera status and controls
- `useNetwork()` - Network connectivity state
- `useSystemHealth()` - System health monitoring

### UIProvider

Provides UI-related state and hooks:

- `useUI()` - Access to all UI state
- `useNavigation()` - Screen navigation
- `useLoading()` - Loading states
- `useError()` - Error handling
- `useToast()` - Toast notifications

## Error Handling

The system includes comprehensive error handling:

1. **Error Boundary**: Catches React errors and displays fallback UI
2. **Error Atoms**: Track and manage errors across the application
3. **Error Recovery**: Automatic error recovery mechanisms
4. **Error Logging**: Detailed error logging for debugging

## Testing

The state management system includes comprehensive tests:

- **Unit Tests**: Individual atom testing
- **Integration Tests**: Provider and hook testing
- **Error Testing**: Error boundary and error handling testing

Run tests with:

```bash
npm run test src/stores
```

## Best Practices

1. **Use Specific Hooks**: Prefer specific hooks over generic ones
2. **Derived State**: Use derived atoms for computed state
3. **Error Handling**: Always handle errors gracefully
4. **Testing**: Write tests for all custom hooks
5. **Performance**: Use `useCallback` and `useMemo` when appropriate

## Migration Guide

If migrating from another state management solution:

1. Replace state management imports with store imports
2. Update component state access to use hooks
3. Update error handling to use error atoms
4. Update tests to use new testing utilities

## Troubleshooting

### Common Issues

1. **Provider Error**: Ensure components are wrapped in appropriate providers
2. **Hook Error**: Check that hooks are used within correct provider context
3. **State Not Updating**: Verify atom dependencies and derived atom logic
4. **Memory Leaks**: Ensure proper cleanup in useEffect hooks

### Debug Tools

- Use React DevTools to inspect atom values
- Check browser console for error messages
- Use Jotai DevTools for atom debugging (development only)


