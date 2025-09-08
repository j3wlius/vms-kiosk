import { renderHook, act } from '@testing-library/react';
import { useCamera, useCameraCapture } from '../useCamera';

// Mock the services
jest.mock('../../services', () => ({
  cameraService: {
    initialize: jest.fn(),
    startPreview: jest.fn(),
    stopPreview: jest.fn(),
    captureImage: jest.fn(),
    captureImageAsBase64: jest.fn(),
    switchDevice: jest.fn(),
    updateSettings: jest.fn(),
    requestPermissions: jest.fn(),
    getDevices: jest.fn(),
    getStatus: jest.fn(() => ({
      isProcessing: false,
      devices: [],
      selectedDevice: null,
      settings: {},
    })),
    onDeviceChange: jest.fn(),
    onPermissionChange: jest.fn(),
    onError: jest.fn(),
  },
}));

// Mock Jotai atoms
jest.mock('jotai', () => ({
  useSetAtom: jest.fn(() => jest.fn()),
  useAtomValue: jest.fn(() => null),
}));

describe('useCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCamera Hook', () => {
    it('should initialize camera service', async () => {
      const { cameraService } = require('../../services');
      cameraService.initialize.mockResolvedValue(true);
      cameraService.getDevices.mockResolvedValue([]);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const success = await result.current.initialize();
        expect(success).toBe(true);
      });

      expect(cameraService.initialize).toHaveBeenCalled();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should start camera preview', async () => {
      const { cameraService } = require('../../services');
      const mockVideoElement = document.createElement('video');

      cameraService.initialize.mockResolvedValue(true);
      cameraService.startPreview.mockResolvedValue(true);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.initialize();
        const success = await result.current.startPreview(mockVideoElement);
        expect(success).toBe(true);
      });

      expect(cameraService.startPreview).toHaveBeenCalledWith(
        mockVideoElement,
        {}
      );
      expect(result.current.isActive).toBe(true);
    });

    it('should stop camera preview', async () => {
      const { cameraService } = require('../../services');
      cameraService.stopPreview.mockResolvedValue(true);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const success = await result.current.stopPreview();
        expect(success).toBe(true);
      });

      expect(cameraService.stopPreview).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should capture image', async () => {
      const { cameraService } = require('../../services');
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      cameraService.captureImage.mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useCamera());

      // Mock active state
      result.current.isActive = true;

      await act(async () => {
        const imageData = await result.current.captureImage();
        expect(imageData).toBeDefined();
        expect(imageData.blob).toBe(mockBlob);
      });

      expect(cameraService.captureImage).toHaveBeenCalled();
    });

    it('should capture image as base64', async () => {
      const { cameraService } = require('../../services');
      const mockBase64 = 'data:image/jpeg;base64,test';

      cameraService.captureImageAsBase64.mockResolvedValue(mockBase64);

      const { result } = renderHook(() => useCamera());

      // Mock active state
      result.current.isActive = true;

      await act(async () => {
        const base64Data = await result.current.captureImageAsBase64();
        expect(base64Data).toBe(mockBase64);
      });

      expect(cameraService.captureImageAsBase64).toHaveBeenCalled();
    });

    it('should switch camera device', async () => {
      const { cameraService } = require('../../services');
      cameraService.switchDevice.mockResolvedValue(true);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const success = await result.current.switchDevice('device_123');
        expect(success).toBe(true);
      });

      expect(cameraService.switchDevice).toHaveBeenCalledWith('device_123');
    });

    it('should update camera settings', async () => {
      const { cameraService } = require('../../services');
      cameraService.updateSettings.mockResolvedValue(true);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const success = await result.current.updateSettings({
          resolution: { width: 1920, height: 1080 },
        });
        expect(success).toBe(true);
      });

      expect(cameraService.updateSettings).toHaveBeenCalledWith({
        resolution: { width: 1920, height: 1080 },
      });
    });

    it('should request camera permissions', async () => {
      const { cameraService } = require('../../services');
      cameraService.requestPermissions.mockResolvedValue(true);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const success = await result.current.requestPermissions();
        expect(success).toBe(true);
      });

      expect(cameraService.requestPermissions).toHaveBeenCalled();
    });

    it('should get available devices', async () => {
      const { cameraService } = require('../../services');
      const mockDevices = [
        { deviceId: 'device_1', label: 'Camera 1' },
        { deviceId: 'device_2', label: 'Camera 2' },
      ];

      cameraService.getDevices.mockResolvedValue(mockDevices);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        const devices = await result.current.getDevices();
        expect(devices).toEqual(mockDevices);
      });

      expect(cameraService.getDevices).toHaveBeenCalled();
    });

    it('should clear captured images', () => {
      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.clearCapturedImages();
      });

      expect(result.current.capturedImages).toEqual([]);
    });

    it('should remove specific captured image', () => {
      const { result } = renderHook(() => useCamera());

      // Mock captured images
      result.current.capturedImages = [
        { id: '1', blob: new Blob() },
        { id: '2', blob: new Blob() },
      ];

      act(() => {
        result.current.removeCapturedImage('1');
      });

      expect(result.current.capturedImages).toHaveLength(1);
      expect(result.current.capturedImages[0].id).toBe('2');
    });

    it('should reset camera state', () => {
      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.reset();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.capturedImages).toEqual([]);
    });
  });

  describe('useCameraCapture Hook', () => {
    it('should capture image with retry logic', async () => {
      const { cameraService } = require('../../services');
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      cameraService.captureImage.mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useCameraCapture());

      await act(async () => {
        const imageData = await result.current.captureWithRetry();
        expect(imageData).toBeDefined();
      });

      expect(result.current.isCapturing).toBe(false);
      expect(result.current.lastCapture).toBeDefined();
    });

    it('should handle capture failures with retry', async () => {
      const { cameraService } = require('../../services');

      cameraService.captureImage
        .mockRejectedValueOnce(new Error('Capture failed'))
        .mockRejectedValueOnce(new Error('Capture failed'))
        .mockResolvedValueOnce(new Blob(['test'], { type: 'image/jpeg' }));

      const { result } = renderHook(() => useCameraCapture());

      await act(async () => {
        const imageData = await result.current.captureWithRetry();
        expect(imageData).toBeDefined();
      });

      expect(cameraService.captureImage).toHaveBeenCalledTimes(3);
    });

    it('should clear capture history', () => {
      const { result } = renderHook(() => useCameraCapture());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.captureHistory).toEqual([]);
      expect(result.current.lastCapture).toBeNull();
    });
  });
});


