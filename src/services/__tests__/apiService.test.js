import apiService from '../apiService';

// Mock fetch
global.fetch = jest.fn();

// Mock storage service
jest.mock('../storageService', () => ({
  queueOfflineAction: jest.fn(),
  processOfflineQueue: jest.fn(),
  storeVisitorData: jest.fn(),
  getVisitorData: jest.fn(),
  removeItem: jest.fn(),
  generateId: jest.fn(() => 'mock_id_123'),
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('APIService', () => {
  beforeEach(() => {
    fetch.mockClear();
    navigator.onLine = true;
  });

  describe('Basic Request Handling', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST request with data', async () => {
      const mockResponse = { id: '123' };
      const requestData = { name: 'John Doe' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.request('/visitors', {
        method: 'POST',
        data: requestData,
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/visitors',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiService.request('/nonexistent')).rejects.toThrow(
        'HTTP 404: Not Found'
      );
    });

    it('should retry failed requests', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const result = await apiService.request('/test');

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Visitor CRUD Operations', () => {
    it('should create visitor', async () => {
      const visitorData = { name: 'John Doe', email: 'john@example.com' };
      const mockResponse = { id: 'visitor_123', ...visitorData };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.createVisitor(visitorData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/visitors',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(visitorData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get visitor by ID', async () => {
      const mockResponse = { id: 'visitor_123', name: 'John Doe' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.getVisitor('visitor_123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/visitors/visitor_123',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update visitor', async () => {
      const visitorData = { name: 'John Updated' };
      const mockResponse = { id: 'visitor_123', ...visitorData };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.updateVisitor('visitor_123', visitorData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/visitors/visitor_123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(visitorData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete visitor', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await apiService.deleteVisitor('visitor_123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/visitors/visitor_123',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toBe(true);
    });
  });

  describe('Offline Handling', () => {
    it('should queue requests when offline', async () => {
      navigator.onLine = false;

      const visitorData = { name: 'John Doe' };

      await expect(apiService.createVisitor(visitorData)).rejects.toThrow(
        'Request queued for offline processing'
      );
    });

    it('should process offline queue when back online', async () => {
      const mockProcessOfflineQueue =
        require('../storageService').processOfflineQueue;
      mockProcessOfflineQueue.mockResolvedValueOnce({
        processed: [{ id: '1' }],
        failed: [],
      });

      // Simulate going online
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockProcessOfflineQueue).toHaveBeenCalled();
    });
  });

  describe('Host Notifications', () => {
    it('should notify host about visitor', async () => {
      const visitorData = {
        id: 'visitor_123',
        name: 'John Doe',
        hostEmail: 'host@example.com',
        visitTime: '10:00',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiService.notifyHost(visitorData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/notifications/host',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('John Doe'),
        })
      );
      expect(result).toBe(true);
    });

    it('should send SMS notification', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiService.sendSMS('+1234567890', 'Test message');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/notifications/sms',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: '+1234567890',
            message: 'Test message',
          }),
        })
      );
      expect(result).toBe(true);
    });
  });

  describe('System Health', () => {
    it('should report system health', async () => {
      const healthData = {
        status: 'healthy',
        uptime: 3600,
        memory: 512,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiService.reportSystemHealth(healthData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/system/health',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('healthy'),
        })
      );
      expect(result).toBe(true);
    });

    it('should get system configuration', async () => {
      const mockConfig = {
        kioskId: 'kiosk_001',
        location: 'Main Lobby',
        timezone: 'UTC',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      });

      const result = await apiService.getSystemConfig();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/system/config',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockConfig);
    });
  });

  describe('Analytics', () => {
    it('should send analytics data', async () => {
      const analyticsData = {
        event: 'visitor_checkin',
        timestamp: Date.now(),
        data: { visitorId: '123' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await apiService.sendAnalytics(analyticsData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analytics',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('visitor_checkin'),
        })
      );
      expect(result).toBe(true);
    });

    it('should get visitor statistics', async () => {
      const mockStats = {
        totalVisitors: 100,
        checkedIn: 50,
        checkedOut: 45,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await apiService.getVisitorStats();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/analytics/visitors',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.request('/test')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle timeout errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(
        apiService.request('/test', { timeout: 1000 })
      ).rejects.toThrow('Request timeout');
    });

    it('should not retry on client errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(apiService.request('/test')).rejects.toThrow(
        'HTTP 400: Bad Request'
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Utility Methods', () => {
    it('should check API health', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const result = await apiService.checkAPIHealth();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health',
        expect.objectContaining({ timeout: 5000 })
      );
      expect(result).toBe(true);
    });

    it('should get network status', () => {
      const status = apiService.getNetworkStatus();

      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('lastCheck');
    });
  });
});


