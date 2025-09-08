import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenuScreen = () => {
  const navigate = useNavigate();

  const handleCheckIn = () => {
    navigate('/checkin');
  };

  const handleCheckOut = () => {
    navigate('/checkout');
  };

  const handleCameraTest = () => {
    navigate('/camera-test');
  };


  return (
    <div className="kiosk-container flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 kiosk-text">
            Welcome to Visitor Management
          </h1>
          <p className="text-gray-600 mb-8 kiosk-text">
            Please select what you would like to do
          </p>

          <div className="space-y-4">
            <button
              onClick={handleCheckIn}
              className="w-full bg-blue-600 text-white py-4 sm:py-6 px-8 rounded-lg hover:bg-blue-700 transition-colors touch-button kiosk-button text-lg sm:text-xl font-medium"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="text-left">
                  <div>Check In</div>
                  <div className="text-sm opacity-90">New visitor registration</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleCheckOut}
              className="w-full bg-green-600 text-white py-4 sm:py-6 px-8 rounded-lg hover:bg-green-700 transition-colors touch-button kiosk-button text-lg sm:text-xl font-medium"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="text-left">
                  <div>Check Out</div>
                  <div className="text-sm opacity-90">End your visit</div>
                </div>
              </div>
            </button>
            
            {/* Camera Test Button (for debugging) */}
            <button
              onClick={handleCameraTest}
              className="w-full bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors touch-button kiosk-button text-sm font-medium"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🔧</span>
                <div>Camera Test (Debug)</div>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 kiosk-text">
              <strong>Check In:</strong> Scan your ID document to register as a visitor<br/>
              <strong>Check Out:</strong> Scan your visitor badge to end your visit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
