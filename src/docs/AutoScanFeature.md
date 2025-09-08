# Auto-Scan ID Document Feature

## Overview

The Auto-Scan feature provides automatic document detection and scanning with real-time positioning guidance. Users simply need to position their ID document in front of the camera, and the system will automatically detect, analyze, and scan the document when it's properly positioned.

## Key Features

### 1. **Real-Time Document Detection**
- Continuous analysis of camera feed
- Automatic detection of document boundaries
- Edge detection using Sobel operators
- Contour analysis for document shape recognition

### 2. **Positioning Guidance**
- Visual overlay showing document outline
- Real-time quality assessment
- Dynamic instructions based on document position
- Color-coded feedback (blue → yellow → green)

### 3. **Automatic Scanning**
- Triggers scan when document is properly positioned
- Quality threshold-based scanning (70% minimum)
- Cooldown period between scans (2 seconds)
- Maximum retry attempts (3 attempts)

### 4. **User Experience**
- Clear visual feedback with status indicators
- Real-time instructions and guidance
- Manual scan fallback option
- Error recovery and retry mechanisms

## Technical Implementation

### Core Components

#### 1. **DocumentDetectionService** (`src/services/documentDetectionService.js`)
- Analyzes video frames for document presence
- Calculates document quality metrics (contrast, sharpness, brightness)
- Detects document boundaries and positioning
- Provides real-time feedback on document status

**Key Methods:**
```javascript
// Start continuous analysis
startAnalysis(videoElement, options)

// Stop analysis
stopAnalysis()

// Get current analysis results
getCurrentAnalysis()

// Update detection settings
updateSettings(newSettings)
```

#### 2. **useAutoScan Hook** (`src/hooks/useAutoScan.js`)
- Manages auto-scanning state and logic
- Handles document detection callbacks
- Coordinates between camera and OCR services
- Provides scanning status and controls

**Key Features:**
```javascript
const {
  isAutoScanning,
  documentStatus,
  startAutoScan,
  stopAutoScan,
  manualScan,
  canScan,
  hasDocument,
  isPositioned,
  quality,
  instructions
} = useAutoScan();
```

#### 3. **AutoScanCameraPreview Component** (`src/components/ui/AutoScanCameraPreview.jsx`)
- Enhanced camera preview with auto-scan capabilities
- Real-time visual feedback and overlays
- Quality indicators and status displays
- Manual scan button when ready

### Document Detection Algorithm

#### 1. **Image Preprocessing**
- Convert to grayscale for analysis
- Apply edge detection using Sobel operators
- Calculate image quality metrics

#### 2. **Document Detection**
- Edge detection and contour finding
- Rectangular shape validation
- Size validation (30-90% of frame)
- Position validation (centered within tolerance)

#### 3. **Quality Assessment**
- **Contrast**: Standard deviation of pixel values
- **Sharpness**: Laplacian variance for edge detection
- **Brightness**: Average pixel intensity
- **Overall Quality**: Weighted combination (40% contrast + 40% sharpness + 20% brightness)

#### 4. **Positioning Analysis**
- Center detection within 10% tolerance
- Document size validation
- Stability assessment for auto-scan trigger

## Configuration

### Detection Settings
```javascript
const settings = {
  analysisInterval: 100,        // Frame analysis interval (ms)
  minDocumentSize: 0.3,         // Minimum document size (fraction of frame)
  maxDocumentSize: 0.9,         // Maximum document size (fraction of frame)
  minContrast: 0.3,             // Minimum contrast threshold
  minSharpness: 0.5,            // Minimum sharpness threshold
  positionTolerance: 0.1,       // Position tolerance (fraction of frame)
  qualityThreshold: 0.7,        // Minimum quality for auto-scan
};
```

### Auto-Scan Settings
```javascript
const autoScanSettings = {
  scanCooldown: 2000,           // Minimum time between scans (ms)
  qualityThreshold: 0.7,        // Minimum quality for auto-scan
  maxScanAttempts: 3,           // Maximum consecutive scan attempts
  analysisInterval: 100,        // Frame analysis interval (ms)
};
```

## User Interface

### Visual Feedback

#### 1. **Document Outline**
- Blue border when document detected
- Yellow border when positioned but low quality
- Green border when ready for scanning

#### 2. **Quality Indicator**
- Real-time quality percentage
- Color-coded progress bar
- Visual feedback on document quality

#### 3. **Status Indicators**
- Document detected (green/gray dot)
- Document positioned (green/gray dot)
- Quality threshold met (green/yellow/gray dot)

#### 4. **Instructions**
- Dynamic text based on current status
- Real-time guidance for positioning
- Clear next steps for user

