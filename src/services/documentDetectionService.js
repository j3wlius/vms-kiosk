/**
 * Document Detection Service
 * Analyzes video frames to detect document presence, positioning, and quality
 */
class DocumentDetectionService {
  constructor() {
    this.isInitialized = false;
    this.analysisInterval = null;
    this.currentAnalysis = null;
    this.callbacks = {
      onDocumentDetected: null,
      onDocumentPositioned: null,
      onDocumentQualityChanged: null,
      onAnalysisComplete: null,
    };
    
    // Detection settings
    this.settings = {
      analysisInterval: 100, // ms between frame analysis
      minDocumentSize: 0.3, // minimum document size as fraction of frame
      maxDocumentSize: 0.9, // maximum document size as fraction of frame
      minContrast: 0.3, // minimum contrast for document detection
      minSharpness: 0.5, // minimum sharpness threshold
      positionTolerance: 0.1, // tolerance for centered positioning
      qualityThreshold: 0.7, // minimum quality for auto-scan
    };
    
    // Analysis state
    this.lastAnalysis = {
      hasDocument: false,
      isPositioned: false,
      quality: 0,
      position: { x: 0, y: 0, width: 0, height: 0 },
      sharpness: 0,
      contrast: 0,
      brightness: 0,
      timestamp: 0,
    };
  }

  /**
   * Initialize the document detection service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      this.isInitialized = true;
      console.log('Document detection service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize document detection service:', error);
      return false;
    }
  }

  /**
   * Start continuous document analysis
   * @param {HTMLVideoElement} videoElement - Video element to analyze
   * @param {object} options - Analysis options
   */
  startAnalysis(videoElement, options = {}) {
    if (!this.isInitialized) {
      console.error('Document detection service not initialized');
      return false;
    }

    if (this.analysisInterval) {
      this.stopAnalysis();
    }

    const settings = { ...this.settings, ...options };
    const interval = settings.analysisInterval;

    this.analysisInterval = setInterval(() => {
      this.analyzeFrame(videoElement, settings);
    }, interval);

    console.log('Document analysis started');
    return true;
  }

