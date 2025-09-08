import { useState, useCallback, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import documentDetectionService from '../services/documentDetectionService';
import ocrService from '../services/ocrService';
import cameraService from '../services/cameraService';
import {
  ocrProcessingAtom,
  ocrResultsAtom,
  ocrErrorAtom,
  ocrConfidenceAtom,
  documentTypeAtom,
  extractedFieldsAtom,
} from '../stores/atoms/visitorAtoms';

/**
 * useAutoScan Hook
 * Manages automatic document scanning with real-time positioning guidance
 */
export const useAutoScan = () => {
  // State atoms
  const setProcessing = useSetAtom(ocrProcessingAtom);
  const setResults = useSetAtom(ocrResultsAtom);
  const setError = useSetAtom(ocrErrorAtom);
  const setConfidence = useSetAtom(ocrConfidenceAtom);
  const setDocumentType = useSetAtom(documentTypeAtom);
  const setExtractedFields = useSetAtom(extractedFieldsAtom);
  
  // Atom values
  const results = useAtomValue(ocrResultsAtom);
  const error = useAtomValue(ocrErrorAtom);
  const confidence = useAtomValue(ocrConfidenceAtom);
  const documentType = useAtomValue(documentTypeAtom);
  const extractedFields = useAtomValue(extractedFieldsAtom);

  // Local state
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [documentStatus, setDocumentStatus] = useState({
    detected: false,
    positioned: false,
    quality: 0,
    position: { x: 0, y: 0, width: 0, height: 0 },
    instructions: 'Position your ID document in front of the camera',
    canScan: false,
  });
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [timeoutCallback, setTimeoutCallback] = useState(null);

  // Refs
  const videoElementRef = useRef(null);
  const scanCooldownRef = useRef(null);
  const analysisTimeoutRef = useRef(null);
  const autoEntryTimeoutRef = useRef(null);

  // Settings
  const settings = {
    scanCooldown: 2000, // Minimum time between scans (ms)
    qualityThreshold: 0.7, // Minimum quality for auto-scan
    maxScanAttempts: 3, // Maximum consecutive scan attempts
    analysisInterval: 100, // Frame analysis interval (ms)
    autoEntryTimeout: 60000, // Auto-entry timeout (60 seconds)
  };

  /**
   * Initialize auto-scan functionality
   */
  const initialize = useCallback(async () => {
    try {
      const success = await documentDetectionService.initialize();
      if (!success) {
        throw new Error('Failed to initialize document detection service');
      }

      // Set up callbacks
      documentDetectionService.onDocumentDetected(handleDocumentDetected);
      documentDetectionService.onDocumentPositioned(handleDocumentPositioned);
      documentDetectionService.onDocumentQualityChanged(handleDocumentQualityChanged);
      documentDetectionService.onAnalysisComplete(handleAnalysisComplete);

      return true;
    } catch (error) {
      console.error('Auto-scan initialization failed:', error);
      setError(error.message);
      return false;
    }
  }, [setError]);

  /**
   * Start auto-scanning
   * @param {HTMLVideoElement} videoElement - Video element to analyze
   * @param {Function} onTimeout - Callback when timeout occurs
   */
  const startAutoScan = useCallback((videoElement, onTimeout = null) => {
    if (!videoElement) {
      console.error('Video element required for auto-scan');
      return false;
    }

    videoElementRef.current = videoElement;
    setIsAutoScanning(true);
    setScanAttempts(0);
    setTimeoutCallback(() => onTimeout);
    setDocumentStatus(prev => ({
      ...prev,
      instructions: 'Position your ID document in front of the camera',
      canScan: false,
    }));

    // Start document analysis
    documentDetectionService.startAnalysis(videoElement, {
      analysisInterval: settings.analysisInterval,
      qualityThreshold: settings.qualityThreshold,
    });

    // Set up auto-entry timeout
    autoEntryTimeoutRef.current = setTimeout(() => {
      console.log('Auto-scan timeout reached, defaulting to manual entry');
      if (onTimeout) {
        onTimeout();
      }
    }, settings.autoEntryTimeout);

    console.log('Auto-scan started with 60-second timeout');
    return true;
  }, [settings.analysisInterval, settings.qualityThreshold, settings.autoEntryTimeout]);

  /**
   * Stop auto-scanning
   */
  const stopAutoScan = useCallback(() => {
    setIsAutoScanning(false);
    setIsScanning(false);
    documentDetectionService.stopAnalysis();
    
    // Clear timeouts
    if (scanCooldownRef.current) {
      clearTimeout(scanCooldownRef.current);
      scanCooldownRef.current = null;
    }
    
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }

    if (autoEntryTimeoutRef.current) {
      clearTimeout(autoEntryTimeoutRef.current);
      autoEntryTimeoutRef.current = null;
    }

    setDocumentStatus(prev => ({
      ...prev,
      instructions: 'Auto-scan stopped',
      canScan: false,
    }));

    console.log('Auto-scan stopped');
  }, []);

  /**
   * Handle document detected
   * @param {object} analysis - Analysis results
   */
  const handleDocumentDetected = useCallback((analysis) => {
    setDocumentStatus(prev => ({
      ...prev,
      detected: true,
      position: analysis.position,
      instructions: 'Document detected! Adjust position for better quality',
    }));
  }, []);

  /**
   * Handle document positioned
   * @param {object} analysis - Analysis results
   */
  const handleDocumentPositioned = useCallback((analysis) => {
    setDocumentStatus(prev => ({
      ...prev,
      positioned: true,
      quality: analysis.quality,
      instructions: 'Perfect! Document is well positioned. Scanning...',
      canScan: true,
    }));

    // Trigger auto-scan if conditions are met
    if (canTriggerScan()) {
      triggerAutoScan();
    }
  }, []);

  /**
   * Handle document quality changed
   * @param {object} analysis - Analysis results
   */
  const handleDocumentQualityChanged = useCallback((analysis) => {
    setDocumentStatus(prev => ({
      ...prev,
      quality: analysis.quality,
      positioned: analysis.isPositioned,
      position: analysis.position,
    }));

    // Update instructions based on quality
    let instructions = 'Position your ID document in front of the camera';
    
    if (analysis.hasDocument) {
      if (analysis.isPositioned) {
        if (analysis.quality >= settings.qualityThreshold) {
          instructions = 'Perfect! Document is ready for scanning';
        } else {
          instructions = 'Document detected but quality is low. Hold steady and ensure good lighting';
        }
      } else {
        instructions = 'Document detected! Center it in the frame';
      }
    }

    setDocumentStatus(prev => ({
      ...prev,
      instructions,
      canScan: analysis.isPositioned && analysis.quality >= settings.qualityThreshold,
    }));
  }, [settings.qualityThreshold]);

  /**
   * Handle analysis complete
   * @param {object} analysis - Analysis results
   */
  const handleAnalysisComplete = useCallback((analysis) => {
    // Update document status
    setDocumentStatus(prev => ({
      ...prev,
      detected: analysis.hasDocument,
      positioned: analysis.isPositioned,
      quality: analysis.quality,
      position: analysis.position,
    }));

    // Check if we should trigger auto-scan
    if (analysis.hasDocument && analysis.isPositioned && analysis.quality >= settings.qualityThreshold) {
      if (canTriggerScan()) {
        // Add a small delay to ensure stable positioning
        analysisTimeoutRef.current = setTimeout(() => {
          triggerAutoScan();
        }, 500);
      }
    }
  }, [settings.qualityThreshold]);

  /**
   * Check if auto-scan can be triggered
   * @returns {boolean} Can trigger scan
   */
  const canTriggerScan = useCallback(() => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime;
    
    return (
      isAutoScanning &&
      !isScanning &&
      timeSinceLastScan >= settings.scanCooldown &&
      scanAttempts < settings.maxScanAttempts
    );
  }, [isAutoScanning, isScanning, lastScanTime, settings.scanCooldown, settings.maxScanAttempts, scanAttempts]);

  /**
   * Trigger automatic scan
   */
  const triggerAutoScan = useCallback(async () => {
    if (!videoElementRef.current || isScanning) {
      return;
    }

    try {
      setIsScanning(true);
      setScanAttempts(prev => prev + 1);
      setLastScanTime(Date.now());

      // Capture image from video
      const imageBlob = await cameraService.captureImage();
      if (!imageBlob) {
        throw new Error('Failed to capture image');
      }

      // Process with OCR
      setProcessing(true);
      setProcessing(prev => ({ ...prev, error: null }));

      const ocrResults = await ocrService.processImage(imageBlob);

      if (ocrResults && ocrResults.confidence > 0.7) {
        // Successful scan
        setResults(ocrResults);
        setConfidence(ocrResults.confidence);
        setDocumentType(ocrResults.documentType);
        setExtractedFields(ocrResults.fields);
        
        setDocumentStatus(prev => ({
          ...prev,
          instructions: `Document scanned successfully! Confidence: ${Math.round(ocrResults.confidence * 100)}%`,
        }));

        // Clear timeout and stop auto-scanning after successful scan
        if (autoEntryTimeoutRef.current) {
          clearTimeout(autoEntryTimeoutRef.current);
          autoEntryTimeoutRef.current = null;
        }
        stopAutoScan();
        
        return ocrResults;
      } else {
        // Low confidence - continue scanning
        const confidence = ocrResults ? Math.round(ocrResults.confidence * 100) : 0;
        setDocumentStatus(prev => ({
          ...prev,
          instructions: `Scan quality low (${confidence}%). Please hold document steady and ensure good lighting`,
        }));

        // Reset scan cooldown for retry
        setLastScanTime(0);
      }
    } catch (error) {
      console.error('Auto-scan failed:', error);
      setError(error.message);
      setDocumentStatus(prev => ({
        ...prev,
        instructions: 'Scan failed. Please try again',
      }));
    } finally {
      setIsScanning(false);
      setProcessing(false);
    }
  }, [isScanning, setProcessing, setResults, setConfidence, setDocumentType, setExtractedFields, setError, stopAutoScan]);

  /**
   * Manually trigger scan (fallback)
   */
  const manualScan = useCallback(async () => {
    if (!videoElementRef.current) {
      return null;
    }

    try {
      setIsScanning(true);
      setProcessing(true);
      setProcessing(prev => ({ ...prev, error: null }));

      const imageBlob = await cameraService.captureImage();
      if (!imageBlob) {
        throw new Error('Failed to capture image');
      }

      const ocrResults = await ocrService.processImage(imageBlob);
      
      if (ocrResults) {
        setResults(ocrResults);
        setConfidence(ocrResults.confidence);
        setDocumentType(ocrResults.documentType);
        setExtractedFields(ocrResults.fields);
      }

      return ocrResults;
    } catch (error) {
      console.error('Manual scan failed:', error);
      setError(error.message);
      return null;
    } finally {
      setIsScanning(false);
      setProcessing(false);
    }
  }, [setProcessing, setResults, setConfidence, setDocumentType, setExtractedFields, setError]);

  /**
   * Reset auto-scan state
   */
  const reset = useCallback(() => {
    stopAutoScan();
    setScanAttempts(0);
    setLastScanTime(0);
    setTimeoutCallback(null);
    setDocumentStatus({
      detected: false,
      positioned: false,
      quality: 0,
      position: { x: 0, y: 0, width: 0, height: 0 },
      instructions: 'Position your ID document in front of the camera',
      canScan: false,
    });
  }, [stopAutoScan]);

  /**
   * Update auto-scan settings
   * @param {object} newSettings - New settings
   */
  const updateSettings = useCallback((newSettings) => {
    Object.assign(settings, newSettings);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScan();
      documentDetectionService.cleanup();
    };
  }, [stopAutoScan]);

  return {
    // State
    isAutoScanning,
    documentStatus,
    scanAttempts,
    isScanning,
    settings,

    // Actions
    initialize,
    startAutoScan,
    stopAutoScan,
    manualScan,
    reset,
    updateSettings,

    // Status
    canScan: documentStatus.canScan,
    hasDocument: documentStatus.detected,
    isPositioned: documentStatus.positioned,
    quality: documentStatus.quality,
    instructions: documentStatus.instructions,
  };
};

export default useAutoScan;
