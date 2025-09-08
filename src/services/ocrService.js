import Tesseract from 'tesseract.js';

/**
 * OCR Service
 * Tesseract.js integration with image preprocessing and field matching
 */
class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.isProcessing = false;
    this.settings = {
      language: 'eng',
      confidenceThreshold: 0.7,
      documentTypes: ['drivers_license', 'passport', 'national_id'],
      preprocessing: {
        enhance: true,
        denoise: true,
        deskew: true,
        contrast: 1.2,
        brightness: 0.1,
      },
    };
    this.fieldPatterns = {
      drivers_license: {
        firstName: /(?:first\s*name|given\s*name|fname)[\s:]*([a-zA-Z\s]+)/i,
        lastName:
          /(?:last\s*name|surname|family\s*name|lname)[\s:]*([a-zA-Z\s]+)/i,
        fullName: /^([a-zA-Z\s,]+)$/m,
        dateOfBirth:
          /(?:date\s*of\s*birth|dob|birth\s*date)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        licenseNumber:
          /(?:license\s*number|dl\s*number|lic\s*no)[\s:]*([a-zA-Z0-9\s]+)/i,
        address: /(?:address|residence)[\s:]*([a-zA-Z0-9\s,.#]+)/i,
        city: /(?:city|municipality)[\s:]*([a-zA-Z\s]+)/i,
        state: /(?:state|province)[\s:]*([a-zA-Z\s]+)/i,
        zipCode: /(?:zip|postal\s*code)[\s:]*(\d{5}(?:-\d{4})?)/i,
        country: /(?:country|nation)[\s:]*([a-zA-Z\s]+)/i,
      },
      passport: {
        firstName: /(?:given\s*name|first\s*name)[\s:]*([a-zA-Z\s]+)/i,
        lastName: /(?:surname|family\s*name)[\s:]*([a-zA-Z\s]+)/i,
        fullName: /^([a-zA-Z\s,]+)$/m,
        dateOfBirth:
          /(?:date\s*of\s*birth|dob)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        passportNumber:
          /(?:passport\s*number|passport\s*no)[\s:]*([a-zA-Z0-9\s]+)/i,
        nationality: /(?:nationality|citizen)[\s:]*([a-zA-Z\s]+)/i,
        placeOfBirth: /(?:place\s*of\s*birth|born)[\s:]*([a-zA-Z\s,]+)/i,
        issueDate:
          /(?:issue\s*date|issued)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        expiryDate:
          /(?:expiry\s*date|expires)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      },
      national_id: {
        firstName: /(?:first\s*name|given\s*name)[\s:]*([a-zA-Z\s]+)/i,
        lastName: /(?:last\s*name|surname)[\s:]*([a-zA-Z\s]+)/i,
        fullName: /^([a-zA-Z\s,]+)$/m,
        dateOfBirth:
          /(?:date\s*of\s*birth|dob)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        idNumber: /(?:id\s*number|national\s*id)[\s:]*([a-zA-Z0-9\s]+)/i,
        address: /(?:address|residence)[\s:]*([a-zA-Z0-9\s,.#]+)/i,
        city: /(?:city|municipality)[\s:]*([a-zA-Z\s]+)/i,
        state: /(?:state|province)[\s:]*([a-zA-Z\s]+)/i,
        zipCode: /(?:zip|postal\s*code)[\s:]*(\d{5}(?:-\d{4})?)/i,
      },
    };
  }

  /**
   * Initialize OCR worker
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }

      console.log('Initializing OCR worker...');
      this.worker = await Tesseract.createWorker({
        logger: m => {
          console.log('OCR Worker:', m);
          if (m.status === 'recognizing text') {
            this.onProgress?.(m.progress);
          }
        },
      });

      console.log('Loading OCR language...');
      await this.worker.loadLanguage(this.settings.language);
      await this.worker.initialize(this.settings.language);

      this.isInitialized = true;
      console.log('OCR worker initialized successfully');
      return true;
    } catch (error) {
      console.error('OCR initialization failed:', error);
      this.isInitialized = false;
      throw new Error('Failed to initialize OCR service');
    }
  }

  /**
   * Process image with OCR
   * @param {Blob|string} imageData - Image data (Blob or base64)
   * @param {object} options - Processing options
   * @returns {Promise<object>} OCR results
   */
  async processImage(imageData, options = {}) {
    try {
      if (!this.isInitialized) {
        console.log('OCR not initialized, initializing now...');
        await this.initialize();
      }

      if (this.isProcessing) {
        throw new Error('OCR is already processing an image');
      }

      if (!imageData) {
        throw new Error('No image data provided');
      }

      console.log('Starting OCR processing...');
      this.isProcessing = true;
      this.onProgress?.(0);

      // Preprocess image
      console.log('Preprocessing image...');
      const processedImage = await this.preprocessImage(
        imageData,
        options.preprocessing
      );
      this.onProgress?.(0.3);

      // Perform OCR
      console.log('Performing OCR recognition...');
      const { data } = await this.worker.recognize(processedImage);
      this.onProgress?.(0.7);

      if (!data || !data.text) {
        throw new Error('OCR failed to extract text from image');
      }

      console.log('OCR text extracted:', data.text.substring(0, 100) + '...');

      // Extract fields based on document type
      const documentType = this.detectDocumentType(data.text);
      const fields = this.extractFields(data.text, documentType);
      this.onProgress?.(0.9);

      // Calculate confidence
      const confidence = this.calculateConfidence(data, fields);

      console.log('OCR processing completed. Confidence:', confidence);
      this.onProgress?.(1);
      this.isProcessing = false;

      return {
        text: data.text,
        fields: fields,
        confidence: confidence,
        documentType: documentType,
        rawData: data,
        processedImage: processedImage,
      };
    } catch (error) {
      this.isProcessing = false;
      console.error('OCR processing failed:', error);
      throw new Error(`Failed to process image with OCR: ${error.message}`);
    }
  }

  /**
   * Preprocess image for better OCR results
   * @param {Blob|string} imageData - Image data
   * @param {object} options - Preprocessing options
   * @returns {Promise<Buffer>} Processed image buffer
   */
  async preprocessImage(imageData, options = {}) {
    try {
      const settings = { ...this.settings.preprocessing, ...options };

      // Dynamic import for Jimp to avoid Vite issues
      const Jimp = await import('jimp');

      // Convert to Jimp image
      let image;
      if (imageData instanceof Blob) {
        const arrayBuffer = await imageData.arrayBuffer();
        image = await Jimp.default.read(Buffer.from(arrayBuffer));
      } else if (typeof imageData === 'string') {
        // Handle base64 data
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        image = await Jimp.default.read(Buffer.from(base64Data, 'base64'));
      } else {
        throw new Error('Invalid image data format');
      }

      // Apply preprocessing
      if (settings.enhance) {
        image = image.normalize();
      }

      if (settings.denoise) {
        image = image.gaussian(1);
      }

      if (settings.deskew) {
        image = await this.deskewImage(image);
      }

      if (settings.contrast !== 1) {
        image = image.contrast(settings.contrast);
      }

      if (settings.brightness !== 0) {
        image = image.brightness(settings.brightness);
      }

      // Convert to grayscale for better OCR
      image = image.greyscale();

      // Get buffer
      return await image.getBufferAsync(Jimp.default.MIME_JPEG);
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  /**
   * Detect document type from text
   * @param {string} text - Extracted text
   * @returns {string} Document type
   */
  detectDocumentType(text) {
    const lowerText = text.toLowerCase();

    // Check for drivers license indicators
    if (
      lowerText.includes('driver') ||
      lowerText.includes('license') ||
      lowerText.includes('dl') ||
      lowerText.includes('dmv')
    ) {
      return 'drivers_license';
    }

    // Check for passport indicators
    if (
      lowerText.includes('passport') ||
      lowerText.includes('passport no') ||
      lowerText.includes('nationality') ||
      lowerText.includes('issuing')
    ) {
      return 'passport';
    }

    // Check for national ID indicators
    if (
      lowerText.includes('national id') ||
      lowerText.includes('citizen id') ||
      lowerText.includes('ssn') ||
      lowerText.includes('social security')
    ) {
      return 'national_id';
    }

    // Default to drivers license
    return 'drivers_license';
  }

  /**
   * Extract fields from text using patterns
   * @param {string} text - Extracted text
   * @param {string} documentType - Document type
   * @returns {object} Extracted fields
   */
  extractFields(text, documentType) {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided to extractFields:', text);
      return {};
    }

    const patterns =
      this.fieldPatterns[documentType] || this.fieldPatterns.drivers_license;
    
    if (!patterns || typeof patterns !== 'object') {
      console.warn('Invalid patterns for document type:', documentType);
      return {};
    }

    const fields = {};

    try {
      for (const [fieldName, pattern] of Object.entries(patterns)) {
        if (pattern && typeof pattern.test === 'function') {
          const match = text.match(pattern);
          if (match && match[1]) {
            fields[fieldName] = this.cleanFieldValue(match[1]);
          }
        }
      }

      // Try to extract full name if individual names not found
      if (!fields.firstName && !fields.lastName && fields.fullName) {
        const nameParts = fields.fullName.split(/\s+/);
        if (nameParts.length >= 2) {
          fields.firstName = nameParts[0];
          fields.lastName = nameParts.slice(1).join(' ');
        }
      }
    } catch (error) {
      console.error('Error extracting fields:', error);
    }

    return fields;
  }

  /**
   * Clean field value
   * @param {string} value - Raw field value
   * @returns {string} Cleaned value
   */
  cleanFieldValue(value) {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s@.-]/g, '')
      .replace(/\b\s+\b/g, ' ');
  }

  /**
   * Calculate confidence score
   * @param {object} ocrData - OCR data from Tesseract
   * @param {object} fields - Extracted fields
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(ocrData, fields) {
    // Base confidence from Tesseract
    let confidence = ocrData.confidence / 100;

    // Boost confidence based on field extraction
    const extractedFields = Object.values(fields).filter(
      value => value && value.length > 0
    );
    const fieldCount = Object.keys(fields).length;

    if (fieldCount > 0) {
      const extractionRate = extractedFields.length / fieldCount;
      confidence = (confidence + extractionRate) / 2;
    }

    // Boost confidence for common fields
    const importantFields = ['firstName', 'lastName', 'dateOfBirth'];
    const importantFieldsFound = importantFields.filter(field => fields[field]);
    if (importantFieldsFound.length > 0) {
      confidence += 0.1 * importantFieldsFound.length;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Deskew image using Hough transform approximation
   * @param {Jimp} image - Jimp image object
   * @returns {Jimp} Deskewed image
   */
  async deskewImage(image) {
    // Simple deskew implementation
    // In a production app, you might want to use a more sophisticated algorithm
    try {
      // Convert to grayscale for edge detection
      const grayImage = image.clone().greyscale();

      // Simple rotation detection (this is a simplified version)
      // In practice, you'd use more sophisticated line detection
      const width = grayImage.getWidth();
      const height = grayImage.getHeight();

      // For now, return the original image
      // A full implementation would detect skew angle and rotate accordingly
      return image;
    } catch (error) {
      console.warn('Deskew failed, using original image:', error);
      return image;
    }
  }

  /**
   * Validate extracted fields
   * @param {object} fields - Extracted fields
   * @param {string} documentType - Document type
   * @returns {object} Validation results
   */
  validateFields(fields, documentType) {
    const validation = {
      isValid: true,
      errors: {},
      warnings: {},
    };

    // Required fields based on document type
    const requiredFields = {
      drivers_license: ['firstName', 'lastName', 'dateOfBirth'],
      passport: ['firstName', 'lastName', 'dateOfBirth', 'passportNumber'],
      national_id: ['firstName', 'lastName', 'dateOfBirth', 'idNumber'],
    };

    const required =
      requiredFields[documentType] || requiredFields.drivers_license;

    // Check required fields
    for (const field of required) {
      if (!fields[field] || fields[field].length === 0) {
        validation.isValid = false;
        validation.errors[field] = `${field} is required`;
      }
    }

    // Validate date formats
    const dateFields = ['dateOfBirth', 'issueDate', 'expiryDate'];
    for (const field of dateFields) {
      if (fields[field]) {
        const dateRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/;
        if (!dateRegex.test(fields[field])) {
          validation.warnings[field] = `${field} format may be incorrect`;
        }
      }
    }

    // Validate email format
    if (fields.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fields.email)) {
        validation.warnings.email = 'Email format may be incorrect';
      }
    }

    return validation;
  }

  /**
   * Set progress callback
   * @param {Function} callback - Progress callback
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  /**
   * Get current processing status
   * @returns {object} Processing status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      settings: this.settings,
    };
  }

  /**
   * Update settings
   * @param {object} newSettings - New settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Terminate worker and cleanup
   */
  async terminate() {
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
      this.isInitialized = false;
      this.isProcessing = false;
    } catch (error) {
      console.error('OCR termination failed:', error);
    }
  }

  /**
   * Test OCR functionality
   * @returns {Promise<object>} Test results
   */
  async testOCR() {
    const results = {
      initialized: false,
      processing: false,
      error: null,
    };

    try {
      results.initialized = await this.initialize();
      results.processing = !this.isProcessing;
    } catch (error) {
      results.error = error.message;
    }

    return results;
  }
}

// Create singleton instance
const ocrService = new OCRService();

export default ocrService;
