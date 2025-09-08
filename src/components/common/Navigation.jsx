import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Main Menu', icon: '🏠' },
    { path: '/checkin', label: 'Check In', icon: '📷' },
    { path: '/verify', label: 'Verify', icon: '✅' },
    { path: '/print', label: 'Print', icon: '🖨️' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-1 sm:space-x-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 sm:px-4 rounded-lg transition-colors touch-button ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg sm:text-xl mb-1">{item.icon}</span>
              <span className="text-xs sm:text-sm font-medium kiosk-text">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
