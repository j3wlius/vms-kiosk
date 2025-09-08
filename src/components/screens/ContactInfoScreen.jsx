import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactDetailsForm } from '../forms';
import { Card } from '../ui';

const ContactInfoScreen = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    console.log('Moving to visit details screen');
    navigate('/visit-details');
  };

  const handleBack = () => {
    navigate('/verify');
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Contact info submitted:', formData);
      handleNext();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="kiosk-container flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full">
        <ContactDetailsForm
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default ContactInfoScreen;