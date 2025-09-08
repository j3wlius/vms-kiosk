import React from 'react';

const IdleScreen = () => {
  return (
    <div className="kiosk-container flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="text-center text-white">
        {/* Company Logo Area */}
        <div className="mb-12">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl sm:text-5xl">🏢</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 kiosk-text">
            Welcome
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 kiosk-text">
            Touch to begin
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center space-x-4 text-lg sm:text-xl text-white/70">
            <span className="flex items-center space-x-2">
              <span className="text-2xl">📷</span>
              <span>Check In</span>
            </span>
            <span className="text-white/50">or</span>
            <span className="flex items-center space-x-2">
              <span className="text-2xl">📤</span>
              <span>Check Out</span>
            </span>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-base text-white/80">
                System Ready
              </span>
            </div>
          </div>
        </div>

        {/* Touch to start indicator */}
        <div className="mt-12 animate-bounce">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 inline-block">
            <span className="text-2xl sm:text-3xl">👆</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleScreen;
