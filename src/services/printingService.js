import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

/**
 * Printing Service
 * Badge printing with queue management and template system
 */
class PrintingService {
  constructor() {
    this.isAvailable = false;
    this.isPrinting = false;
    this.printQueue = [];
    this.currentJob = null;
    this.settings = {
      paperSize: 'A4',
      orientation: 'portrait',
      quality: 'high',
      copies: 1,
      color: true,
      duplex: false,
    };
    this.templates = {
      default: {
        width: 210, // mm
        height: 297, // mm
        badgeWidth: 85, // mm
        badgeHeight: 54, // mm
        qrSize: 40, // mm
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
      },
      compact: {
        width: 210,
        height: 297,
        badgeWidth: 70,
        badgeHeight: 45,
        qrSize: 30,
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
      },
      large: {
        width: 210,
        height: 297,
        badgeWidth: 100,
        badgeHeight: 65,
        qrSize: 50,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
      },
    };
    this.callbacks = {
      onStatusChange: null,
      onJobComplete: null,
      onError: null,
    };
  }

  /**
   * Initialize printing service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Check for print support
      this.isAvailable = this.checkPrintSupport();

      if (!this.isAvailable) {
        throw new Error('Printing not supported in this browser');
      }

      // Load saved settings
      this.loadSettings();

      return true;
    } catch (error) {
      this.handleError('Printing initialization failed', error);
      return false;
    }
  }

  /**
   * Check if printing is supported
   * @returns {boolean} Support status
   */
  checkPrintSupport() {
    return (
      typeof window !== 'undefined' &&
      window.print !== undefined &&
      document.querySelector !== undefined
    );
  }

  /**
   * Generate visitor badge
   * @param {object} visitorData - Visitor data
   * @param {string} template - Template name
   * @returns {Promise<HTMLElement>} Badge element
   */
  async generateBadge(visitorData, template = 'default') {
    try {
      const templateConfig = this.templates[template] || this.templates.default;

      // Generate QR code
      const qrCodeDataURL = await this.generateQRCode(visitorData);

      // Create badge element
      const badge = document.createElement('div');
      badge.className = 'visitor-badge';
      badge.style.cssText = `
        width: ${templateConfig.badgeWidth}mm;
        height: ${templateConfig.badgeHeight}mm;
        border: 2px solid #000;
        padding: 5mm;
        font-family: ${templateConfig.fontFamily};
        font-size: ${templateConfig.fontSize}px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: white;
        box-sizing: border-box;
        page-break-inside: avoid;
        margin: 2mm;
      `;

      // Badge content
      badge.innerHTML = `
        <div class="badge-header" style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 2mm;">
          <div style="font-weight: bold; font-size: ${templateConfig.fontSize + 2}px;">VISITOR BADGE</div>
          <div style="font-size: ${templateConfig.fontSize - 2}px;">${visitorData.company || 'Guest'}</div>
        </div>
        
        <div class="badge-content" style="flex: 1; display: flex; justify-content: space-between;">
          <div class="visitor-info" style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 1mm;">Name:</div>
            <div style="margin-bottom: 2mm;">${visitorData.name}</div>
            
            <div style="font-weight: bold; margin-bottom: 1mm;">Date:</div>
            <div style="margin-bottom: 2mm;">${visitorData.visitDate}</div>
            
            <div style="font-weight: bold; margin-bottom: 1mm;">Time:</div>
            <div style="margin-bottom: 2mm;">${visitorData.visitTime}</div>
            
            <div style="font-weight: bold; margin-bottom: 1mm;">Host:</div>
            <div>${visitorData.hostName}</div>
          </div>
          
          <div class="qr-code" style="margin-left: 2mm;">
            <img src="${qrCodeDataURL}" 
                 style="width: ${templateConfig.qrSize}mm; height: ${templateConfig.qrSize}mm;"
                 alt="QR Code" />
          </div>
        </div>
        
        <div class="badge-footer" style="text-align: center; border-top: 1px solid #000; padding-top: 2mm; margin-top: 2mm; font-size: ${templateConfig.fontSize - 2}px;">
          <div>Please wear this badge at all times</div>
          <div>Valid until: ${this.calculateExpiryTime(visitorData.visitTime)}</div>
        </div>
      `;

      return badge;
    } catch (error) {
      this.handleError('Badge generation failed', error);
      throw error;
    }
  }

