import React, { useState, useEffect } from 'react';
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
 * VisitorInfoForm Component
 * Personal information collection form with validation
 */
const VisitorInfoForm = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { personalInfo } = formData;
  const { personalInfo: personalValidation } = validation;

  // Update form data
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
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
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        position: true,
      });

      // Check if form is valid
      if (personalValidation.isValid) {
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
    return touched[field] ? personalValidation.errors[field] : '';
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>Personal Information</Card.Title>
        <Card.Description>
          Please provide your personal details for the visitor registration.
        </Card.Description>
      </Card.Header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={personalInfo.firstName}
            onChange={e => updateField('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            error={getFieldError('firstName')}
            required
            placeholder="Enter your first name"
            size="lg"
          />

          <Input
            label="Last Name"
            value={personalInfo.lastName}
            onChange={e => updateField('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            error={getFieldError('lastName')}
            required
            placeholder="Enter your last name"
            size="lg"
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={personalInfo.email}
          onChange={e => updateField('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={getFieldError('email')}
          required
          placeholder="Enter your email address"
          size="lg"
          helperText="We'll use this to send you updates about your visit"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={personalInfo.phone}
          onChange={e => updateField('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          error={getFieldError('phone')}
          placeholder="Enter your phone number"
          size="lg"
          helperText="Optional - for emergency contact purposes"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company"
            value={personalInfo.company}
            onChange={e => updateField('company', e.target.value)}
            onBlur={() => handleBlur('company')}
            error={getFieldError('company')}
            placeholder="Enter your company name"
            size="lg"
            helperText="Optional"
          />

          <Input
            label="Position"
            value={personalInfo.position}
            onChange={e => updateField('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            error={getFieldError('position')}
            placeholder="Enter your job title"
            size="lg"
            helperText="Optional"
          />
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
              disabled={!personalValidation.isValid}
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
 * VisitorInfoFormStep Component
 * Simplified version for step-by-step forms
 */
const VisitorInfoFormStep = ({ onNext, onBack, className = '', ...props }) => {
  const formData = useAtomValue(formDataAtom);
  const validation = useAtomValue(formValidationAtom);
  const setFormData = useSetAtom(formDataAtom);

  const [currentStep, setCurrentStep] = useState(0);
  const [touched, setTouched] = useState({});

  const steps = [
    {
      title: 'Name',
      fields: ['firstName', 'lastName'],
      description: 'Please enter your full name',
    },
    {
      title: 'Contact',
      fields: ['email', 'phone'],
      description: 'How can we reach you?',
    },
    {
      title: 'Company',
      fields: ['company', 'position'],
      description: 'Tell us about your organization',
    },
  ];

  const currentStepData = steps[currentStep];
  const { personalInfo } = formData;
  const { personalInfo: personalValidation } = validation;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
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
    return touched[field] ? personalValidation.errors[field] : '';
  };

  const isStepValid = () => {
    return currentStepData.fields.every(field => {
      const value = personalInfo[field];
      if (field === 'email') {
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      return value && value.trim() !== '';
    });
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)} {...props}>
      <Card.Header>
        <Card.Title>{currentStepData.title}</Card.Title>
        <Card.Description>{currentStepData.description}</Card.Description>
      </Card.Header>

      <div className="space-y-6">
        {currentStepData.fields.map(field => (
          <Input
            key={field}
            label={
              field === 'firstName'
                ? 'First Name'
                : field === 'lastName'
                  ? 'Last Name'
                  : field === 'email'
                    ? 'Email Address'
                    : field === 'phone'
                      ? 'Phone Number'
                      : field === 'company'
                        ? 'Company'
                        : field === 'position'
                          ? 'Position'
                          : field
            }
            type={
              field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'
            }
            value={personalInfo[field] || ''}
            onChange={e => updateField(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            error={getFieldError(field)}
            required={['firstName', 'lastName', 'email'].includes(field)}
            placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            size="lg"
          />
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

export default VisitorInfoForm;
export { VisitorInfoFormStep };
