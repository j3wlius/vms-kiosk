# Custom Hooks

This directory contains custom React hooks that provide a clean interface between the UI components and the core services. Each hook is designed to be reusable, testable, and production-ready.

## Hooks Overview

### 1. useOCR Hook (`useOCR.js`)

**Purpose**: OCR processing and field extraction management

**Features**:

- Image processing with Tesseract.js
- Field pattern matching for different document types
- Confidence scoring and validation
- Preprocessing options configuration
- Progress tracking and error handling

**Usage**:

```javascript
import { useOCR } from './hooks';

const MyComponent = () => {
  const {
    isInitialized,
    isProcessing,
    progress,
    processImage,
    validateFields,
    reset,
  } = useOCR();

  const handleImageUpload = async imageBlob => {
    const results = await processImage(imageBlob);
    if (results) {
      console.log('Extracted fields:', results.fields);
      console.log('Confidence:', results.confidence);
    }
  };

  return (
    <div>
      {isProcessing && <div>Processing... {progress}%</div>}
      <input type="file" onChange={handleImageUpload} />
    </div>
  );
};
```

**Specialized Hooks**:

- `useOCRFieldExtraction`: Field validation and editing
- `useOCRTemplate`: Document template management

### 2. useCamera Hook (`useCamera.js`)

**Purpose**: Camera device management and image capture

**Features**:

- WebRTC camera integration
- Device switching and management
- Real-time preview and capture
- Permission handling
- Settings configuration

**Usage**:

```javascript
import { useCamera } from './hooks';

const CameraComponent = () => {
  const {
    isActive,
    devices,
    startPreview,
    stopPreview,
    captureImage,
    switchDevice,
  } = useCamera();

  const videoRef = useRef(null);

  const handleStartCamera = async () => {
    await startPreview(videoRef.current);
  };

  const handleCapture = async () => {
    const imageData = await captureImage();
    console.log('Captured image:', imageData);
  };

  return (
    <div>
      <video ref={videoRef} />
      <button onClick={handleStartCamera}>Start Camera</button>
      <button onClick={handleCapture}>Capture</button>
    </div>
  );
};
```

**Specialized Hooks**:

- `useCameraCapture`: Image capture with retry logic

### 3. usePrinter Hook (`usePrinter.js`)

**Purpose**: Print job management and queue status

**Features**:

- Badge printing with templates
- Print queue management
- Job status tracking
- Error handling and retry
- Settings configuration

**Usage**:

```javascript
import { usePrinter } from './hooks';

const PrintComponent = () => {
  const { isPrinting, printBadge, getQueueStatus, templates } = usePrinter();

  const handlePrint = async visitorData => {
    const jobId = await printBadge(visitorData, {
      template: 'default',
      copies: 1,
    });
    console.log('Print job started:', jobId);
  };

  return (
    <div>
      <button onClick={() => handlePrint(visitorData)}>Print Badge</button>
      {isPrinting && <div>Printing...</div>}
    </div>
  );
};
```

**Specialized Hooks**:

- `usePrintQueue`: Queue management and monitoring
- `usePrintTemplates`: Template configuration

### 4. useVisitorSession Hook (`useVisitorSession.js`)

**Purpose**: Visitor session lifecycle management

**Features**:

- Session creation and management
- Data persistence and auto-save
- Step tracking and navigation
- Check-in/check-out workflow
- Timeout handling

**Usage**:

```javascript
import { useVisitorSession } from './hooks';

const SessionComponent = () => {
  const {
    isActive,
    sessionId,
    startSession,
    updateVisitorData,
    completeCheckIn,
    endSession,
  } = useVisitorSession();

  const handleStartSession = async () => {
    const result = await startSession({
      name: 'John Doe',
      company: 'Acme Corp',
    });
    console.log('Session started:', result);
  };

  const handleCheckIn = async () => {
    const result = await completeCheckIn({
      checkInTime: new Date().toISOString(),
    });
    console.log('Check-in completed:', result);
  };

  return (
    <div>
      {!isActive ? (
        <button onClick={handleStartSession}>Start Session</button>
      ) : (
        <button onClick={handleCheckIn}>Check In</button>
      )}
    </div>
  );
};
```

**Specialized Hooks**:

- `useVisitorForm`: Form validation and management

### 5. useOfflineSync Hook (`useOfflineSync.js`)

**Purpose**: Network status and data synchronization

**Features**:

- Network status monitoring
- Offline data queuing
- Automatic synchronization
- Conflict resolution
- Error handling and retry

**Usage**:

```javascript
import { useOfflineSync } from './hooks';

const SyncComponent = () => {
  const { isOnline, syncStatus, triggerSync, getSyncStatus } = useOfflineSync();

  const handleSync = async () => {
    const result = await triggerSync();
    console.log('Sync result:', result);
  };

  return (
    <div>
      <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
      <div>Sync: {syncStatus}</div>
      <button onClick={handleSync}>Sync Now</button>
    </div>
  );
};
```

