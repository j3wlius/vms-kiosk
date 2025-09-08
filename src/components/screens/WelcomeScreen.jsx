import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('kiosk-language') || 'en';
  });

  const handleLanguageSelect = languageCode => {
    console.log('Current language:', language);
    console.log('Language selected:', languageCode);

    try {
      // Set the selected language
      setLanguage(languageCode);
      console.log('Language set successfully, new value:', languageCode);

      // Store language in localStorage for persistence
      localStorage.setItem('kiosk-language', languageCode);

      // Navigate to the check-in screen
      navigate('/checkin');
      console.log('Navigation triggered to /checkin');
    } catch (error) {
      console.error('Error in language selection:', error);
    }
  };


  return (
    <div className="kiosk-container flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 kiosk-text">
            Welcome to Visitor Management
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 kiosk-text">
            Please select your preferred language to begin your visit
          </p>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors touch-button kiosk-button"
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSelect('es')}
              className="w-full bg-gray-200 text-gray-800 py-3 sm:py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors touch-button kiosk-button"
            >
              Español
            </button>
            <button
              onClick={() => handleLanguageSelect('fr')}
              className="w-full bg-gray-200 text-gray-800 py-3 sm:py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors touch-button kiosk-button"
            >
              Français
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
