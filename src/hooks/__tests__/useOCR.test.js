import { renderHook, act } from '@testing-library/react';
import { useOCR, useOCRFieldExtraction, useOCRTemplate } from '../useOCR';

// Mock the services
jest.mock('../../services', () => ({
  ocrService: {
    initialize: jest.fn(),
    processImage: jest.fn(),
    validateFields: jest.fn(),
    setProgressCallback: jest.fn(),
    getStatus: jest.fn(() => ({ isProcessing: false })),
  },
}));

// Mock Jotai atoms
jest.mock('jotai', () => ({
  useSetAtom: jest.fn(() => jest.fn()),
  useAtomValue: jest.fn(() => null),
}));

describe('useOCR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOCR Hook', () => {
    it('should initialize OCR service', async () => {
      const { ocrService } = require('../../services');
      ocrService.initialize.mockResolvedValue(true);

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        const success = await result.current.initialize();
        expect(success).toBe(true);
      });

      expect(ocrService.initialize).toHaveBeenCalled();
    });

    it('should process image with OCR', async () => {
      const { ocrService } = require('../../services');
      const mockResults = {
        text: 'John Doe\n123 Main St',
        fields: { firstName: 'John', lastName: 'Doe' },
        confidence: 0.85,
        documentType: 'drivers_license',
      };

      ocrService.initialize.mockResolvedValue(true);
      ocrService.processImage.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        await result.current.initialize();
        const results = await result.current.processImage(new Blob());
        expect(results).toEqual(mockResults);
      });

      expect(ocrService.processImage).toHaveBeenCalled();
    });

    it('should handle OCR processing errors', async () => {
      const { ocrService } = require('../../services');
      ocrService.initialize.mockResolvedValue(true);
      ocrService.processImage.mockRejectedValue(
        new Error('OCR processing failed')
      );

      const { result } = renderHook(() => useOCR());

      await act(async () => {
        await result.current.initialize();
        const results = await result.current.processImage(new Blob());
        expect(results).toBeNull();
      });
    });

    it('should cancel OCR processing', async () => {
      const { result } = renderHook(() => useOCR());

      act(() => {
        result.current.cancelProcessing();
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should update preprocessing options', () => {
      const { result } = renderHook(() => useOCR());

      act(() => {
        result.current.updatePreprocessingOptions({
          enhance: false,
          contrast: 1.5,
        });
      });

      expect(result.current.preprocessingOptions.enhance).toBe(false);
      expect(result.current.preprocessingOptions.contrast).toBe(1.5);
    });

    it('should reset OCR state', () => {
      const { result } = renderHook(() => useOCR());

      act(() => {
        result.current.reset();
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.progress).toBe(0);
    });
  });

  describe('useOCRFieldExtraction Hook', () => {
    it('should update field values', () => {
      const { result } = renderHook(() => useOCRFieldExtraction());

      act(() => {
        result.current.updateField('firstName', 'John');
      });

      expect(result.current.extractedFields.firstName).toBe('John');
    });

    it('should validate fields', () => {
      const { ocrService } = require('../../services');
      const mockValidation = {
        isValid: true,
        errors: {},
        warnings: {},
      };

      ocrService.validateFields.mockReturnValue(mockValidation);

      const { result } = renderHook(() => useOCRFieldExtraction());

      act(() => {
        result.current.updateField('firstName', 'John');
        result.current.updateField('lastName', 'Doe');
        result.current.validateAllFields('drivers_license');
      });

      expect(result.current.isValid).toBe(true);
      expect(ocrService.validateFields).toHaveBeenCalledWith(
        { firstName: 'John', lastName: 'Doe' },
        'drivers_license'
      );
    });

    it('should clear field errors', () => {
      const { result } = renderHook(() => useOCRFieldExtraction());

      act(() => {
        result.current.updateField('firstName', 'John');
        result.current.clearFieldError('firstName');
      });

      expect(result.current.fieldErrors.firstName).toBeUndefined();
    });

    it('should reset fields', () => {
      const { result } = renderHook(() => useOCRFieldExtraction());

      act(() => {
        result.current.updateField('firstName', 'John');
        result.current.resetFields();
      });

      expect(result.current.extractedFields).toEqual({});
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('useOCRTemplate Hook', () => {
    it('should load available templates', () => {
      const { result } = renderHook(() => useOCRTemplate());

      act(() => {
        result.current.loadTemplates();
      });

      expect(result.current.templates).toHaveProperty('drivers_license');
      expect(result.current.templates).toHaveProperty('passport');
      expect(result.current.templates).toHaveProperty('national_id');
    });

    it('should set current template', () => {
      const { result } = renderHook(() => useOCRTemplate());

      act(() => {
        result.current.loadTemplates();
        result.current.setTemplate('passport');
      });

      expect(result.current.currentTemplate).toBe('passport');
      expect(result.current.templateFields).toContain('firstName');
      expect(result.current.templateFields).toContain('lastName');
    });

    it('should get field configuration', () => {
      const { result } = renderHook(() => useOCRTemplate());

      act(() => {
        result.current.loadTemplates();
        result.current.setTemplate('drivers_license');
      });

      const fieldConfig = result.current.getFieldConfig('firstName');
      expect(fieldConfig.isRequired).toBe(true);
      expect(fieldConfig.fieldName).toBe('firstName');
    });

    it('should get required fields', () => {
      const { result } = renderHook(() => useOCRTemplate());

      act(() => {
        result.current.loadTemplates();
        result.current.setTemplate('drivers_license');
      });

      const requiredFields = result.current.getRequiredFields();
      expect(requiredFields).toContain('firstName');
      expect(requiredFields).toContain('lastName');
      expect(requiredFields).toContain('dateOfBirth');
    });
  });
});


