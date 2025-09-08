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
    <div className="kiosk-container min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      {/* Institutional Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800 kiosk-text">
                  Visitor Management System
                </h1>
                <p className="text-sm text-slate-600 kiosk-text">
                  Information Verification
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 kiosk-text">
                <div className="font-medium">Manual Registration</div>
                <div className="text-xs">Verify your details</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 mb-4 kiosk-text">
              Verify Information
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-2 kiosk-text">
              Please review and confirm your details
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
          </div>

          {/* OCR Results Summary */}
          {ocrResults.confidence > 0 && (
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 kiosk-text">
                      Document Scanned Successfully
                    </h3>
                    <p className="text-slate-600 kiosk-text">
                      Confidence: {Math.round(ocrResults.confidence * 100)}% • 
                      Type: {ocrResults.documentType?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOcrResults(!showOcrResults)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {showOcrResults ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
          )}

          {/* OCR Results Details */}
          {showOcrResults && ocrResults.extractedText && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              <h4 className="font-semibold text-slate-800 mb-3 kiosk-text">Extracted Text:</h4>
              <div className="text-sm text-slate-600 max-h-32 overflow-y-auto bg-slate-50 p-3 rounded-lg kiosk-text">
                {ocrResults.extractedText}
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 kiosk-text">Personal Information</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
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
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          {/* ID Document Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 kiosk-text">ID Document</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryOCR}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
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

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 kiosk-button border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isFormValid}
              className="flex-1 kiosk-button bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 kiosk-text">
                  Information Security
                </h4>
                <p className="text-sm text-slate-600 kiosk-text leading-relaxed">
                  Your personal information is encrypted and stored securely. All data is used only for security and access control purposes in compliance with institutional policies.
                  <br />
                  <span className="font-medium">For assistance, please contact the reception desk.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-slate-500 kiosk-text">
            <div>
              © {new Date().getFullYear()} ServeDigital. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Secure Verification</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerificationScreen;
