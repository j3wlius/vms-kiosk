# Core Services

This directory contains the core business logic services for the kiosk app. Each service is designed to be independent, testable, and production-ready.

## Services Overview

### 1. Storage Service (`storageService.js`)

**Purpose**: Encrypted local storage with GDPR compliance

**Features**:

- AES encryption for sensitive data
- GDPR-compliant data management
- Offline queue for API requests
- Data retention and cleanup
- Consent management
- Export functionality for data portability

**Usage**:

```javascript
import { storageService } from './services';

// Store encrypted data
storageService.setItem('visitor_data', { name: 'John Doe' });

// Retrieve and decrypt data
const data = storageService.getItem('visitor_data');

// GDPR compliance
storageService.clearPersonalData();
const exported = storageService.exportVisitorData('visitor_123');
```

### 2. API Service (`apiService.js`)

**Purpose**: HTTP client with retry logic and offline support

**Features**:

- Automatic retry with exponential backoff
- Offline request queuing
- Visitor CRUD operations
- Host notification system
- System health reporting
- Analytics and statistics

**Usage**:

```javascript
import { apiService } from './services';

// Create visitor
const visitor = await apiService.createVisitor({
  name: 'John Doe',
  email: 'john@example.com',
});

// Notify host
await apiService.notifyHost(visitor);

// Get statistics
const stats = await apiService.getVisitorStats();
```

### 3. Camera Service (`cameraService.js`)

**Purpose**: WebRTC camera integration with device management

**Features**:

- Multiple camera device support
- Real-time preview
- Image capture (Blob and Base64)
- Device switching
- Permission management
- Settings configuration

**Usage**:

```javascript
import { cameraService } from './services';

// Initialize camera
await cameraService.initialize();

// Start preview
await cameraService.startPreview(videoElement);

// Capture image
const imageBlob = await cameraService.captureImage();
const base64Image = await cameraService.captureImageAsBase64();
```

### 4. OCR Service (`ocrService.js`)

**Purpose**: Document text extraction with Tesseract.js

**Features**:

- Multi-document type support (Driver's License, Passport, National ID)
- Image preprocessing with Jimp
- Field pattern matching
- Confidence scoring
- Document type detection
- Validation and error handling

**Usage**:

```javascript
import { ocrService } from './services';

// Initialize OCR
await ocrService.initialize();

// Process image
const results = await ocrService.processImage(imageBlob);

// Results contain:
// - text: Raw extracted text
// - fields: Parsed field data
// - confidence: Confidence score (0-1)
// - documentType: Detected document type
```

### 5. Printing Service (`printingService.js`)

**Purpose**: Badge printing with queue management

**Features**:

- Multiple badge templates
- QR code generation
- Print queue management
- Multiple copy support
- Template customization
- Error handling and retry

**Usage**:

```javascript
import { printingService } from './services';

// Initialize printing
await printingService.initialize();

// Print badge
const jobId = await printingService.printBadge(visitorData, {
  template: 'default',
  copies: 1,
});

// Queue management
const status = printingService.getQueueStatus();
```

## Service Integration

### Initialization

```javascript
import { initializeServices, checkServiceHealth } from './services';

// Initialize all services
const results = await initializeServices();
console.log('Service initialization:', results);

// Check service health
const health = await checkServiceHealth();
console.log('Service health:', health);
```

### Error Handling

All services include comprehensive error handling:

- Try-catch blocks for async operations
- Graceful degradation for offline scenarios
- Detailed error logging
- User-friendly error messages

### Testing

Each service includes comprehensive unit tests:

```bash
# Run service tests
pnpm test src/services

# Run specific service tests
pnpm test src/services/__tests__/storageService.test.js
```

## Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_KIOSK_ID=kiosk_001

# Service Settings
VITE_STORAGE_RETENTION_DAYS=30
VITE_OCR_CONFIDENCE_THRESHOLD=0.7
VITE_CAMERA_DEFAULT_RESOLUTION=1280x720
```

### Service Configuration

```javascript
import { serviceConfig } from './services';

// Update service settings
serviceConfig.storage.retentionPeriod = 60 * 24 * 60 * 60 * 1000; // 60 days
serviceConfig.ocr.confidenceThreshold = 0.8;
serviceConfig.camera.defaultResolution = { width: 1920, height: 1080 };
```

## Dependencies

### Required Packages

- `crypto-js` - Encryption for storage service
- `tesseract.js` - OCR processing
- `jimp` - Image preprocessing
- `qrcode` - QR code generation
- `html2canvas` - Print rendering

### Browser APIs

- `navigator.mediaDevices` - Camera access
- `localStorage` - Data persistence
- `fetch` - HTTP requests
- `window.print` - Printing functionality

## Performance Considerations

### Memory Management

- Services use singleton pattern to prevent memory leaks
- Proper cleanup methods for resource management
- Image processing with size limits

### Caching

- Local storage caching for offline support
- Service worker integration for API caching
- Image compression for OCR processing

### Error Recovery

- Automatic retry mechanisms
- Fallback strategies for service failures
- Graceful degradation when services unavailable

## Security

### Data Protection

- AES encryption for sensitive data
- Secure key generation and storage
- GDPR compliance with data retention policies

### API Security

- Request timeout and retry limits
- Input validation and sanitization
- Secure error handling without data leakage

## Monitoring

### Health Checks

```javascript
import { checkServiceHealth } from './services';

// Regular health monitoring
setInterval(async () => {
  const health = await checkServiceHealth();
  if (!health.overall) {
    console.warn('Service health issues detected:', health);
  }
}, 30000); // Check every 30 seconds
```

### Analytics

- Service usage tracking
- Error rate monitoring
- Performance metrics collection

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Check browser permissions
   - Verify HTTPS requirement
   - Test with different devices

2. **OCR low accuracy**
   - Adjust image preprocessing settings
   - Check image quality and lighting
   - Verify document positioning

3. **Printing failures**
   - Check browser print settings
   - Verify popup blockers
   - Test with different templates

4. **Storage errors**
   - Check localStorage availability
   - Verify encryption key generation
   - Monitor storage quota

### Debug Mode

Enable debug logging:

```javascript
// Set debug mode
localStorage.setItem('kiosk_debug', 'true');

// Service-specific debugging
cameraService.onError((message, error) => {
  console.error('Camera Error:', message, error);
});
```

## Future Enhancements

### Planned Features

- Service worker for offline functionality
- Advanced image preprocessing algorithms
- Machine learning for document recognition
- Real-time collaboration features
- Advanced analytics dashboard

### Performance Optimizations

- WebAssembly for OCR processing
- Web Workers for heavy computations
- Progressive image loading
- Advanced caching strategies


