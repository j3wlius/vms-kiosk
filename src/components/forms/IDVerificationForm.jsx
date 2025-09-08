import React, { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  formDataAtom,
  formValidationAtom,
  ocrResultsAtom,
  ocrProcessingAtom,
} from '../../stores/atoms/visitorAtoms';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { cn } from '../../utils/cn';

/**
 * IDVerificationForm Component
 * OCR results verification and editing form
 */
const IDVerificationForm = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const ocrResults = useAtomValue(ocrResultsAtom);
  const ocrProcessing = useAtomValue(ocrProcessingAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);

  const { idDocument } = formData;
  const { idDocument: idValidation } = validation;

  // Update form data
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      idDocument: {
        ...prev.idDocument,
        [field]: value,
      },
    }));
  };

  // Handle field blur
  const handleBlur = field => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mark all fields as touched
      setTouched({
        type: true,
        number: true,
        issuingCountry: true,
        expiryDate: true,
      });

      // Check if form is valid
      if (idValidation.isValid) {
        onNext?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    onBack?.();
  };

  // Get field error
  const getFieldError = field => {
    return touched[field] ? idValidation.errors[field] : '';
  };

  // Document type options
  const documentTypeOptions = [
    { value: '', label: 'Select document type' },
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'other', label: 'Other' },
  ];

  // Country options (simplified list)
  const countryOptions = [
    { value: '', label: 'Select country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'other', label: 'Other' },
  ];

  // Auto-fill from OCR results
  useEffect(() => {
    if (ocrResults && ocrResults.fields && !touched.type) {
      const { fields, documentType } = ocrResults;

      if (documentType) {
        updateField('type', documentType);
      }

      if (fields.firstName && !touched.firstName) {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            firstName: fields.firstName,
          },
        }));
      }

      if (fields.lastName && !touched.lastName) {
        setFormData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            lastName: fields.lastName,
          },
        }));
      }

      if (fields.documentNumber && !touched.number) {
        updateField('number', fields.documentNumber);
      }

      if (fields.issuingCountry && !touched.issuingCountry) {
        updateField('issuingCountry', fields.issuingCountry);
      }

      if (fields.expiryDate && !touched.expiryDate) {
        updateField('expiryDate', fields.expiryDate);
      }
    }
  }, [ocrResults, touched]);

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>ID Document Verification</Card.Title>
        <Card.Description>
          Please verify and correct the information extracted from your ID
          document.
        </Card.Description>
      </Card.Header>

      {/* OCR Processing Status */}
      {ocrProcessing.isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <LoadingSpinner size="sm" color="primary" className="mr-3" />
            <span className="text-sm font-medium text-blue-800">
              Processing document...
            </span>
          </div>
        </div>
      )}

      {/* OCR Results Summary */}
      {ocrResults && ocrResults.confidence && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">OCR Results</h4>
            <button
              type="button"
              onClick={() => setShowConfidence(!showConfidence)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showConfidence ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Confidence:</span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    ocrResults.confidence > 0.8
                      ? 'bg-green-500'
                      : ocrResults.confidence > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${ocrResults.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {Math.round(ocrResults.confidence * 100)}%
              </span>
            </div>

            {ocrResults.documentType && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                {ocrResults.documentType.replace('_', ' ')}
              </div>
            )}
          </div>

          {showConfidence && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Extracted Text:
              </h5>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-auto">
                {ocrResults.extractedText}
              </pre>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={idDocument.type}
            onChange={e => updateField('type', e.target.value)}
            onBlur={() => handleBlur('type')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('type')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {documentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('type') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {getFieldError('type')}
            </p>
          )}
        </div>

        <Input
          label="Document Number"
          value={idDocument.number}
          onChange={e => updateField('number', e.target.value)}
          onBlur={() => handleBlur('number')}
          error={getFieldError('number')}
          required
          placeholder="Enter document number"
          size="lg"
          helperText="License number, passport number, or ID number"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issuing Country
          </label>
          <select
            value={idDocument.issuingCountry}
            onChange={e => updateField('issuingCountry', e.target.value)}
            onBlur={() => handleBlur('issuingCountry')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('issuingCountry')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('issuingCountry') && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {getFieldError('issuingCountry')}
            </p>
          )}
        </div>

        <Input
          label="Expiry Date"
          type="date"
          value={idDocument.expiryDate}
          onChange={e => updateField('expiryDate', e.target.value)}
          onBlur={() => handleBlur('expiryDate')}
          error={getFieldError('expiryDate')}
          placeholder="Enter expiry date"
          size="lg"
          helperText="Optional - document expiry date"
        />

        {/* OCR Error Display */}
        {ocrProcessing.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  OCR Processing Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{ocrProcessing.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Manual Verification Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please verify all information is correct. You can edit any
                  field if needed. If OCR failed, please enter the information
                  manually.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card.Footer>
          <div className="flex flex-col sm:flex-row gap-4">
            {onBack && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!idValidation.isValid}
              className="w-full sm:w-auto sm:ml-auto"
            >
              Continue
            </Button>
          </div>
        </Card.Footer>
      </form>
    </Card>
  );
};

export default IDVerificationForm;

