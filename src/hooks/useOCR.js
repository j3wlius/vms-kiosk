import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { ocrService } from '../services';
import {
  ocrProcessingAtom,
  ocrResultsAtom,
  ocrErrorAtom,
  ocrConfidenceAtom,
  documentTypeAtom,
  extractedFieldsAtom,
} from '../stores/atoms/visitorAtoms';

/**
 * useOCR Hook
 * Manages OCR processing, field extraction, and document type detection
 */
export const useOCR = () => {
  // State atoms
  const setProcessing = useSetAtom(ocrProcessingAtom);
  const setResults = useSetAtom(ocrResultsAtom);
  const setError = useSetAtom(ocrErrorAtom);
  const setConfidence = useSetAtom(ocrConfidenceAtom);
  const setDocumentType = useSetAtom(documentTypeAtom);
  const setExtractedFields = useSetAtom(extractedFieldsAtom);
  
  // Atom values
  const results = useAtomValue(ocrResultsAtom);
  const error = useAtomValue(ocrErrorAtom);
  const confidence = useAtomValue(ocrConfidenceAtom);
  const documentType = useAtomValue(documentTypeAtom);
  const extractedFields = useAtomValue(extractedFieldsAtom);

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState(null);
  const [preprocessingOptions, setPreprocessingOptions] = useState({
    enhance: true,
    denoise: true,
    deskew: true,
    contrast: 1.2,
    brightness: 0.1,
  });

  // Refs
  const abortControllerRef = useRef(null);
  const progressCallbackRef = useRef(null);

  /**
   * Initialize OCR service
   */
  const initialize = useCallback(async () => {
    try {
      setProcessing(true);
      setProcessing(prev => ({ ...prev, error: null }));

      const success = await ocrService.initialize();
      if (success) {
        setIsInitialized(true);

        // Set up progress callback
        progressCallbackRef.current = progress => {
          setProgress(progress);
        };
        ocrService.setProgressCallback(progressCallbackRef.current);

        return true;
      } else {
        throw new Error('Failed to initialize OCR service');
      }
    } catch (error) {
      setProcessing(prev => ({ ...prev, error: error.message }));
      return false;
    } finally {
      setProcessing(false);
    }
  }, [setProcessing]);

  /**
   * Process image with OCR
   * @param {Blob|string} imageData - Image data to process
   * @param {object} options - Processing options
   */
  const processImage = useCallback(
    async (imageData, options = {}) => {
      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          return null;
        }
      }

      try {
        setProcessing(true);
        setProcessing(prev => ({ ...prev, error: null }));
        setProgress(0);
        setCurrentImage(imageData);

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Merge preprocessing options
        const mergedOptions = {
          preprocessing: { ...preprocessingOptions, ...options.preprocessing },
        };

        // Process image
        const results = await ocrService.processImage(imageData, mergedOptions);

        // Update atoms with results
        setResults(results);
        setConfidence(results.confidence);
        setDocumentType(results.documentType);
        setExtractedFields(results.fields);
        setProcessing(prev => ({
          ...prev,
          confidence: results.confidence,
          results: {
            ...prev.results,
            documentType: results.documentType,
            fields: results.fields,
          },
        }));

        return results;
      } catch (error) {
        const errorMessage = error.name === 'AbortError' ? 'OCR processing was cancelled' : error.message;
        setError(errorMessage);
        setProcessing(prev => ({ ...prev, error: errorMessage }));
        return null;
      } finally {
        setProcessing(false);
        setProgress(0);
        abortControllerRef.current = null;
      }
    },
    [
      isInitialized,
      initialize,
      setProcessing,
      setResults,
      setError,
      setConfidence,
      setDocumentType,
      setExtractedFields,
      preprocessingOptions,
    ]
  );

  /**
   * Cancel current OCR processing
   */
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProcessing(false);
    setProgress(0);
  }, [setProcessing]);

  /**
   * Validate extracted fields
   * @param {object} fields - Fields to validate
   * @param {string} documentType - Document type
   */
  const validateFields = useCallback((fields, documentType) => {
    return ocrService.validateFields(fields, documentType);
  }, []);

  /**
   * Update preprocessing options
   * @param {object} options - New preprocessing options
   */
  const updatePreprocessingOptions = useCallback(options => {
    setPreprocessingOptions(prev => ({ ...prev, ...options }));
  }, []);

  /**
   * Reset OCR state
   */
  const reset = useCallback(() => {
    setProcessing(false);
    setResults(null);
    setProcessing(prev => ({
      ...prev,
      error: null,
      confidence: 0,
      results: null,
    }));
    setProgress(0);
    setCurrentImage(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [
    setProcessing,
    setResults,
  ]);

  /**
   * Test OCR functionality
   */
  const testOCR = useCallback(async () => {
    try {
      const results = await ocrService.testOCR();
      return results;
    } catch (error) {
      setProcessing(prev => ({ ...prev, error: error.message }));
      return null;
    }
  }, [setProcessing]);

  /**
   * Get OCR status
   */
  const getStatus = useCallback(() => {
    return {
      isInitialized,
      isProcessing: ocrService.getStatus().isProcessing,
      progress,
      currentImage: currentImage ? 'Image loaded' : 'No image',
      preprocessingOptions,
    };
  }, [isInitialized, progress, currentImage, preprocessingOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isInitialized,
    isProcessing: ocrService.getStatus().isProcessing,
    progress,
    currentImage,
    preprocessingOptions,

    // Actions
    initialize,
    processImage,
    cancelProcessing,
    validateFields,
    updatePreprocessingOptions,
    reset,
    testOCR,
    getStatus,
  };
};

/**
 * useOCRFieldExtraction Hook
 * Specialized hook for field extraction and validation
 */
export const useOCRFieldExtraction = () => {
  // Use atom value instead of local state
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldWarnings, setFieldWarnings] = useState({});
  const [isValid, setIsValid] = useState(false);

  /**
   * Update field value
   * @param {string} fieldName - Field name
   * @param {string} value - Field value
   */
  const updateField = useCallback((fieldName, value) => {
    // Field extraction is handled by the main OCR processing
    // This is just for local validation

    // Clear errors for this field
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Validate all fields
   * @param {string} documentType - Document type
   */
  const validateAllFields = useCallback(
    documentType => {
      const validation = ocrService.validateFields(
        extractedFields,
        documentType
      );

      setFieldErrors(validation.errors);
      setFieldWarnings(validation.warnings);
      setIsValid(validation.isValid);

      return validation;
    },
    [extractedFields]
  );

  /**
   * Clear field errors
   * @param {string} fieldName - Field name to clear errors for
   */
  const clearFieldError = useCallback(fieldName => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Reset all fields
   */
  const resetFields = useCallback(() => {
    // Field extraction is handled by the main OCR processing
    setFieldErrors({});
    setFieldWarnings({});
    setIsValid(false);
  }, []);

  /**
   * Get field validation status
   * @param {string} fieldName - Field name
   */
  const getFieldStatus = useCallback(
    fieldName => {
      return {
        hasError: !!fieldErrors[fieldName],
        hasWarning: !!fieldWarnings[fieldName],
        error: fieldErrors[fieldName],
        warning: fieldWarnings[fieldName],
      };
    },
    [fieldErrors, fieldWarnings]
  );

  return {
    // State
    extractedFields,
    fieldErrors,
    fieldWarnings,
    isValid,

    // Actions
    updateField,
    validateAllFields,
    clearFieldError,
    resetFields,
    getFieldStatus,
  };
};

/**
 * useOCRTemplate Hook
 * Manages OCR templates and document type detection
 */
export const useOCRTemplate = () => {
  const [templates, setTemplates] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);

  /**
   * Load available templates
   */
  const loadTemplates = useCallback(() => {
    const availableTemplates = {
      drivers_license: {
        name: "Driver's License",
        fields: [
          'firstName',
          'lastName',
          'dateOfBirth',
          'licenseNumber',
          'address',
          'city',
          'state',
          'zipCode',
        ],
        required: ['firstName', 'lastName', 'dateOfBirth'],
      },
      passport: {
        name: 'Passport',
        fields: [
          'firstName',
          'lastName',
          'dateOfBirth',
          'passportNumber',
          'nationality',
          'placeOfBirth',
        ],
        required: ['firstName', 'lastName', 'dateOfBirth', 'passportNumber'],
      },
      national_id: {
        name: 'National ID',
        fields: [
          'firstName',
          'lastName',
          'dateOfBirth',
          'idNumber',
          'address',
          'city',
          'state',
        ],
        required: ['firstName', 'lastName', 'dateOfBirth', 'idNumber'],
      },
    };

    setTemplates(availableTemplates);
    return availableTemplates;
  }, []);

  /**
   * Set current template
   * @param {string} templateType - Template type
   */
  const setTemplate = useCallback(
    templateType => {
      if (templates[templateType]) {
        setCurrentTemplate(templateType);
        setTemplateFields(templates[templateType].fields);
      }
    },
    [templates]
  );

  /**
   * Get template field configuration
   * @param {string} fieldName - Field name
   */
  const getFieldConfig = useCallback(
    fieldName => {
      if (!currentTemplate || !templates[currentTemplate]) {
        return null;
      }

      const template = templates[currentTemplate];
      return {
        isRequired: template.required.includes(fieldName),
        fieldName,
        template: currentTemplate,
      };
    },
    [currentTemplate, templates]
  );

  /**
   * Get all required fields
   */
  const getRequiredFields = useCallback(() => {
    if (!currentTemplate || !templates[currentTemplate]) {
      return [];
    }
    return templates[currentTemplate].required;
  }, [currentTemplate, templates]);

  return {
    // State
    templates,
    currentTemplate,
    templateFields,

    // Actions
    loadTemplates,
    setTemplate,
    getFieldConfig,
    getRequiredFields,
  };
};

export default useOCR;
