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
 * ContactDetailsForm Component
 * Contact and emergency information collection form
 */
const ContactDetailsForm = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { emergencyContact } = formData;
  const { emergencyContact: emergencyValidation } = validation;

  // Update form data
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
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
        name: true,
        phone: true,
        relationship: true,
      });

      // Check if form is valid
      if (emergencyValidation.isValid) {
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
    return touched[field] ? emergencyValidation.errors[field] : '';
  };

  // Relationship options
  const relationshipOptions = [
    { value: '', label: 'Select relationship' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>Emergency Contact</Card.Title>
        <Card.Description>
          Please provide an emergency contact person in case of an emergency
          during your visit.
        </Card.Description>
      </Card.Header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Emergency Contact Name"
          value={emergencyContact.name}
          onChange={e => updateField('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={getFieldError('name')}
          required
          placeholder="Enter emergency contact name"
          size="lg"
        />

        <Input
          label="Emergency Contact Phone"
          type="tel"
          value={emergencyContact.phone}
          onChange={e => updateField('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={getFieldError('phone')}
          required
          placeholder="Enter emergency contact phone number"
          size="lg"
          helperText="Include country code if international"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship <span className="text-red-500">*</span>
          </label>
          <select
            value={emergencyContact.relationship}
            onChange={e => updateField('relationship', e.target.value)}
            onBlur={() => handleBlur('relationship')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('relationship')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {relationshipOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('relationship') && (
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
              {getFieldError('relationship')}
            </p>
          )}
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
                Privacy Notice
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your emergency contact information will only be used in case
                  of an emergency during your visit. This information is kept
                  secure and will not be shared with third parties.
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
              disabled={!emergencyValidation.isValid}
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
 * ContactDetailsFormStep Component
 * Simplified version for step-by-step forms
 */
const ContactDetailsFormStep = ({
  onNext,
  onBack,
  className = '',
  ...props
}) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [touched, setTouched] = useState({});

  const { emergencyContact } = formData;
  const { emergencyValidation } = validation;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
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
    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      relationship: true,
    });

    if (emergencyValidation.isValid) {
      onNext?.();
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  const getFieldError = field => {
    return touched[field] ? emergencyValidation.errors[field] : '';
  };

  const relationshipOptions = [
    { value: '', label: 'Select relationship' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>Emergency Contact</Card.Title>
        <Card.Description>
          Please provide an emergency contact person.
        </Card.Description>
      </Card.Header>

      <div className="space-y-6">
        <Input
          label="Emergency Contact Name"
          value={emergencyContact.name}
          onChange={e => updateField('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={getFieldError('name')}
          required
          placeholder="Enter emergency contact name"
          size="lg"
        />

        <Input
          label="Emergency Contact Phone"
          type="tel"
          value={emergencyContact.phone}
          onChange={e => updateField('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={getFieldError('phone')}
          required
          placeholder="Enter emergency contact phone number"
          size="lg"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship <span className="text-red-500">*</span>
          </label>
          <select
            value={emergencyContact.relationship}
            onChange={e => updateField('relationship', e.target.value)}
            onBlur={() => handleBlur('relationship')}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 min-h-[48px]',
              getFieldError('relationship')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            )}
          >
            {relationshipOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {getFieldError('relationship') && (
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
              {getFieldError('relationship')}
            </p>
          )}
        </div>

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
              disabled={!emergencyValidation.isValid}
            >
              Continue
            </Button>
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
};

export default ContactDetailsForm;
export { ContactDetailsFormStep };

