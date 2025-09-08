import storageService from '../storageService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageService', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve data', () => {
      const testData = { name: 'John Doe', email: 'john@example.com' };

      storageService.setItem('test', testData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kiosk_visitor_test',
        expect.any(String)
      );
    });

    it('should retrieve data with default value', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storageService.getItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should remove data', () => {
      storageService.removeItem('test');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'kiosk_visitor_test'
      );
    });
  });

  describe('Encryption', () => {
    it('should encrypt data before storage', () => {
      const testData = { sensitive: 'data' };

      storageService.setItem('encrypted', testData, true);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const encryptedData = setItemCall[1];

      // Encrypted data should be a string and different from original
      expect(typeof encryptedData).toBe('string');
      expect(encryptedData).not.toBe(JSON.stringify(testData));
    });

    it('should decrypt data after retrieval', () => {
      const testData = { sensitive: 'data' };

      // First store encrypted data
      storageService.setItem('encrypted', testData, true);
      const encryptedData = localStorageMock.setItem.mock.calls[0][1];

      // Mock retrieval
      localStorageMock.getItem.mockReturnValue(encryptedData);

      const result = storageService.getItem('encrypted');
      expect(result).toEqual(testData);
    });
  });

  describe('Visitor Data Management', () => {
    it('should store visitor data', () => {
      const visitorData = {
        id: 'visitor_123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      storageService.storeVisitorData('visitor_123', visitorData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kiosk_visitor_visitor_visitor_123',
        expect.any(String)
      );
    });

    it('should retrieve visitor data', () => {
      const visitorData = { id: 'visitor_123', name: 'John Doe' };
      const encryptedData = storageService.encrypt(visitorData);

      localStorageMock.getItem.mockReturnValue(encryptedData);

      const result = storageService.getVisitorData('visitor_123');
      expect(result).toEqual(visitorData);
    });

    it('should store session data', () => {
      const sessionData = {
        id: 'session_123',
        startTime: Date.now(),
        status: 'active',
      };

      storageService.storeSessionData('session_123', sessionData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kiosk_visitor_session_session_123',
        expect.any(String)
      );
    });
  });

  describe('Offline Queue Management', () => {
    it('should queue offline actions', () => {
      const action = {
        type: 'api_request',
        method: 'POST',
        endpoint: '/visitors',
        data: { name: 'John' },
      };

      storageService.queueOfflineAction(action);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kiosk_visitor_offline_queue',
        expect.any(String)
      );
    });

    it('should retrieve offline queue', () => {
      const queue = [
        { type: 'api_request', id: '1' },
        { type: 'api_request', id: '2' },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue));

      const result = storageService.getOfflineQueue();
      expect(result).toEqual(queue);
    });

    it('should clear offline queue', () => {
      storageService.clearOfflineQueue();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'kiosk_visitor_offline_queue'
      );
    });
  });

  describe('GDPR Compliance', () => {
    it('should clear personal data', () => {
      // Mock localStorage keys
      Object.defineProperty(localStorageMock, 'length', { value: 3 });
      Object.defineProperty(localStorageMock, 'key', index => {
        const keys = [
          'kiosk_visitor_visitor_1',
          'kiosk_visitor_visitor_2',
          'other_key',
        ];
        return keys[index] || null;
      });

      const result = storageService.clearPersonalData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'kiosk_visitor_visitor_1'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'kiosk_visitor_visitor_2'
      );
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
      expect(result).toBe(2);
    });

    it('should export visitor data', () => {
      const visitorData = { id: 'visitor_123', name: 'John Doe' };
      const sessionData = { id: 'session_123', status: 'active' };

      // Mock data retrieval
      jest
        .spyOn(storageService, 'getItem')
        .mockReturnValueOnce(visitorData)
        .mockReturnValueOnce(sessionData)
        .mockReturnValueOnce({ timestamp: Date.now() });

      const result = storageService.exportVisitorData('visitor_123');

      expect(result).toHaveProperty('visitorId', 'visitor_123');
      expect(result).toHaveProperty('data.visitor', visitorData);
      expect(result).toHaveProperty('data.session', sessionData);
    });
  });

  describe('Consent Management', () => {
    it('should store consent', () => {
      const consent = {
        accepted: true,
        timestamp: Date.now(),
        version: '1.0',
      };

      storageService.setConsent(consent);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kiosk_visitor_kiosk_consent',
        JSON.stringify(consent)
      );
    });

    it('should check valid consent', () => {
      const validConsent = {
        accepted: true,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
      };

      jest.spyOn(storageService, 'getConsent').mockReturnValue(validConsent);

      const result = storageService.hasValidConsent();
      expect(result).toBe(true);
    });

    it('should detect expired consent', () => {
      const expiredConsent = {
        accepted: true,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400, // 400 days ago
      };

      jest.spyOn(storageService, 'getConsent').mockReturnValue(expiredConsent);

      const result = storageService.hasValidConsent();
      expect(result).toBe(false);
    });
  });

  describe('Storage Statistics', () => {
    it('should get storage statistics', () => {
      // Mock localStorage keys
      Object.defineProperty(localStorageMock, 'length', { value: 5 });
      Object.defineProperty(localStorageMock, 'key', index => {
        const keys = [
          'kiosk_visitor_visitor_1',
          'kiosk_visitor_visitor_2',
          'kiosk_visitor_session_1',
          'kiosk_visitor_meta_visitor_1',
          'other_key',
        ];
        return keys[index] || null;
      });

      // Mock getItem for size calculation
      localStorageMock.getItem.mockReturnValue('test data');

      const stats = storageService.getStorageStats();

      expect(stats.totalKeys).toBe(4); // Excludes non-kiosk keys
      expect(stats.visitorCount).toBe(2);
      expect(stats.sessionCount).toBe(1);
      expect(stats.metadataKeys).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption errors', () => {
      // Mock encryption to throw error
      jest.spyOn(storageService, 'encrypt').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      expect(() => {
        storageService.setItem('test', { data: 'test' });
      }).toThrow('Failed to encrypt data');
    });

    it('should handle decryption errors', () => {
      // Mock invalid encrypted data
      localStorageMock.getItem.mockReturnValue('invalid-encrypted-data');

      const result = storageService.getItem('test', 'default');
      expect(result).toBe('default');
    });
  });
});