  /**
   * Stop document analysis
   */
  stopAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
      console.log('Document analysis stopped');
    }
  }

  /**
   * Analyze a single video frame for document detection
   * @param {HTMLVideoElement} videoElement - Video element
   * @param {object} settings - Analysis settings
   */
  analyzeFrame(videoElement, settings) {
    try {
      if (!videoElement || videoElement.readyState < 2) {
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas size to video size
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current frame
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Perform analysis
      const analysis = this.performDocumentAnalysis(imageData, settings);
      
      // Update state
      this.lastAnalysis = {
        ...analysis,
        timestamp: Date.now(),
      };
      
      // Notify callbacks
      this.notifyAnalysisComplete(analysis);
      
      if (analysis.hasDocument && !this.currentAnalysis?.hasDocument) {
        this.notifyDocumentDetected(analysis);
      }
      
      if (analysis.isPositioned && analysis.quality >= settings.qualityThreshold) {
        this.notifyDocumentPositioned(analysis);
      }
      
      if (this.currentAnalysis?.quality !== analysis.quality) {
        this.notifyDocumentQualityChanged(analysis);
      }
      
      this.currentAnalysis = analysis;
      
    } catch (error) {
      console.error('Frame analysis failed:', error);
    }
  }

  /**
   * Perform document analysis on image data
   * @param {ImageData} imageData - Image data to analyze
   * @param {object} settings - Analysis settings
   * @returns {object} Analysis results
   */
  performDocumentAnalysis(imageData, settings) {
    const { width, height, data } = imageData;
    
    // Convert to grayscale and calculate basic metrics
    const grayscale = this.convertToGrayscale(data);
    const contrast = this.calculateContrast(grayscale);
    const brightness = this.calculateBrightness(grayscale);
    const sharpness = this.calculateSharpness(grayscale, width, height);
    
    // Detect document boundaries (simplified edge detection)
    const documentBounds = this.detectDocumentBounds(grayscale, width, height);
    
    // Calculate document metrics
    const hasDocument = documentBounds && this.isValidDocumentSize(documentBounds, width, height, settings);
    const isPositioned = hasDocument && this.isDocumentCentered(documentBounds, width, height, settings);
    const quality = this.calculateDocumentQuality(contrast, sharpness, brightness, settings);
    
    return {
      hasDocument,
      isPositioned,
      quality,
      position: documentBounds || { x: 0, y: 0, width: 0, height: 0 },
      sharpness,
      contrast,
      brightness,
    };
  }

  /**
   * Convert RGBA image data to grayscale
   * @param {Uint8ClampedArray} data - RGBA image data
   * @returns {Uint8ClampedArray} Grayscale data
   */
  convertToGrayscale(data) {
    const grayscale = new Uint8ClampedArray(data.length / 4);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Use luminance formula
      grayscale[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    return grayscale;
  }

  /**
   * Calculate image contrast
   * @param {Uint8ClampedArray} grayscale - Grayscale image data
   * @returns {number} Contrast value (0-1)
   */
  calculateContrast(grayscale) {
    let sum = 0;
    let sumSquares = 0;
    const length = grayscale.length;
    
    for (let i = 0; i < length; i++) {
      sum += grayscale[i];
      sumSquares += grayscale[i] * grayscale[i];
    }
    
    const mean = sum / length;
    const variance = (sumSquares / length) - (mean * mean);
    const stdDev = Math.sqrt(variance);
    
    // Normalize to 0-1 range
    return Math.min(stdDev / 128, 1);
  }

  /**
   * Calculate image brightness
   * @param {Uint8ClampedArray} grayscale - Grayscale image data
   * @returns {number} Brightness value (0-1)
   */
  calculateBrightness(grayscale) {
    let sum = 0;
    const length = grayscale.length;
    
    for (let i = 0; i < length; i++) {
      sum += grayscale[i];
    }
    
    return sum / (length * 255);
  }

  /**
   * Calculate image sharpness using Laplacian variance
   * @param {Uint8ClampedArray} grayscale - Grayscale image data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {number} Sharpness value (0-1)
   */
  calculateSharpness(grayscale, width, height) {
    let sum = 0;
    let count = 0;
    
    // Apply Laplacian kernel for edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Laplacian kernel: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]]
        const laplacian = 
          grayscale[idx] * 4 -
          grayscale[(y - 1) * width + x] -
          grayscale[(y + 1) * width + x] -
          grayscale[y * width + (x - 1)] -
          grayscale[y * width + (x + 1)];
        
        sum += laplacian * laplacian;
        count++;
      }
    }
    
    const variance = sum / count;
    // Normalize to 0-1 range (empirically determined)
    return Math.min(variance / 10000, 1);
  }

  /**
   * Detect document boundaries using edge detection
   * @param {Uint8ClampedArray} grayscale - Grayscale image data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object|null} Document bounds or null
   */
  detectDocumentBounds(grayscale, width, height) {
    // Simplified document detection using edge detection
    // In a production app, you'd use more sophisticated algorithms like Hough transforms
    
    const edges = this.detectEdges(grayscale, width, height);
    const contours = this.findContours(edges, width, height);
    
    // Find the largest rectangular contour
    let bestContour = null;
    let maxArea = 0;
    
    for (const contour of contours) {
      const area = this.calculateContourArea(contour);
      if (area > maxArea && this.isRectangularContour(contour)) {
        maxArea = area;
        bestContour = contour;
      }
    }
    
    if (bestContour) {
      return this.getBoundingBox(bestContour);
    }
    
    return null;
  }

  /**
   * Detect edges using Sobel operator
   * @param {Uint8ClampedArray} grayscale - Grayscale image data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Edge data
   */
  detectEdges(grayscale, width, height) {
    const edges = new Uint8ClampedArray(grayscale.length);
    
    // Sobel X kernel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    // Sobel Y kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel X
        const sobelX = 
          -grayscale[(y - 1) * width + (x - 1)] +
          grayscale[(y - 1) * width + (x + 1)] +
          -2 * grayscale[y * width + (x - 1)] +
          2 * grayscale[y * width + (x + 1)] +
          -grayscale[(y + 1) * width + (x - 1)] +
          grayscale[(y + 1) * width + (x + 1)];
        
        // Sobel Y
        const sobelY = 
          -grayscale[(y - 1) * width + (x - 1)] +
          -2 * grayscale[(y - 1) * width + x] +
          -grayscale[(y - 1) * width + (x + 1)] +
          grayscale[(y + 1) * width + (x - 1)] +
          2 * grayscale[(y + 1) * width + x] +
          grayscale[(y + 1) * width + (x + 1)];
        
        const magnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
        edges[idx] = Math.min(magnitude, 255);
      }
    }
    
    return edges;
  }

  /**
   * Find contours in edge data
   * @param {Uint8ClampedArray} edges - Edge data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Array} Array of contours
   */
  findContours(edges, width, height) {
    // Simplified contour finding
    // In production, use proper contour detection algorithms
    const threshold = 50;
    const contours = [];
    
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const idx = y * width + x;
        if (edges[idx] > threshold) {
          // Simple rectangular contour approximation
          contours.push([
            { x: x - 50, y: y - 30 },
            { x: x + 50, y: y - 30 },
            { x: x + 50, y: y + 30 },
            { x: x - 50, y: y + 30 },
          ]);
        }
      }
    }
    
    return contours;
  }

  /**
   * Calculate contour area
   * @param {Array} contour - Contour points
   * @returns {number} Area
   */
  calculateContourArea(contour) {
    if (contour.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < contour.length; i++) {
      const j = (i + 1) % contour.length;
      area += contour[i].x * contour[j].y;
      area -= contour[j].x * contour[i].y;
    }
    return Math.abs(area) / 2;
  }

  /**
   * Check if contour is roughly rectangular
   * @param {Array} contour - Contour points
   * @returns {boolean} Is rectangular
   */
  isRectangularContour(contour) {
    return contour.length === 4;
  }

  /**
   * Get bounding box from contour
   * @param {Array} contour - Contour points
   * @returns {object} Bounding box
   */
  getBoundingBox(contour) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of contour) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Check if document size is valid
   * @param {object} bounds - Document bounds
   * @param {number} frameWidth - Frame width
   * @param {number} frameHeight - Frame height
   * @param {object} settings - Settings
   * @returns {boolean} Is valid size
   */
  isValidDocumentSize(bounds, frameWidth, frameHeight, settings) {
    const widthRatio = bounds.width / frameWidth;
    const heightRatio = bounds.height / frameHeight;
    
    return widthRatio >= settings.minDocumentSize && 
           widthRatio <= settings.maxDocumentSize &&
           heightRatio >= settings.minDocumentSize && 
           heightRatio <= settings.maxDocumentSize;
  }

  /**
   * Check if document is centered
   * @param {object} bounds - Document bounds
   * @param {number} frameWidth - Frame width
   * @param {number} frameHeight - Frame height
   * @param {object} settings - Settings
   * @returns {boolean} Is centered
   */
  isDocumentCentered(bounds, frameWidth, frameHeight, settings) {
    const centerX = frameWidth / 2;
    const centerY = frameHeight / 2;
    const docCenterX = bounds.x + bounds.width / 2;
    const docCenterY = bounds.y + bounds.height / 2;
    
    const xOffset = Math.abs(docCenterX - centerX) / frameWidth;
    const yOffset = Math.abs(docCenterY - centerY) / frameHeight;
    
    return xOffset <= settings.positionTolerance && yOffset <= settings.positionTolerance;
  }

  /**
   * Calculate overall document quality
   * @param {number} contrast - Contrast value
   * @param {number} sharpness - Sharpness value
   * @param {number} brightness - Brightness value
   * @param {object} settings - Settings
   * @returns {number} Quality score (0-1)
   */
  calculateDocumentQuality(contrast, sharpness, brightness, settings) {
    // Weighted quality calculation
    const contrastScore = Math.min(contrast / settings.minContrast, 1);
    const sharpnessScore = Math.min(sharpness / settings.minSharpness, 1);
    
    // Optimal brightness is around 0.5 (middle gray)
    const brightnessScore = 1 - Math.abs(brightness - 0.5) * 2;
    
    // Weighted average
    return (contrastScore * 0.4 + sharpnessScore * 0.4 + brightnessScore * 0.2);
  }

  /**
   * Set callback for document detected
   * @param {Function} callback - Callback function
   */
  onDocumentDetected(callback) {
    this.callbacks.onDocumentDetected = callback;
  }

  /**
   * Set callback for document positioned
   * @param {Function} callback - Callback function
   */
  onDocumentPositioned(callback) {
    this.callbacks.onDocumentPositioned = callback;
  }

  /**
   * Set callback for document quality changed
   * @param {Function} callback - Callback function
   */
  onDocumentQualityChanged(callback) {
    this.callbacks.onDocumentQualityChanged = callback;
  }

  /**
   * Set callback for analysis complete
   * @param {Function} callback - Callback function
   */
  onAnalysisComplete(callback) {
    this.callbacks.onAnalysisComplete = callback;
  }

  /**
   * Notify document detected
   * @param {object} analysis - Analysis results
   */
  notifyDocumentDetected(analysis) {
    if (this.callbacks.onDocumentDetected) {
      this.callbacks.onDocumentDetected(analysis);
    }
  }

  /**
   * Notify document positioned
   * @param {object} analysis - Analysis results
   */
  notifyDocumentPositioned(analysis) {
    if (this.callbacks.onDocumentPositioned) {
      this.callbacks.onDocumentPositioned(analysis);
    }
  }

  /**
   * Notify document quality changed
   * @param {object} analysis - Analysis results
   */
  notifyDocumentQualityChanged(analysis) {
    if (this.callbacks.onDocumentQualityChanged) {
      this.callbacks.onDocumentQualityChanged(analysis);
    }
  }

  /**
   * Notify analysis complete
   * @param {object} analysis - Analysis results
   */
  notifyAnalysisComplete(analysis) {
    if (this.callbacks.onAnalysisComplete) {
      this.callbacks.onAnalysisComplete(analysis);
    }
  }

  /**
   * Get current analysis results
   * @returns {object} Current analysis
   */
  getCurrentAnalysis() {
    return this.lastAnalysis;
  }

  /**
   * Update detection settings
   * @param {object} newSettings - New settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAnalysis();
    this.isInitialized = false;
    this.callbacks = {
      onDocumentDetected: null,
      onDocumentPositioned: null,
      onDocumentQualityChanged: null,
      onAnalysisComplete: null,
    };
  }
}

// Create singleton instance
const documentDetectionService = new DocumentDetectionService();

export default documentDetectionService;
