import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  formDataAtom,
  formValidationAtom,
  currentFormStepAtom,
  formStepsAtom,
  ocrResultsAtom,
} from '../../stores/atoms/visitorAtoms';

const VerificationScreen = () => {
  const navigate = useNavigate();
  
  // State atoms
  const formData = useAtomValue(formDataAtom);
  const formValidation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);
  const setCurrentFormStep = useSetAtom(currentFormStepAtom);
  const setFormSteps = useSetAtom(formStepsAtom);
  const ocrResults = useAtomValue(ocrResultsAtom);

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [showOcrResults, setShowOcrResults] = useState(false);

  // Initialize edited data from form data
  useEffect(() => {
    setEditedData({
      personalInfo: { ...formData.personalInfo },
      idDocument: { ...formData.idDocument },
    });
  }, [formData]);

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...editedData.personalInfo },
      idDocument: { ...editedData.idDocument },
    }));
    setIsEditing(false);
  };

  // Handle continue
  const handleContinue = () => {
    // Update form steps
    setFormSteps(prev => prev.map((step, index) => 
      index === 2 ? { ...step, completed: true } : step
    ));
    
    // Navigate to contact info screen
    navigate('/contact-info');
  };

  // Handle back
  const handleBack = () => {
    navigate('/checkin');
  };

  // Handle retry OCR
  const handleRetryOCR = () => {
    navigate('/checkin');
  };

  // Check if form is valid
  const isFormValid = formValidation.personalInfo.isValid && formValidation.idDocument.isValid;

  return (
    <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-center kiosk-text">
          Verify Information
        </h1>

        {/* OCR Results Summary */}
        {ocrResults.confidence > 0 && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Document Scanned Successfully
                </h3>
                <p className="text-blue-700">
                  Confidence: {Math.round(ocrResults.confidence * 100)}% • 
                  Type: {ocrResults.documentType?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOcrResults(!showOcrResults)}
              >
                {showOcrResults ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </Card>
        )}

        {/* OCR Results Details */}
        {showOcrResults && ocrResults.extractedText && (
          <Card className="mb-6 p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">Extracted Text:</h4>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
              {ocrResults.extractedText}
            </div>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  value={isEditing ? editedData.personalInfo?.firstName : formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  disabled={!isEditing}
                  error={formValidation.personalInfo.errors.firstName}
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Last Name"
                  value={isEditing ? editedData.personalInfo?.lastName : formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  disabled={!isEditing}
                  error={formValidation.personalInfo.errors.lastName}
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={isEditing ? editedData.personalInfo?.email : formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  disabled={!isEditing}
                  error={formValidation.personalInfo.errors.email}
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Phone"
                  type="tel"
                  value={isEditing ? editedData.personalInfo?.phone : formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  disabled={!isEditing}
                  className="kiosk-input"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* ID Document Information */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">ID Document</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryOCR}
              >
                Rescan Document
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Document Type"
                  value={formData.idDocument.type?.replace('_', ' ').toUpperCase() || ''}
                  disabled
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Document Number"
                  value={formData.idDocument.number || ''}
                  disabled
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Issuing Country"
                  value={formData.idDocument.issuingCountry || ''}
                  disabled
                  className="kiosk-input"
                />
              </div>
              <div>
                <Input
                  label="Expiry Date"
                  value={formData.idDocument.expiryDate || ''}
                  disabled
                  className="kiosk-input"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 kiosk-button"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            className="flex-1 kiosk-button"
          >
            Continue
          </Button>
        </div>

        {/* Validation Errors */}
        {!isFormValid && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(formValidation.personalInfo.errors).map(([field, error]) => 
                error && <li key={field}>• {error}</li>
              )}
              {Object.entries(formValidation.idDocument.errors).map(([field, error]) => 
                error && <li key={field}>• {error}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationScreen;
