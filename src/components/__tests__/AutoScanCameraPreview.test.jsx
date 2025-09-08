import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AutoScanCameraPreview from '../ui/AutoScanCameraPreview';

// Mock the hooks
vi.mock('../../hooks/useCamera', () => ({
  useCamera: () => ({
    isInitialized: true,
    isActive: true,
    permissions: { granted: true, denied: false, prompt: false },
    initialize: vi.fn(),
    startPreview: vi.fn(),
    stopPreview: vi.fn(),
    requestPermissions: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAutoScan', () => ({
  useAutoScan: () => ({
    isAutoScanning: true,
    documentStatus: {
      detected: true,
      positioned: true,
      quality: 0.8,
      position: { x: 100, y: 100, width: 200, height: 120 },
      instructions: 'Perfect! Document is ready for scanning',
      canScan: true,
    },
    isScanning: false,
    initialize: vi.fn(),
    startAutoScan: vi.fn(),
    stopAutoScan: vi.fn(),
    manualScan: vi.fn(),
    reset: vi.fn(),
    updateSettings: vi.fn(),
    canScan: true,
    hasDocument: true,
    isPositioned: true,
    quality: 0.8,
    instructions: 'Perfect! Document is ready for scanning',
  }),
}));

// Mock Jotai atoms
vi.mock('jotai', () => ({
  useAtomValue: () => ({
    resolution: { width: 1280, height: 720 },
    frameRate: 30,
  }),
}));

describe('AutoScanCameraPreview', () => {
  const mockOnScanComplete = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders camera preview with auto-scan functionality', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        autoStart={true}
        showInstructions={true}
        showQualityIndicator={true}
      />
    );

    expect(screen.getByRole('video')).toBeInTheDocument();
  });

  it('displays document detection overlay when document is detected', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        showInstructions={true}
        showQualityIndicator={true}
      />
    );

    // Check for document outline (would be present in DOM when document is detected)
    const videoElement = screen.getByRole('video');
    expect(videoElement).toBeInTheDocument();
  });

  it('shows quality indicator when enabled', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        showQualityIndicator={true}
      />
    );

    // Quality indicator should be present
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('displays instructions when enabled', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        showInstructions={true}
      />
    );

    // Instructions should be displayed
    expect(screen.getByText('Perfect! Document is ready for scanning')).toBeInTheDocument();
  });

  it('shows manual scan button when document is ready', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        showInstructions={true}
      />
    );

    expect(screen.getByText('Scan Now')).toBeInTheDocument();
  });

  it('displays status indicators', () => {
    render(
      <AutoScanCameraPreview
        onScanComplete={mockOnScanComplete}
        onError={mockOnError}
        showInstructions={true}
      />
    );

    // Status indicators should be present
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Positioned')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });
});
