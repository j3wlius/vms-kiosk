import React, { createContext, useContext } from 'react';
import {
  currentVisitorAtom,
  formDataAtom,
  visitorSessionAtom,
  visitorHistoryAtom,
  formValidationAtom,
  ocrProcessingAtom,
  ocrResultsAtom,
  visitorBadgeDataAtom,
  currentFormStepAtom,
  formStepsAtom,
  canProceedAtom,
  resetFormAtom,
} from '../atoms/visitorAtoms';

// Create context for visitor-related state
const VisitorContext = createContext();

// Visitor Provider Component - just provides context, no separate store
export const VisitorProvider = ({ children }) => {
  return (
    <VisitorContext.Provider value={null}>
      {children}
    </VisitorContext.Provider>
  );
};

// Hook to use visitor context (simplified)
export const useVisitor = () => {
  const context = useContext(VisitorContext);
  return context;
};

// Individual hooks for specific visitor state - return atoms directly
export const useCurrentVisitor = () => {
  return currentVisitorAtom;
};

export const useFormData = () => {
  return formDataAtom;
};

export const useVisitorSession = () => {
  return visitorSessionAtom;
};

export const useFormValidation = () => {
  return formValidationAtom;
};

export const useFormSteps = () => {
  return { 
    currentStep: currentFormStepAtom, 
    steps: formStepsAtom, 
    canProceed: canProceedAtom 
  };
};

export const useOCR = () => {
  return { 
    ocrProcessing: ocrProcessingAtom, 
    ocrResults: ocrResultsAtom 
  };
};

export const useVisitorBadge = () => {
  return visitorBadgeDataAtom;
};

export const useVisitorActions = () => {
  return { resetForm: resetFormAtom };
};

export default VisitorProvider;