  /**
   * Generate QR code for visitor
   * @param {object} visitorData - Visitor data
   * @returns {Promise<string>} QR code data URL
   */
  async generateQRCode(visitorData) {
    try {
      const qrData = {
        id: visitorData.id,
        name: visitorData.name,
        company: visitorData.company,
        visitDate: visitorData.visitDate,
        visitTime: visitorData.visitTime,
        hostName: visitorData.hostName,
        timestamp: Date.now(),
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataURL;
    } catch (error) {
      this.handleError('QR code generation failed', error);
      throw error;
    }
  }

  /**
   * Add print job to queue
   * @param {object} jobData - Print job data
   * @returns {string} Job ID
   */
  addToQueue(jobData) {
    const job = {
      id: this.generateJobId(),
      data: jobData,
      status: 'queued',
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: 3,
    };

    this.printQueue.push(job);
    this.notifyStatusChange();

    // Start processing if not already printing
    if (!this.isPrinting) {
      this.processQueue();
    }

    return job.id;
  }

  /**
   * Process print queue
   * @returns {Promise<void>}
   */
  async processQueue() {
    if (this.isPrinting || this.printQueue.length === 0) {
      return;
    }

    this.isPrinting = true;
    this.notifyStatusChange();

    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift();
      this.currentJob = job;

      try {
        await this.printJob(job);
        job.status = 'completed';
        this.notifyJobComplete(job);
      } catch (error) {
        job.attempts++;
        job.status = 'failed';

        if (job.attempts < job.maxAttempts) {
          // Retry job
          job.status = 'queued';
          this.printQueue.unshift(job);
        } else {
          this.handleError(
            `Print job ${job.id} failed after ${job.maxAttempts} attempts`,
            error
          );
        }
      }
    }

    this.isPrinting = false;
    this.currentJob = null;
    this.notifyStatusChange();
  }

  /**
   * Print a single job
   * @param {object} job - Print job
   * @returns {Promise<void>}
   */
  async printJob(job) {
    try {
      // Generate badge
      const badge = await this.generateBadge(
        job.data.visitorData,
        job.data.template
      );

      // Create print container
      const printContainer = this.createPrintContainer(badge, job.data);

      // Add to DOM temporarily
      document.body.appendChild(printContainer);

      // Print
      await this.printElement(printContainer);

      // Cleanup
      document.body.removeChild(printContainer);
    } catch (error) {
      throw new Error(`Print job failed: ${error.message}`);
    }
  }

  /**
   * Create print container
   * @param {HTMLElement} badge - Badge element
   * @param {object} jobData - Job data
   * @returns {HTMLElement} Print container
   */
  createPrintContainer(badge, jobData) {
    const container = document.createElement('div');
    container.className = 'print-container';
    container.style.cssText = `
      position: fixed;
      top: -10000px;
      left: -10000px;
      width: 210mm;
      min-height: 297mm;
      background: white;
      padding: 10mm;
      box-sizing: border-box;
    `;

    // Add multiple copies if requested
    for (let i = 0; i < (jobData.copies || 1); i++) {
      const badgeCopy = badge.cloneNode(true);
      container.appendChild(badgeCopy);
    }

    return container;
  }

  /**
   * Print element using browser print API
   * @param {HTMLElement} element - Element to print
   * @returns {Promise<void>}
   */
  async printElement(element) {
    return new Promise((resolve, reject) => {
      // Create new window for printing
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        reject(new Error('Unable to open print window'));
        return;
      }

      // Write content to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Visitor Badge</title>
          <style>
            @page {
              size: ${this.settings.paperSize} ${this.settings.orientation};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .print-container {
              width: 100%;
              height: 100%;
            }
            .visitor-badge {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        // Close window after printing
        printWindow.onafterprint = () => {
          printWindow.close();
          resolve();
        };
      };

      // Handle errors
      printWindow.onerror = error => {
        printWindow.close();
        reject(error);
      };
    });
  }

