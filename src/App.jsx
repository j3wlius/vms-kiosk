import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './stores';
import MainLayout from './components/common/MainLayout';
import IdleScreen from './components/screens/IdleScreen';
import MainMenuScreen from './components/screens/MainMenuScreen';
import CheckInScreen from './components/screens/CheckInScreen';
import VerificationScreen from './components/screens/VerificationScreen';
import ContactInfoScreen from './components/screens/ContactInfoScreen';
import VisitDetailsScreen from './components/screens/VisitDetailsScreen';
import BadgePrintScreen from './components/screens/BadgePrintScreen';
import CheckOutScreen from './components/screens/CheckOutScreen';
import ToastNotifications from './components/ui/ToastNotifications';
import OfflineIndicator from './components/ui/OfflineIndicator';
import useIdleDetection from './hooks/useIdleDetection';

function App() {
  const { isIdle, resetIdleTimer } = useIdleDetection(30000);

  // show idle screen if idle
  if (isIdle) {
    return (
      <div onClick={resetIdleTimer}>
        <IdleScreen />
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<MainMenuScreen />} />
            <Route path="checkin" element={<CheckInScreen />} />
            <Route path="verify" element={<VerificationScreen />} />
            <Route path="contact-info" element={<ContactInfoScreen />} />
            <Route path="visit-details" element={<VisitDetailsScreen />} />
            <Route path="print" element={<BadgePrintScreen />} />
            <Route path="checkout" element={<CheckOutScreen />} />
          </Route>
        </Routes>
        {/* Global Toast Notifications */}
        <ToastNotifications />
        {/* Offline Status Indicator */}
        <OfflineIndicator />
      </Router>
    </AppProvider>
  );
}

export default App;
