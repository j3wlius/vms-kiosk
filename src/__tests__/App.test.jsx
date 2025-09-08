import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Helper function to render with router
const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Mock the idle detection hook to return not idle for testing
jest.mock('../hooks/useIdleDetection', () => ({
  __esModule: true,
  default: () => ({
    isIdle: false,
    resetIdleTimer: jest.fn(),
    lastActivity: Date.now(),
  }),
}));

describe('App', () => {
  it('renders welcome screen by default', () => {
    renderWithRouter(<App />);
    expect(
      screen.getByText('Welcome to Visitor Management')
    ).toBeInTheDocument();
  });

  it('renders navigation', () => {
    renderWithRouter(<App />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });
});

describe('App with Idle Detection', () => {
  it('renders idle screen when idle', () => {
    // Mock the hook to return idle state
    jest.doMock('../hooks/useIdleDetection', () => ({
      __esModule: true,
      default: () => ({
        isIdle: true,
        resetIdleTimer: jest.fn(),
        lastActivity: Date.now(),
      }),
    }));

    const { default: AppWithIdle } = require('../App');
    renderWithRouter(<AppWithIdle />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Touch to begin your visit')).toBeInTheDocument();
  });
});
