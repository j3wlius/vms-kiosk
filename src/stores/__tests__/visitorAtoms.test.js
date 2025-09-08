import { renderHook, act } from '@testing-library/react';
import { Provider, useAtom } from 'jotai';
import {
  currentVisitorAtom,
  formDataAtom,
  visitorSessionAtom,
  formValidationAtom,
  ocrProcessingAtom,
  visitorBadgeDataAtom,
  canProceedAtom,
  resetFormAtom,
  currentFormStepAtom,
} from '../atoms/visitorAtoms';

// Helper function to render hooks with provider
const renderHookWithProvider = hook => {
  const wrapper = ({ children }) => <Provider>{children}</Provider>;
  return renderHook(hook, { wrapper });
};

describe('Visitor Atoms', () => {
  describe('currentVisitorAtom', () => {
    it('should initialize with null', () => {
      const { result } = renderHookWithProvider(() => {
        const [visitor] = useAtom(currentVisitorAtom);
        return visitor;
      });

      expect(result.current).toBeNull();
    });
  });

  describe('formDataAtom', () => {
    it('should initialize with empty form data structure', () => {
      const { result } = renderHookWithProvider(() => {
        const [formData] = useAtom(formDataAtom);
        return formData;
      });

      expect(result.current).toEqual({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          position: '',
        },
        visitDetails: {
          hostName: '',
          hostEmail: '',
          visitPurpose: '',
          expectedDuration: '',
          visitDate: expect.any(String),
          visitTime: expect.any(String),
        },
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
        idDocument: {
          type: '',
          number: '',
          issuingCountry: '',
          expiryDate: '',
          rawData: null,
        },
      });
    });

    it('should update form data when set', () => {
      const { result } = renderHookWithProvider(() => {
        const [formData, setFormData] = useAtom(formDataAtom);
        return { formData, setFormData };
      });

      const newFormData = {
        ...result.current.formData,
        personalInfo: {
          ...result.current.formData.personalInfo,
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      act(() => {
        result.current.setFormData(newFormData);
      });

      expect(result.current.formData.personalInfo.firstName).toBe('John');
      expect(result.current.formData.personalInfo.lastName).toBe('Doe');
    });
  });

  describe('visitorSessionAtom', () => {
    it('should initialize with inactive session', () => {
      const { result } = renderHookWithProvider(() => {
        const [session] = useAtom(visitorSessionAtom);
        return session;
      });

      expect(result.current).toEqual({
        id: null,
        startTime: null,
        endTime: null,
        status: 'inactive',
        badgePrinted: false,
        qrCode: null,
      });
    });
  });

  describe('formValidationAtom', () => {
    it('should validate empty form as invalid', () => {
      const { result } = renderHookWithProvider(() => {
        const [validation] = useAtom(formValidationAtom);
        return validation;
      });

      expect(result.current.personalInfo.isValid).toBe(false);
      expect(result.current.visitDetails.isValid).toBe(false);
      expect(result.current.emergencyContact.isValid).toBe(false);
      expect(result.current.idDocument.isValid).toBe(false);
    });

    it('should validate email format correctly', () => {
      const { result } = renderHookWithProvider(() => {
        const [formData, setFormData] = useAtom(formDataAtom);
        const [validation] = useAtom(formValidationAtom);
        return { formData, setFormData, validation };
      });

      // Test invalid email
      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          personalInfo: {
            ...result.current.formData.personalInfo,
            email: 'invalid-email',
          },
        });
      });

      expect(result.current.validation.personalInfo.errors.email).toBe(
        'Invalid email format'
      );

      // Test valid email
      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          personalInfo: {
            ...result.current.formData.personalInfo,
            email: 'test@example.com',
          },
        });
      });

      expect(result.current.validation.personalInfo.errors.email).toBe('');
    });
  });

  describe('ocrProcessingAtom', () => {
    it('should initialize with processing state false', () => {
      const { result } = renderHookWithProvider(() => {
        const [processing] = useAtom(ocrProcessingAtom);
        return processing;
      });

      expect(result.current).toEqual({
        isProcessing: false,
        progress: 0,
        results: null,
        confidence: 0,
        error: null,
      });
    });
  });

  describe('visitorBadgeDataAtom', () => {
    it('should return null when no visitor data', () => {
      const { result } = renderHookWithProvider(() => {
        const [badgeData] = useAtom(visitorBadgeDataAtom);
        return badgeData;
      });

      expect(result.current).toBeNull();
    });

    it('should generate badge data when form is filled', () => {
      const { result } = renderHookWithProvider(() => {
        const [formData, setFormData] = useAtom(formDataAtom);
        const [session, setSession] = useAtom(visitorSessionAtom);
        const [badgeData] = useAtom(visitorBadgeDataAtom);
        return { formData, setFormData, session, setSession, badgeData };
      });

      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          personalInfo: {
            ...result.current.formData.personalInfo,
            firstName: 'John',
            lastName: 'Doe',
            company: 'Acme Corp',
          },
          visitDetails: {
            ...result.current.formData.visitDetails,
            hostName: 'Jane Smith',
            visitDate: '2024-01-15',
            visitTime: '10:00',
          },
        });

        result.current.setSession({
          ...result.current.session,
          id: 'visitor_123',
          qrCode: 'qr123',
        });
      });

      expect(result.current.badgeData).toEqual({
        id: 'visitor_123',
        name: 'John Doe',
        company: 'Acme Corp',
        visitDate: '2024-01-15',
        visitTime: '10:00',
        hostName: 'Jane Smith',
        qrCode: 'qr123',
        badgePrinted: false,
        checkInTime: null,
        checkOutTime: null,
      });
    });
  });

  describe('canProceedAtom', () => {
    it('should allow proceeding from welcome step', () => {
      const { result } = renderHookWithProvider(() => {
        const [currentStep, setCurrentStep] = useAtom(currentFormStepAtom);
        const [canProceed] = useAtom(canProceedAtom);
        return { currentStep, setCurrentStep, canProceed };
      });

      act(() => {
        result.current.setCurrentStep(0); // Welcome step
      });

      expect(result.current.canProceed).toBe(true);
    });

    it('should require valid ID document for ID scan step', () => {
      const { result } = renderHookWithProvider(() => {
        const [currentStep, setCurrentStep] = useAtom(currentFormStepAtom);
        const [formData, setFormData] = useAtom(formDataAtom);
        const [canProceed] = useAtom(canProceedAtom);
        return {
          currentStep,
          setCurrentStep,
          formData,
          setFormData,
          canProceed,
        };
      });

      act(() => {
        result.current.setCurrentStep(1); // ID scan step
      });

      expect(result.current.canProceed).toBe(false);

      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          idDocument: {
            ...result.current.formData.idDocument,
            type: 'drivers_license',
            number: '123456789',
          },
        });
      });

      expect(result.current.canProceed).toBe(true);
    });
  });

  describe('resetFormAtom', () => {
    it('should reset all form data to initial state', () => {
      const { result } = renderHookWithProvider(() => {
        const [formData, setFormData] = useAtom(formDataAtom);
        const [session, setSession] = useAtom(visitorSessionAtom);
        const [currentStep, setCurrentStep] = useAtom(currentFormStepAtom);
        const [, resetForm] = useAtom(resetFormAtom);
        return {
          formData,
          setFormData,
          session,
          setSession,
          currentStep,
          setCurrentStep,
          resetForm,
        };
      });

      // Set some data
      act(() => {
        result.current.setFormData({
          ...result.current.formData,
          personalInfo: {
            ...result.current.formData.personalInfo,
            firstName: 'John',
            lastName: 'Doe',
          },
        });
        result.current.setSession({
          ...result.current.session,
          id: 'visitor_123',
          status: 'checked_in',
        });
        result.current.setCurrentStep(3);
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.personalInfo.firstName).toBe('');
      expect(result.current.session.id).toBeNull();
      expect(result.current.session.status).toBe('inactive');
      expect(result.current.currentStep).toBe(0);
    });
  });
});
