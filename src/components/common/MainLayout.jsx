import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const MainLayout = () => {
  return (
    <div className="kiosk-container bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 kiosk-text">
                Visitor Management System
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-500 kiosk-text">
                Kiosk Mode
              </span>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Navigation */}
      {/* <Navigation /> */}

      {/* Footer */}
      {/* <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="text-center text-xs sm:text-sm text-gray-500 kiosk-text">
            <p>© 2024 Visitor Management System. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default MainLayout;
