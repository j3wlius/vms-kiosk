import CryptoJS from 'crypto-js';

/**
 * Storage Service
 * Provides encrypted local storage with GDPR compliance for visitor data
 */
class StorageService {
  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.storagePrefix = 'kiosk_visitor_';
    this.consentKey = 'kiosk_consent';
    this.retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  }

  /**
   * Get or create encryption key for data security
   * @returns {string} Encryption key
   */
  getOrCreateEncryptionKey() {
    let key = localStorage.getItem('kiosk_encryption_key');
    if (!key) {
      // Generate a new encryption key
      key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      localStorage.setItem('kiosk_encryption_key', key);
    }
    return key;
  }

  /**
   * Encrypt data before storage
   * @param {any} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data after retrieval
   * @param {string} encryptedData - Encrypted data
   * @returns {any} Decrypted data
   */
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Store encrypted data in localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @param {boolean} encrypt - Whether to encrypt the data
   */
  setItem(key, data, encrypt = true) {
    try {
      const storageKey = `${this.storagePrefix}${key}`;
      const dataToStore = encrypt ? this.encrypt(data) : data;
      localStorage.setItem(storageKey, dataToStore);

      // Update metadata
      this.updateMetadata(key, {
        timestamp: Date.now(),
        encrypted: encrypt,
        size: JSON.stringify(data).length,
      });
    } catch (error) {
      console.error('Storage failed:', error);
      throw new Error('Failed to store data');
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Retrieved data
   */
  getItem(key, defaultValue = null) {
    try {
      const storageKey = `${this.storagePrefix}${key}`;
      const encryptedData = localStorage.getItem(storageKey);

      if (!encryptedData) {
        return defaultValue;
      }

      // Check if data is encrypted
      const metadata = this.getMetadata(key);
      if (metadata && metadata.encrypted) {
        return this.decrypt(encryptedData);
      } else {
        return JSON.parse(encryptedData);
      }
    } catch (error) {
      console.error('Retrieval failed:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    const storageKey = `${this.storagePrefix}${key}`;
    localStorage.removeItem(storageKey);
    this.removeMetadata(key);
  }

  /**
   * Clear all visitor data (GDPR compliance)
   */
  clearPersonalData() {
    try {
      const keys = Object.keys(localStorage);
      const visitorKeys = keys.filter(key =>
        key.startsWith(this.storagePrefix)
      );

      visitorKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear metadata
      this.clearMetadata();

      console.log(`Cleared ${visitorKeys.length} visitor data entries`);
      return visitorKeys.length;
    } catch (error) {
      console.error('Clear data failed:', error);
      throw new Error('Failed to clear personal data');
    }
  }

  /**
   * Export visitor data for GDPR compliance
   * @param {string} visitorId - Visitor ID to export
   * @returns {object} Exported visitor data
   */
  exportVisitorData(visitorId) {
    try {
      const visitorData = this.getItem(`visitor_${visitorId}`);
      const sessionData = this.getItem(`session_${visitorId}`);
      const metadata = this.getMetadata(`visitor_${visitorId}`);

      return {
        visitorId,
        exportedAt: new Date().toISOString(),
        data: {
          visitor: visitorData,
          session: sessionData,
          metadata: metadata,
        },
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export visitor data');
    }
  }

  /**
   * Store visitor data with automatic cleanup
   * @param {string} visitorId - Visitor ID
   * @param {object} visitorData - Visitor data to store
   */
  storeVisitorData(visitorId, visitorData) {
    this.setItem(`visitor_${visitorId}`, visitorData);
    this.scheduleCleanup(visitorId);
  }

  /**
   * Store session data
   * @param {string} sessionId - Session ID
   * @param {object} sessionData - Session data to store
   */
  storeSessionData(sessionId, sessionData) {
    this.setItem(`session_${sessionId}`, sessionData);
  }

  /**
   * Get visitor data
   * @param {string} visitorId - Visitor ID
   * @returns {object|null} Visitor data
   */
  getVisitorData(visitorId) {
    return this.getItem(`visitor_${visitorId}`);
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {object|null} Session data
   */
  getSessionData(sessionId) {
    return this.getItem(`session_${sessionId}`);
  }

  /**
   * Store offline action for later sync
   * @param {object} action - Action to store
   */
  queueOfflineAction(action) {
    const queue = this.getItem('offline_queue', []);
    queue.push({
      ...action,
      timestamp: Date.now(),
      id: this.generateId(),
    });
    this.setItem('offline_queue', queue);
  }

  /**
   * Get offline actions queue
   * @returns {Array} Offline actions
   */
  getOfflineQueue() {
    return this.getItem('offline_queue', []);
  }

  /**
   * Clear offline actions queue
   */
  clearOfflineQueue() {
    this.removeItem('offline_queue');
  }

  /**
   * Process offline queue (to be called when online)
   * @param {Function} processAction - Function to process each action
   * @returns {Promise<Array>} Processed actions
   */
  async processOfflineQueue(processAction) {
    const queue = this.getOfflineQueue();
    const processed = [];
    const failed = [];

    for (const action of queue) {
      try {
        await processAction(action);
        processed.push(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        failed.push(action);
      }
    }

    // Update queue with failed actions
    this.setItem('offline_queue', failed);

    return { processed, failed };
  }

  /**
   * Store user consent
   * @param {object} consent - Consent data
   */
  setConsent(consent) {
    this.setItem(this.consentKey, consent, false); // Don't encrypt consent
  }

  /**
   * Get user consent
   * @returns {object|null} Consent data
   */
  getConsent() {
    return this.getItem(this.consentKey, null, false);
  }

  /**
   * Check if consent is valid
   * @returns {boolean} Whether consent is valid
   */
  hasValidConsent() {
    const consent = this.getConsent();
    if (!consent) return false;

    const consentAge = Date.now() - consent.timestamp;
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

    return consentAge < maxAge && consent.accepted === true;
  }

  /**
   * Update metadata for a storage key
   * @param {string} key - Storage key
   * @param {object} metadata - Metadata to store
   */
  updateMetadata(key, metadata) {
    const metadataKey = `${this.storagePrefix}meta_${key}`;
    this.setItem(metadataKey, metadata, false);
  }

  /**
   * Get metadata for a storage key
   * @param {string} key - Storage key
   * @returns {object|null} Metadata
   */
  getMetadata(key) {
    const metadataKey = `${this.storagePrefix}meta_${key}`;
    return this.getItem(metadataKey, null, false);
  }

  /**
   * Remove metadata for a storage key
   * @param {string} key - Storage key
   */
  removeMetadata(key) {
    const metadataKey = `${this.storagePrefix}meta_${key}`;
    this.removeItem(metadataKey);
  }

  /**
   * Clear all metadata
   */
  clearMetadata() {
    const keys = Object.keys(localStorage);
    const metadataKeys = keys.filter(key =>
      key.startsWith(`${this.storagePrefix}meta_`)
    );

    metadataKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Schedule cleanup for visitor data
   * @param {string} visitorId - Visitor ID
   */
  scheduleCleanup(visitorId) {
    setTimeout(() => {
      this.removeItem(`visitor_${visitorId}`);
      this.removeItem(`session_${visitorId}`);
    }, this.retentionPeriod);
  }

  /**
   * Clean up expired data
   */
  cleanupExpiredData() {
    const keys = Object.keys(localStorage);
    const visitorKeys = keys.filter(
      key =>
        key.startsWith(this.storagePrefix) &&
        !key.startsWith(`${this.storagePrefix}meta_`)
    );

    let cleanedCount = 0;
    visitorKeys.forEach(key => {
      const metadata = this.getMetadata(key.replace(this.storagePrefix, ''));
      if (metadata && Date.now() - metadata.timestamp > this.retentionPeriod) {
        this.removeItem(key.replace(this.storagePrefix, ''));
        cleanedCount++;
      }
    });

    console.log(`Cleaned up ${cleanedCount} expired entries`);
    return cleanedCount;
  }

  /**
   * Get storage statistics
   * @returns {object} Storage statistics
   */
  getStorageStats() {
    const keys = Object.keys(localStorage);
    const visitorKeys = keys.filter(key => key.startsWith(this.storagePrefix));
    const metadataKeys = keys.filter(key =>
      key.startsWith(`${this.storagePrefix}meta_`)
    );

    let totalSize = 0;
    let visitorCount = 0;
    let sessionCount = 0;

    visitorKeys.forEach(key => {
      const value = localStorage.getItem(key);
      totalSize += value ? value.length : 0;

      if (key.includes('visitor_')) visitorCount++;
      if (key.includes('session_')) sessionCount++;
    });

    return {
      totalKeys: visitorKeys.length,
      metadataKeys: metadataKeys.length,
      totalSize,
      visitorCount,
      sessionCount,
      retentionPeriod: this.retentionPeriod,
    };
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check if storage is available
   * @returns {boolean} Whether storage is available
   */
  isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage quota information
   * @returns {Promise<object>} Storage quota info
   */
  async getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        usagePercentage: (estimate.usage / estimate.quota) * 100,
      };
    }
    return null;
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;


