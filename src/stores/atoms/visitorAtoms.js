import { atom } from 'jotai';

// Visitor data atoms
export const currentVisitorAtom = atom(null);

export const formDataAtom = atom({
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
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },
  idDocument: {
    type: '', // 'drivers_license', 'passport', 'national_id'
    number: '',
    issuingCountry: '',
    expiryDate: '',
    rawData: null, // OCR extracted data
  },
});

export const visitorSessionAtom = atom({
  id: null,
  startTime: null,
  endTime: null,
  status: 'inactive', // 'inactive', 'checking_in', 'checked_in', 'checking_out', 'checked_out'
  badgePrinted: false,
  qrCode: null,
});

export const visitorHistoryAtom = atom([]);

// Form validation atoms
export const formValidationAtom = atom(get => {
  const formData = get(formDataAtom);
  const personalInfo = formData.personalInfo;
  const visitDetails = formData.visitDetails;
  const emergencyContact = formData.emergencyContact;
  const idDocument = formData.idDocument;

  return {
    personalInfo: {
      isValid: !!(
        personalInfo.firstName &&
        personalInfo.lastName &&
        personalInfo.email
      ),
      errors: {
        firstName: !personalInfo.firstName ? 'First name is required' : '',
        lastName: !personalInfo.lastName ? 'Last name is required' : '',
        email: !personalInfo.email
          ? 'Email is required'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)
            ? 'Invalid email format'
            : '',
      },
    },
    visitDetails: {
      isValid: !!(
        visitDetails.hostName &&
        visitDetails.hostEmail &&
        visitDetails.visitPurpose
      ),
      errors: {
        hostName: !visitDetails.hostName ? 'Host name is required' : '',
        hostEmail: !visitDetails.hostEmail
          ? 'Host email is required'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitDetails.hostEmail)
            ? 'Invalid host email format'
            : '',
        visitPurpose: !visitDetails.visitPurpose
          ? 'Visit purpose is required'
          : '',
      },
    },
    emergencyContact: {
      isValid: !!(emergencyContact.name && emergencyContact.phone),
      errors: {
        name: !emergencyContact.name
          ? 'Emergency contact name is required'
          : '',
        phone: !emergencyContact.phone
          ? 'Emergency contact phone is required'
          : '',
      },
    },
    idDocument: {
      isValid: !!(idDocument.type && idDocument.number),
      errors: {
        type: !idDocument.type ? 'ID document type is required' : '',
        number: !idDocument.number ? 'ID document number is required' : '',
      },
    },
  };
});

// OCR processing atoms
export const ocrProcessingAtom = atom({
  isProcessing: false,
  progress: 0,
  results: null,
  confidence: 0,
  error: null,
});

export const ocrResultsAtom = atom(get => {
  const ocrProcessing = get(ocrProcessingAtom);
  return {
    extractedText: ocrProcessing.results?.text || '',
    fields: ocrProcessing.results?.fields || {},
    confidence: ocrProcessing.confidence,
    documentType: ocrProcessing.results?.documentType || null,
  };
});

// Individual OCR atoms for easier access
export const ocrErrorAtom = atom(get => get(ocrProcessingAtom).error);

export const ocrConfidenceAtom = atom(get => get(ocrProcessingAtom).confidence);

export const documentTypeAtom = atom(get => get(ocrProcessingAtom).results?.documentType || null);

export const extractedFieldsAtom = atom(get => get(ocrProcessingAtom).results?.fields || {});

// Visitor badge data atom
export const visitorBadgeDataAtom = atom(get => {
  const visitor = get(currentVisitorAtom);
  const formData = get(formDataAtom);
  const session = get(visitorSessionAtom);

  if (!formData.personalInfo.firstName) return null;

  return {
    id: session.id || `visitor_${Date.now()}`,
    name: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`,
    company: formData.personalInfo.company || 'Guest',
    visitDate: formData.visitDetails.visitDate,
    visitTime: formData.visitDetails.visitTime,
    hostName: formData.visitDetails.hostName,
    qrCode: session.qrCode,
    badgePrinted: session.badgePrinted,
    checkInTime: session.startTime,
    checkOutTime: session.endTime,
  };
});

// Form step management
export const currentFormStepAtom = atom(0);

export const formStepsAtom = atom([
  { id: 'welcome', title: 'Welcome', completed: false },
  { id: 'id_scan', title: 'ID Scan', completed: false },
  { id: 'verification', title: 'Verification', completed: false },
  { id: 'contact_info', title: 'Contact Info', completed: false },
  { id: 'visit_details', title: 'Visit Details', completed: false },
  { id: 'badge_print', title: 'Badge Print', completed: false },
]);

export const canProceedAtom = atom(get => {
  const currentStep = get(currentFormStepAtom);
  const validation = get(formValidationAtom);

  switch (currentStep) {
    case 0: // Welcome - always can proceed
      return true;
    case 1: // ID Scan - need valid ID document
      return validation.idDocument.isValid;
    case 2: // Verification - need valid personal info
      return validation.personalInfo.isValid;
    case 3: // Contact Info - need valid emergency contact
      return validation.emergencyContact.isValid;
    case 4: // Visit Details - need valid visit details
      return validation.visitDetails.isValid;
    case 5: // Badge Print - always can proceed
      return true;
    default:
      return false;
  }
});

// Reset form atom
export const resetFormAtom = atom(null, (get, set) => {
  set(currentVisitorAtom, null);
  set(formDataAtom, {
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
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
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
  set(visitorSessionAtom, {
    id: null,
    startTime: null,
    endTime: null,
    status: 'inactive',
    badgePrinted: false,
    qrCode: null,
  });
  set(currentFormStepAtom, 0);
  set(ocrProcessingAtom, {
    isProcessing: false,
    progress: 0,
    results: null,
    confidence: 0,
    error: null,
  });
});