  /**
   * Print badge immediately (bypass queue)
   * @param {object} visitorData - Visitor data
   * @param {object} options - Print options
   * @returns {Promise<string>} Job ID
   */
  async printBadge(visitorData, options = {}) {
    const jobData = {
      visitorData,
      template: options.template || 'default',
      copies: options.copies || 1,
    };

    if (options.immediate) {
      // Print immediately
      const job = {
        id: this.generateJobId(),
        data: jobData,
        status: 'printing',
        createdAt: Date.now(),
        attempts: 0,
        maxAttempts: 1,
      };

      try {
        await this.printJob(job);
        job.status = 'completed';
        this.notifyJobComplete(job);
        return job.id;
      } catch (error) {
        job.status = 'failed';
        this.handleError('Immediate print failed', error);
        throw error;
      }
    } else {
      // Add to queue
      return this.addToQueue(jobData);
    }
  }

  /**
   * Get print queue status
   * @returns {object} Queue status
   */
  getQueueStatus() {
    return {
      isPrinting: this.isPrinting,
      queueLength: this.printQueue.length,
      currentJob: this.currentJob,
      isAvailable: this.isAvailable,
    };
  }

  /**
   * Clear print queue
   */
  clearQueue() {
    this.printQueue = [];
    this.notifyStatusChange();
  }

  /**
   * Cancel specific job
   * @param {string} jobId - Job ID to cancel
   * @returns {boolean} Success status
   */
  cancelJob(jobId) {
    const jobIndex = this.printQueue.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      this.printQueue.splice(jobIndex, 1);
      this.notifyStatusChange();
      return true;
    }
    return false;
  }

  /**
   * Calculate expiry time for badge
   * @param {string} visitTime - Visit time
   * @returns {string} Expiry time
   */
  calculateExpiryTime(visitTime) {
    const [hours, minutes] = visitTime.split(':').map(Number);
    const visitDateTime = new Date();
    visitDateTime.setHours(hours, minutes, 0, 0);

    // Add 8 hours for badge validity
    const expiryDateTime = new Date(
      visitDateTime.getTime() + 8 * 60 * 60 * 1000
    );

    return expiryDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Generate unique job ID
   * @returns {string} Job ID
   */
  generateJobId() {
    return `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('kiosk_print_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load print settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        'kiosk_print_settings',
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.warn('Failed to save print settings:', error);
    }
  }

  /**
   * Update settings
   * @param {object} newSettings - New settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Set callback for status changes
   * @param {Function} callback - Callback function
   */
  onStatusChange(callback) {
    this.callbacks.onStatusChange = callback;
  }

  /**
   * Set callback for job completion
   * @param {Function} callback - Callback function
   */
  onJobComplete(callback) {
    this.callbacks.onJobComplete = callback;
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }

  /**
   * Notify status change
   */
  notifyStatusChange() {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(this.getQueueStatus());
    }
  }

  /**
   * Notify job completion
   * @param {object} job - Completed job
   */
  notifyJobComplete(job) {
    if (this.callbacks.onJobComplete) {
      this.callbacks.onJobComplete(job);
    }
  }

  /**
   * Handle errors
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  handleError(message, error) {
    console.error(`[PrintingService] ${message}:`, error);

    if (this.callbacks.onError) {
      this.callbacks.onError(message, error);
    }
  }

  /**
   * Test printing functionality
   * @returns {Promise<object>} Test results
   */
  async testPrinting() {
    const results = {
      supported: this.checkPrintSupport(),
      available: this.isAvailable,
      queueLength: this.printQueue.length,
      isPrinting: this.isPrinting,
    };

    if (results.supported) {
      try {
        // Test with sample data
        const testData = {
          id: 'test_123',
          name: 'Test Visitor',
          company: 'Test Company',
          visitDate: new Date().toLocaleDateString(),
          visitTime: new Date().toLocaleTimeString(),
          hostName: 'Test Host',
        };

        const jobId = await this.printBadge(testData, { immediate: true });
        results.testPrint = true;
        results.testJobId = jobId;
      } catch (error) {
        results.testPrint = false;
        results.testError = error.message;
      }
    }

    return results;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.clearQueue();
    this.isPrinting = false;
    this.currentJob = null;
  }
}

// Create singleton instance
const printingService = new PrintingService();

export default printingService;


