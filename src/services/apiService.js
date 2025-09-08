import storageService from './storageService';

/**
 * API Service
 * HTTP client with retry logic, error handling, and offline support
 */
class APIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.retryMultiplier = 2;
    this.isOnline = navigator.onLine;

    // Setup online/offline listeners
    this.setupNetworkListeners();
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      timeout = this.timeout,
      retries = this.maxRetries,
      skipRetry = false,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        // Log successful request
        this.logRequest('success', { method, endpoint, attempt: attempt + 1 });

        return responseData;
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (skipRetry || this.shouldNotRetry(error)) {
          break;
        }

        // If offline, queue the request
        if (!this.isOnline) {
          this.queueOfflineRequest({ method, endpoint, data, headers });
          throw new Error('Request queued for offline processing');
        }

        // Wait before retry
        if (attempt < retries) {
          const delay =
            this.retryDelay * Math.pow(this.retryMultiplier, attempt);
          await this.sleep(delay);
        }
      }
    }

    // Log failed request
    this.logRequest('error', { method, endpoint, error: lastError.message });
    throw lastError;
  }

  /**
   * Check if error should not be retried
   * @param {Error} error - Error to check
   * @returns {boolean} Whether to skip retry
   */
  shouldNotRetry(error) {
    // Don't retry on client errors (4xx) except 408, 429
    if (error.message.includes('HTTP 4')) {
      const status = parseInt(error.message.match(/HTTP (\d+)/)?.[1]);
      return status !== 408 && status !== 429;
    }

    // Don't retry on abort errors
    return error.name === 'AbortError';
  }

  /**
   * Queue request for offline processing
   * @param {object} requestData - Request data to queue
   */
  queueOfflineRequest(requestData) {
    storageService.queueOfflineAction({
      type: 'api_request',
      ...requestData,
      timestamp: Date.now(),
    });
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue() {
    if (!this.isOnline) return;

    try {
      const { processed, failed } = await storageService.processOfflineQueue(
        async action => {
          if (action.type === 'api_request') {
            await this.request(action.endpoint, {
              method: action.method,
              data: action.data,
              headers: action.headers,
              skipRetry: true,
            });
          }
        }
      );

      console.log(
        `Processed ${processed.length} offline requests, ${failed.length} failed`
      );
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }

  /**
   * Log request for debugging
   * @param {string} status - Request status
   * @param {object} data - Request data
   */
  logRequest(status, data) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API ${status.toUpperCase()}]`, data);
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Visitor CRUD Operations

  /**
   * Create new visitor
   * @param {object} visitorData - Visitor data
   * @returns {Promise<object>} Created visitor
   */
  async createVisitor(visitorData) {
    try {
      const response = await this.request('/visitors', {
        method: 'POST',
        data: visitorData,
      });

      // Store locally for offline access
      storageService.storeVisitorData(response.id, response);

      return response;
    } catch (error) {
      // If offline, store locally and queue for sync
      if (!this.isOnline) {
        const localId = storageService.generateId();
        const localVisitor = { ...visitorData, id: localId, synced: false };
        storageService.storeVisitorData(localId, localVisitor);
        return localVisitor;
      }
      throw error;
    }
  }

  /**
   * Get visitor by ID
   * @param {string} visitorId - Visitor ID
   * @returns {Promise<object>} Visitor data
   */
  async getVisitor(visitorId) {
    try {
      const response = await this.request(`/visitors/${visitorId}`);
      return response;
    } catch (error) {
      // Fallback to local storage
      const localData = storageService.getVisitorData(visitorId);
      if (localData) {
        return localData;
      }
      throw error;
    }
  }

  /**
   * Update visitor
   * @param {string} visitorId - Visitor ID
   * @param {object} visitorData - Updated visitor data
   * @returns {Promise<object>} Updated visitor
   */
  async updateVisitor(visitorId, visitorData) {
    try {
      const response = await this.request(`/visitors/${visitorId}`, {
        method: 'PUT',
        data: visitorData,
      });

      // Update local storage
      storageService.storeVisitorData(visitorId, response);

      return response;
    } catch (error) {
      // If offline, update locally and queue for sync
      if (!this.isOnline) {
        const localData = storageService.getVisitorData(visitorId);
        if (localData) {
          const updatedData = { ...localData, ...visitorData, synced: false };
          storageService.storeVisitorData(visitorId, updatedData);
          return updatedData;
        }
      }
      throw error;
    }
  }

  /**
   * Delete visitor
   * @param {string} visitorId - Visitor ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVisitor(visitorId) {
    try {
      await this.request(`/visitors/${visitorId}`, {
        method: 'DELETE',
      });

      // Remove from local storage
      storageService.removeItem(`visitor_${visitorId}`);

      return true;
    } catch (error) {
      // If offline, mark for deletion
      if (!this.isOnline) {
        const localData = storageService.getVisitorData(visitorId);
        if (localData) {
          const updatedData = { ...localData, deleted: true, synced: false };
          storageService.storeVisitorData(visitorId, updatedData);
          return true;
        }
      }
      throw error;
    }
  }

  /**
   * Get all visitors
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} List of visitors
   */
  async getVisitors(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/visitors?${queryParams}` : '/visitors';

      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      // Fallback to local storage
      const localData = this.getLocalVisitors(filters);
      return localData;
    }
  }

  /**
   * Get visitors from local storage
   * @param {object} filters - Filter options
   * @returns {Array} Local visitors
   */
  getLocalVisitors(filters = {}) {
    const keys = Object.keys(localStorage);
    const visitorKeys = keys.filter(key =>
      key.startsWith('kiosk_visitor_visitor_')
    );

    const visitors = visitorKeys
      .map(key => {
        const visitorId = key.replace('kiosk_visitor_visitor_', '');
        return storageService.getVisitorData(visitorId);
      })
      .filter(Boolean);

    // Apply filters
    return this.applyFilters(visitors, filters);
  }

  /**
   * Apply filters to visitor list
   * @param {Array} visitors - Visitor list
   * @param {object} filters - Filter options
   * @returns {Array} Filtered visitors
   */
  applyFilters(visitors, filters) {
    return visitors.filter(visitor => {
      if (filters.date && visitor.visitDate !== filters.date) return false;
      if (filters.status && visitor.status !== filters.status) return false;
      if (filters.host && visitor.hostName !== filters.host) return false;
      return true;
    });
  }

  // Host Notification System

  /**
   * Notify host about visitor
   * @param {object} visitorData - Visitor data
   * @returns {Promise<boolean>} Success status
   */
  async notifyHost(visitorData) {
    try {
      await this.request('/notifications/host', {
        method: 'POST',
        data: {
          visitorId: visitorData.id,
          visitorName: visitorData.name,
          hostEmail: visitorData.hostEmail,
          visitTime: visitorData.visitTime,
          message: `Visitor ${visitorData.name} has arrived for their appointment.`,
        },
      });

      return true;
    } catch (error) {
      console.error('Host notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message content
   * @returns {Promise<boolean>} Success status
   */
  async sendSMS(phoneNumber, message) {
    try {
      await this.request('/notifications/sms', {
        method: 'POST',
        data: { phoneNumber, message },
      });

      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  // System Health Reporting

  /**
   * Report system health
   * @param {object} healthData - Health data
   * @returns {Promise<boolean>} Success status
   */
  async reportSystemHealth(healthData) {
    try {
      await this.request('/system/health', {
        method: 'POST',
        data: {
          ...healthData,
          timestamp: new Date().toISOString(),
          kioskId: process.env.VITE_KIOSK_ID || 'unknown',
        },
      });

      return true;
    } catch (error) {
      console.error('Health report failed:', error);
      return false;
    }
  }

  /**
   * Get system configuration
   * @returns {Promise<object>} System configuration
   */
  async getSystemConfig() {
    try {
      const response = await this.request('/system/config');
      return response;
    } catch (error) {
      // Return default config if API fails
      return {
        kioskId: process.env.VITE_KIOSK_ID || 'unknown',
        location: 'Main Lobby',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        autoLogout: 30,
        badgeTemplate: 'default',
      };
    }
  }

  // Analytics and Reporting

  /**
   * Send analytics data
   * @param {object} analyticsData - Analytics data
   * @returns {Promise<boolean>} Success status
   */
  async sendAnalytics(analyticsData) {
    try {
      await this.request('/analytics', {
        method: 'POST',
        data: {
          ...analyticsData,
          timestamp: new Date().toISOString(),
          kioskId: process.env.VITE_KIOSK_ID || 'unknown',
        },
      });

      return true;
    } catch (error) {
      console.error('Analytics send failed:', error);
      return false;
    }
  }

  /**
   * Get visitor statistics
   * @param {object} dateRange - Date range for statistics
   * @returns {Promise<object>} Visitor statistics
   */
  async getVisitorStats(dateRange = {}) {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const endpoint = queryParams
        ? `/analytics/visitors?${queryParams}`
        : '/analytics/visitors';

      const response = await this.request(endpoint);
      return response;
    } catch (error) {
      // Return local statistics
      return this.getLocalVisitorStats(dateRange);
    }
  }

  /**
   * Get local visitor statistics
   * @param {object} dateRange - Date range for statistics
   * @returns {object} Local visitor statistics
   */
  getLocalVisitorStats(dateRange = {}) {
    const visitors = this.getLocalVisitors();
    const now = new Date();
    const startDate = dateRange.start
      ? new Date(dateRange.start)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endDate = dateRange.end ? new Date(dateRange.end) : now;

    const filteredVisitors = visitors.filter(visitor => {
      const visitDate = new Date(visitor.visitDate);
      return visitDate >= startDate && visitDate <= endDate;
    });

    return {
      totalVisitors: filteredVisitors.length,
      checkedIn: filteredVisitors.filter(v => v.status === 'checked_in').length,
      checkedOut: filteredVisitors.filter(v => v.status === 'checked_out')
        .length,
      averageVisitDuration:
        this.calculateAverageVisitDuration(filteredVisitors),
      topHosts: this.getTopHosts(filteredVisitors),
    };
  }

  /**
   * Calculate average visit duration
   * @param {Array} visitors - Visitor list
   * @returns {number} Average duration in minutes
   */
  calculateAverageVisitDuration(visitors) {
    const completedVisits = visitors.filter(
      v => v.checkInTime && v.checkOutTime
    );
    if (completedVisits.length === 0) return 0;

    const totalDuration = completedVisits.reduce((sum, visitor) => {
      const checkIn = new Date(visitor.checkInTime);
      const checkOut = new Date(visitor.checkOutTime);
      return sum + (checkOut - checkIn);
    }, 0);

    return Math.round(totalDuration / completedVisits.length / (1000 * 60)); // Convert to minutes
  }

  /**
   * Get top hosts by visitor count
   * @param {Array} visitors - Visitor list
   * @returns {Array} Top hosts
   */
  getTopHosts(visitors) {
    const hostCounts = visitors.reduce((counts, visitor) => {
      const host = visitor.hostName;
      counts[host] = (counts[host] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(hostCounts)
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Utility Methods

  /**
   * Check if API is available
   * @returns {Promise<boolean>} API availability
   */
  async checkAPIHealth() {
    try {
      await this.request('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get network status
   * @returns {object} Network status
   */
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      lastCheck: Date.now(),
    };
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;
