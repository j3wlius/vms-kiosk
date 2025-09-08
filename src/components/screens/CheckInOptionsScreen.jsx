import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckInOptionsScreen = () => {
  const navigate = useNavigate();

  const handleAlreadyRegistered = () => {
    // Navigate to checkin with a flag indicating this is for already registered users
    navigate('/checkin?mode=registered');
  };

  const handleScanID = () => {
    // Navigate to checkin with a flag indicating this is for new users with ID
    navigate('/checkin?mode=new');
  };

  const handleManualRegister = () => {
    navigate('/verify');
  };

  const handleBack = () => {
    navigate('/');
  };

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
                  Check-In Registration
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 kiosk-text">
                <div className="font-medium">Secure Registration</div>
                <div className="text-xs">Choose your check-in method</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 mb-4 kiosk-text">
              Check-In Options
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-2 kiosk-text">
              Please select your preferred registration method
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
          </div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Already Registered Option */}
            <div className="group">
              <button
                onClick={handleAlreadyRegistered}
                className="w-full bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl p-8 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2 kiosk-text">
                      Already Registered
                    </h3>
                    <p className="text-slate-600 mb-4 kiosk-text text-sm">
                      Enter your pre-registration code or scan your QR code
                    </p>
                    <div className="flex items-center justify-center text-blue-600 text-sm font-medium">
                      <span>Continue Registration</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Scan ID Option */}
            <div className="group">
              <button
                onClick={handleScanID}
                className="w-full bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-300 rounded-xl p-8 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2 kiosk-text">
                      Scan ID Document
                    </h3>
                    <p className="text-slate-600 mb-4 kiosk-text text-sm">
                      New visitor with valid government-issued ID
                    </p>
                    <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                      <span>Start ID Scan</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Manual Register Option */}
            <div className="group">
              <button
                onClick={handleManualRegister}
                className="w-full bg-white hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 rounded-xl p-8 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2 kiosk-text">
                      Manual Registration
                    </h3>
                    <p className="text-slate-600 mb-4 kiosk-text text-sm">
                      Enter your details manually if can't scan
                    </p>
                    <div className="flex items-center justify-center text-purple-600 text-sm font-medium">
                      <span>Enter Details</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors duration-200 kiosk-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Main Menu
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 kiosk-text">
                  Registration Information
                </h4>
                <p className="text-sm text-slate-600 kiosk-text leading-relaxed">
                  All registration methods are secure and comply with institutional policies. 
                  Your information is encrypted and used only for security and access control purposes.
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
              <span>Secure Registration</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckInOptionsScreen;
