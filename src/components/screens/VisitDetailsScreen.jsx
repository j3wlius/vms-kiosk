import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisitDetailsForm } from '../forms';
import { Card } from '../ui';

const VisitDetailsScreen = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    console.log('Moving to badge print screen');
    navigate('/print');
  };

  const handleBack = () => {
    navigate('/contact-info');
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Visit details submitted:', formData);
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
        <VisitDetailsForm
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default VisitDetailsScreen;