**Specialized Hooks**:

- `useNetworkStatus`: Network quality monitoring

## Utility Hooks

### useServiceHealth

Monitors the health of all services:

```javascript
import { useServiceHealth } from './hooks';

const HealthComponent = () => {
  const { health, checkHealth } = useServiceHealth();

  return (
    <div>
      <div>Storage: {health.storage ? 'OK' : 'Error'}</div>
      <div>API: {health.api ? 'OK' : 'Error'}</div>
      <button onClick={checkHealth}>Check Health</button>
    </div>
  );
};
```

### useServices

Manages service initialization and cleanup:

```javascript
import { useServices } from './hooks';

const App = () => {
  const { services, isInitialized, initializeServices } = useServices();

  useEffect(() => {
    initializeServices();
  }, []);

  if (!isInitialized) {
    return <div>Initializing services...</div>;
  }

  return <div>App ready!</div>;
};
```

### useErrorHandler

Centralized error handling:

```javascript
import { useErrorHandler } from './hooks';

const ErrorComponent = () => {
  const { errors, addError, clearErrors } = useErrorHandler();

  const handleError = error => {
    addError(error);
  };

  return (
    <div>
      {errors.map(error => (
        <div key={error.id}>{error.message}</div>
      ))}
      <button onClick={clearErrors}>Clear Errors</button>
    </div>
  );
};
```

## Hook Patterns

### State Management

All hooks follow a consistent pattern for state management:

- Local state for UI-specific data
- Jotai atoms for global state
- Callbacks for state updates
- Error handling with user-friendly messages

### Error Handling

Consistent error handling across all hooks:

- Try-catch blocks for async operations
- Error state management
- User-friendly error messages
- Graceful degradation

### Performance Optimization

Hooks are optimized for performance:

- Memoized callbacks with useCallback
- Proper dependency arrays
- Cleanup on unmount
- Debounced operations where appropriate

## Testing

Each hook includes comprehensive tests:

```bash
# Run hook tests
pnpm test src/hooks

# Run specific hook tests
pnpm test src/hooks/__tests__/useOCR.test.js
```

### Test Patterns

- Mock services and dependencies
- Test state updates and side effects
- Test error handling scenarios
- Test cleanup and unmounting

## Best Practices

### 1. Hook Composition

Compose hooks to create more complex functionality:

```javascript
const useVisitorCheckIn = () => {
  const session = useVisitorSession();
  const camera = useCamera();
  const ocr = useOCR();
  const printer = usePrinter();

  const checkInVisitor = async imageBlob => {
    // Process image with OCR
    const ocrResults = await ocr.processImage(imageBlob);

    // Update session with extracted data
    await session.updateVisitorData(ocrResults.fields);

    // Complete check-in
    const result = await session.completeCheckIn();

    // Print badge
    if (result.success) {
      await printer.printBadge(result.visitorData);
    }

    return result;
  };

  return { checkInVisitor, ...session, ...camera, ...ocr, ...printer };
};
```

### 2. Error Boundaries

Use error boundaries with hooks:

```javascript
const ErrorBoundary = ({ children }) => {
  const { addError } = useErrorHandler();

  return (
    <ErrorBoundary
      onError={error => addError(error)}
      fallback={<div>Something went wrong</div>}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 3. Custom Hook Testing

Test hooks with React Testing Library:

```javascript
import { renderHook, act } from '@testing-library/react';

test('should update state correctly', () => {
  const { result } = renderHook(() => useMyHook());

  act(() => {
    result.current.updateState('new value');
  });

  expect(result.current.state).toBe('new value');
});
```

## Integration with Components

Hooks are designed to integrate seamlessly with React components:

```javascript
import { useOCR, useCamera, usePrinter } from './hooks';

const CheckInScreen = () => {
  const ocr = useOCR();
  const camera = useCamera();
  const printer = usePrinter();

  const handleImageCapture = async () => {
    const imageData = await camera.captureImage();
    const ocrResults = await ocr.processImage(imageData.blob);

    if (ocrResults.confidence > 0.8) {
      await printer.printBadge(ocrResults.fields);
    }
  };

  return (
    <div>
      <CameraPreview />
      <button onClick={handleImageCapture}>Capture & Process</button>
    </div>
  );
};
```

## Future Enhancements

### Planned Features

- Hook composition utilities
- Advanced error recovery
- Performance monitoring
- Hook debugging tools
- TypeScript support

### Performance Optimizations

- Virtual scrolling for large lists
- Image compression hooks
- Caching strategies
- Memory management

This hook system provides a robust foundation for building the kiosk application with clean separation of concerns, excellent testability, and production-ready error handling.
