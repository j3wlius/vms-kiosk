import React, { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  formDataAtom,
  formValidationAtom,
} from '../../stores/atoms/visitorAtoms';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

/**
 * VisitDetailsForm Component
 * Visit purpose and host information collection form
 */
const VisitDetailsForm = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { visitDetails } = formData;
  const { visitDetails: visitValidation } = validation;

  // Update form data
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      visitDetails: {
        ...prev.visitDetails,
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
        hostName: true,
        hostEmail: true,
        visitPurpose: true,
        expectedDuration: true,
        visitDate: true,
        visitTime: true,
      });

      // Check if form is valid
      if (visitValidation.isValid) {
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
    return touched[field] ? visitValidation.errors[field] : '';
  };

  // Visit purpose options
  const visitPurposeOptions = [
    { value: '', label: 'Select visit purpose' },
    { value: 'meeting', label: 'Business Meeting' },
    { value: 'interview', label: 'Job Interview' },
    { value: 'delivery', label: 'Delivery/Pickup' },
    { value: 'maintenance', label: 'Maintenance/Service' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'training', label: 'Training' },
    { value: 'event', label: 'Event/Conference' },
    { value: 'other', label: 'Other' },
  ];

  // Expected duration options
  const durationOptions = [
    { value: '', label: 'Select expected duration' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours (full day)' },
    { value: 'custom', label: 'Other' },
  ];

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>Visit Details</Card.Title>
        <Card.Description>
          Please provide information about your visit and the person you're
          meeting.
        </Card.Description>
      </Card.Header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Host Name"
            value={visitDetails.hostName}
            onChange={e => updateField('hostName', e.target.value)}
            onBlur={() => handleBlur('hostName')}
            error={getFieldError('hostName')}
            required
            placeholder="Enter host name"
            size="lg"
          />

          <Input
            label="Host Email"
            type="email"
            value={visitDetails.hostEmail}
            onChange={e => updateField('hostEmail', e.target.value)}
            onBlur={() => handleBlur('hostEmail')}
            error={getFieldError('hostEmail')}
            required
            placeholder="Enter host email"
            size="lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Purpose <span className="text-red-500">*</span>
          </label>
          <select
            value={visitDetails.visitPurpose}
            onChange={e => updateField('visitPurpose', e.target.value)}
            onBlur={() => handleBlur('visitPurpose')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('visitPurpose')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {visitPurposeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('visitPurpose') && (
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
              {getFieldError('visitPurpose')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Duration <span className="text-red-500">*</span>
          </label>
          <select
            value={visitDetails.expectedDuration}
            onChange={e => updateField('expectedDuration', e.target.value)}
            onBlur={() => handleBlur('expectedDuration')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('expectedDuration')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('expectedDuration') && (
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
              {getFieldError('expectedDuration')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Visit Date"
            type="date"
            value={visitDetails.visitDate}
            onChange={e => updateField('visitDate', e.target.value)}
            onBlur={() => handleBlur('visitDate')}
            error={getFieldError('visitDate')}
            required
            size="lg"
          />

          <Input
            label="Visit Time"
            type="time"
            value={visitDetails.visitTime}
            onChange={e => updateField('visitTime', e.target.value)}
            onBlur={() => handleBlur('visitTime')}
            error={getFieldError('visitTime')}
            required
            size="lg"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Host Notification
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your host will be automatically notified about your arrival.
                  Please ensure the host email is correct.
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
              disabled={!visitValidation.isValid}
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

/**
 * VisitDetailsFormStep Component
 * Simplified version for step-by-step forms
 */
const VisitDetailsFormStep = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [currentStep, setCurrentStep] = useState(0);
  const [touched, setTouched] = useState({});

  const steps = [
    {
      title: 'Host Information',
      fields: ['hostName', 'hostEmail'],
      description: 'Who are you meeting?',
    },
    {
      title: 'Visit Details',
      fields: ['visitPurpose', 'expectedDuration'],
      description: 'Tell us about your visit',
    },
    {
      title: 'Schedule',
      fields: ['visitDate', 'visitTime'],
      description: 'When is your visit?',
    },
  ];

  const currentStepData = steps[currentStep];
  const { visitDetails } = formData;
  const { visitDetails: visitValidation } = validation;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      visitDetails: {
        ...prev.visitDetails,
        [field]: value,
      },
    }));
  };

  const handleBlur = field => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack?.();
    }
  };

  const getFieldError = field => {
    return touched[field] ? visitValidation.errors[field] : '';
  };

  const isStepValid = () => {
    return currentStepData.fields.every(field => {
      const value = visitDetails[field];
      if (field === 'hostEmail') {
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      return value && value.trim() !== '';
    });
  };

  const visitPurposeOptions = [
    { value: '', label: 'Select visit purpose' },
    { value: 'meeting', label: 'Business Meeting' },
    { value: 'interview', label: 'Job Interview' },
    { value: 'delivery', label: 'Delivery/Pickup' },
    { value: 'maintenance', label: 'Maintenance/Service' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'training', label: 'Training' },
    { value: 'event', label: 'Event/Conference' },
    { value: 'other', label: 'Other' },
  ];

  const durationOptions = [
    { value: '', label: 'Select expected duration' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours (full day)' },
    { value: 'custom', label: 'Other' },
  ];

  const renderField = field => {
    const commonProps = {
      value: visitDetails[field] || '',
      onChange: e => updateField(field, e.target.value),
      onBlur: () => handleBlur(field),
      error: getFieldError(field),
      size: 'lg',
    };

    switch (field) {
      case 'hostName':
        return (
          <Input
            {...commonProps}
            label="Host Name"
            placeholder="Enter host name"
            required
          />
        );
      case 'hostEmail':
        return (
          <Input
            {...commonProps}
            label="Host Email"
            type="email"
            placeholder="Enter host email"
            required
          />
        );
      case 'visitPurpose':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Purpose <span className="text-red-500">*</span>
            </label>
            <select
              {...commonProps}
              className={cn(
                'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
                getFieldError(field)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              )}
            >
              {visitPurposeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getFieldError(field) && (
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
                {getFieldError(field)}
              </p>
            )}
          </div>
        );
      case 'expectedDuration':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Duration <span className="text-red-500">*</span>
            </label>
            <select
              {...commonProps}
              className={cn(
                'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
                getFieldError(field)
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              )}
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getFieldError(field) && (
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
                {getFieldError(field)}
              </p>
            )}
          </div>
        );
      case 'visitDate':
        return (
          <Input {...commonProps} label="Visit Date" type="date" required />
        );
      case 'visitTime':
        return (
          <Input {...commonProps} label="Visit Time" type="time" required />
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>{currentStepData.title}</Card.Title>
        <Card.Description>{currentStepData.description}</Card.Description>
      </Card.Header>

      <div className="space-y-6">
        {currentStepData.fields.map(field => (
          <div key={field}>{renderField(field)}</div>
        ))}

        <Card.Footer>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleBack}
            >
              Back
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === steps.length - 1 ? 'Continue' : 'Next'}
            </Button>
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
};

export default VisitDetailsForm;
export { VisitDetailsFormStep };