### States and Transitions

```
Ready → Document Detected → Document Positioned → Quality Check → Auto-Scan → Success/Error
  ↓           ↓                    ↓                ↓            ↓
Manual    Positioning         Quality           Scanning    Verification
Entry     Guidance           Feedback          Process     Screen
```

## Integration

### CheckInScreen Integration
The CheckInScreen has been updated to use the new auto-scanning functionality:

```javascript
// Replace old camera preview
<AutoScanCameraPreview
  onScanComplete={handleScanComplete}
  onError={handleCameraError}
  autoStart={true}
  showInstructions={true}
  showQualityIndicator={true}
/>
```

### OCR Integration
Auto-scanning integrates seamlessly with the existing OCR service:
- Automatic image capture when document is ready
- OCR processing with confidence scoring
- Form data population with extracted fields
- Navigation to verification screen on success

## Performance Considerations

### 1. **Frame Analysis**
- Optimized for 100ms intervals
- Efficient edge detection algorithms
- Minimal memory footprint
- Background processing to avoid UI blocking

### 2. **Resource Management**
- Automatic cleanup on component unmount
- Efficient canvas operations
- Optimized image processing
- Memory leak prevention

### 3. **Browser Compatibility**
- Uses standard Canvas API
- WebRTC for camera access
- Fallback mechanisms for older browsers
- Progressive enhancement approach

## Error Handling

### 1. **Camera Errors**
- Permission denied handling
- Device not found recovery
- Stream initialization failures
- Automatic retry mechanisms

### 2. **Detection Errors**
- Invalid document shapes
- Poor lighting conditions
- Motion blur handling
- Edge case recovery

### 3. **OCR Errors**
- Low confidence results
- Processing failures
- Network timeouts
- Manual fallback options

## Testing

### Unit Tests
- Document detection algorithms
- Quality calculation methods
- Positioning validation
- Edge case handling

### Integration Tests
- Camera integration
- OCR service integration
- UI component interactions
- End-to-end workflows

### Performance Tests
- Frame analysis performance
- Memory usage monitoring
- CPU utilization
- Battery impact assessment

## Future Enhancements

### 1. **Advanced Detection**
- Machine learning-based document detection
- Multi-document support
- 3D document positioning
- Advanced lighting compensation

### 2. **User Experience**
- Voice guidance
- Haptic feedback
- Accessibility improvements
- Multi-language support

### 3. **Performance**
- WebAssembly optimization
- GPU acceleration
- Background processing
- Caching mechanisms

## Troubleshooting

### Common Issues

#### 1. **Document Not Detected**
- Check lighting conditions
- Ensure document is flat
- Verify camera permissions
- Clean camera lens

#### 2. **Poor Quality Detection**
- Improve lighting
- Hold document steady
- Check for glare or shadows
- Adjust document angle

#### 3. **Auto-Scan Not Triggering**
- Verify quality threshold settings
- Check positioning tolerance
- Ensure document is centered
- Review scan cooldown settings

### Debug Mode
Enable debug logging to troubleshoot issues:
```javascript
// Enable debug mode
documentDetectionService.updateSettings({
  debug: true,
  logLevel: 'verbose'
});
```

## API Reference

### DocumentDetectionService

#### Methods
- `initialize()` - Initialize the service
- `startAnalysis(videoElement, options)` - Start frame analysis
- `stopAnalysis()` - Stop frame analysis
- `getCurrentAnalysis()` - Get current analysis results
- `updateSettings(settings)` - Update detection settings
- `cleanup()` - Cleanup resources

#### Callbacks
- `onDocumentDetected(analysis)` - Document detected callback
- `onDocumentPositioned(analysis)` - Document positioned callback
- `onDocumentQualityChanged(analysis)` - Quality changed callback
- `onAnalysisComplete(analysis)` - Analysis complete callback

### useAutoScan Hook

#### State
- `isAutoScanning` - Auto-scanning active status
- `documentStatus` - Current document status
- `isScanning` - Currently scanning status
- `canScan` - Can trigger scan
- `hasDocument` - Document detected
- `isPositioned` - Document positioned
- `quality` - Current quality score
- `instructions` - Current instructions

#### Actions
- `initialize()` - Initialize auto-scan
- `startAutoScan(videoElement)` - Start auto-scanning
- `stopAutoScan()` - Stop auto-scanning
- `manualScan()` - Trigger manual scan
- `reset()` - Reset auto-scan state
- `updateSettings(settings)` - Update settings

This auto-scanning feature significantly improves the user experience by providing intelligent, real-time guidance and automatic document processing, making the ID scanning process more intuitive and efficient.
