# Visitor Data Schema

This document defines the comprehensive data structure for visitor information in the kiosk visitors management system.

## Overview

The visitor schema is designed to capture all necessary information for visitor management, including personal details, identification data, contact information, visit metadata, and status tracking.

## Data Structure

### Personal Information Fields

| Field         | Type   | Required | Description                       | Validation Rules                                       |
| ------------- | ------ | -------- | --------------------------------- | ------------------------------------------------------ |
| `firstName`   | string | Yes      | Visitor's first name              | Min 1 char, max 50 chars, letters only                 |
| `lastName`    | string | Yes      | Visitor's last name               | Min 1 char, max 50 chars, letters only                 |
| `middleName`  | string | No       | Visitor's middle name or initial  | Max 50 chars, letters only                             |
| `dateOfBirth` | Date   | Yes      | Visitor's date of birth           | Valid date, must be 18+ years old                      |
| `gender`      | string | No       | Visitor's gender                  | One of: 'male', 'female', 'other', 'prefer-not-to-say' |
| `nationality` | string | No       | Visitor's nationality             | ISO 3166-1 alpha-2 country code                        |
| `occupation`  | string | No       | Visitor's job title or occupation | Max 100 chars                                          |

### Extracted ID Data

| Field                  | Type   | Required | Description                          | Validation Rules                                                             |
| ---------------------- | ------ | -------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `documentType`         | string | Yes      | Type of identification document      | One of: 'passport', 'drivers-license', 'national-id', 'military-id', 'other' |
| `documentNumber`       | string | Yes      | Document identification number       | Alphanumeric, 5-20 chars                                                     |
| `issuingCountry`       | string | Yes      | Country that issued the document     | ISO 3166-1 alpha-2 country code                                              |
| `issueDate`            | Date   | No       | Date the document was issued         | Valid date, not in future                                                    |
| `expiryDate`           | Date   | No       | Document expiration date             | Valid date, not in past                                                      |
| `address`              | object | No       | Address extracted from document      | See Address Object below                                                     |
| `documentImage`        | string | No       | Base64 encoded image of the document | Valid base64 string                                                          |
| `extractionConfidence` | number | No       | OCR confidence score (0-1)           | Float between 0 and 1                                                        |

#### Address Object

| Field        | Type   | Required | Description        |
| ------------ | ------ | -------- | ------------------ |
| `street`     | string | No       | Street address     |
| `city`       | string | No       | City name          |
| `state`      | string | No       | State or province  |
| `postalCode` | string | No       | Postal or ZIP code |
| `country`    | string | No       | Country name       |

### Contact Details

| Field              | Type   | Required | Description                   | Validation Rules                   |
| ------------------ | ------ | -------- | ----------------------------- | ---------------------------------- |
| `phone`            | string | No       | Primary phone number          | Valid phone format (international) |
| `email`            | string | No       | Email address                 | Valid email format                 |
| `emergencyContact` | object | No       | Emergency contact information | See Emergency Contact Object below |

#### Emergency Contact Object

| Field          | Type   | Required | Description                   | Validation Rules                                                  |
| -------------- | ------ | -------- | ----------------------------- | ----------------------------------------------------------------- |
| `name`         | string | Yes      | Emergency contact's full name | Min 2 chars, max 100 chars                                        |
| `relationship` | string | Yes      | Relationship to visitor       | One of: 'spouse', 'parent', 'child', 'sibling', 'friend', 'other' |
| `phone`        | string | Yes      | Emergency contact's phone     | Valid phone format                                                |
| `email`        | string | No       | Emergency contact's email     | Valid email format                                                |

### Visit Metadata

| Field                 | Type   | Required | Description                           | Validation Rules                                                               |
| --------------------- | ------ | -------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `purpose`             | string | Yes      | Purpose of the visit                  | One of: 'meeting', 'delivery', 'maintenance', 'interview', 'training', 'other' |
| `purposeDescription`  | string | No       | Detailed description of visit purpose | Max 500 chars                                                                  |
| `hostName`            | string | Yes      | Name of the person being visited      | Min 2 chars, max 100 chars                                                     |
| `hostDepartment`      | string | No       | Host's department or division         | Max 100 chars                                                                  |
| `hostEmail`           | string | No       | Host's email address                  | Valid email format                                                             |
| `hostPhone`           | string | No       | Host's phone number                   | Valid phone format                                                             |
| `expectedDuration`    | number | No       | Expected visit duration in minutes    | Positive integer                                                               |
| `visitLocation`       | string | No       | Specific location within the building | Max 200 chars                                                                  |
| `specialInstructions` | string | No       | Any special instructions or notes     | Max 1000 chars                                                                 |

### Status Tracking

| Field              | Type    | Required | Description                            | Default Value  |
| ------------------ | ------- | -------- | -------------------------------------- | -------------- |
| `isCheckedIn`      | boolean | Yes      | Whether visitor has checked in         | false          |
| `checkInTime`      | Date    | No       | Timestamp of check-in                  | null           |
| `checkOutTime`     | Date    | No       | Timestamp of check-out                 | null           |
| `badgePrinted`     | boolean | Yes      | Whether visitor badge has been printed | false          |
| `badgePrintedTime` | Date    | No       | Timestamp when badge was printed       | null           |
| `badgeNumber`      | string  | No       | Unique badge identifier                | Auto-generated |
| `qrCode`           | string  | No       | QR code data for visitor               | Auto-generated |
| `status`           | string  | Yes      | Current visitor status                 | 'pending'      |
| `notes`            | string  | No       | Additional notes or comments           | null           |

#### Status Values

The `status` field can have the following values:

- `'pending'` - Visitor registered but not yet checked in
- `'checked-in'` - Visitor has checked in and is on-site
- `'checked-out'` - Visitor has completed their visit and checked out
- `'expired'` - Visit has expired (past expected duration)
- `'cancelled'` - Visit was cancelled

### System Metadata

| Field       | Type   | Required | Description                              | Auto-Generated |
| ----------- | ------ | -------- | ---------------------------------------- | -------------- |
| `id`        | string | Yes      | Unique visitor record identifier         | Yes (UUID)     |
| `createdAt` | Date   | Yes      | Record creation timestamp                | Yes            |
| `updatedAt` | Date   | Yes      | Last update timestamp                    | Yes            |
| `createdBy` | string | No       | User/system that created the record      | No             |
| `updatedBy` | string | No       | User/system that last updated the record | No             |

## Example JSON Structure

```json
{
  "id": "visitor-123e4567-e89b-12d3-a456-426614174000",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Michael",
    "dateOfBirth": "1985-06-15",
    "gender": "male",
    "nationality": "US",
    "occupation": "Software Engineer"
  },
  "idData": {
    "documentType": "drivers-license",
    "documentNumber": "D123456789",
    "issuingCountry": "US",
    "issueDate": "2020-01-15",
    "expiryDate": "2025-01-15",
    "address": {
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "United States"
    },
    "documentImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "extractionConfidence": 0.95
  },
  "contactDetails": {
    "phone": "+1-555-123-4567",
    "email": "john.doe@email.com",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "spouse",
      "phone": "+1-555-987-6543",
      "email": "jane.doe@email.com"
    }
  },
  "visitMetadata": {
    "purpose": "meeting",
    "purposeDescription": "Quarterly business review meeting",
    "hostName": "Sarah Johnson",
    "hostDepartment": "Sales",
    "hostEmail": "sarah.johnson@company.com",
    "hostPhone": "+1-555-456-7890",
    "expectedDuration": 120,
    "visitLocation": "Conference Room A, 3rd Floor",
    "specialInstructions": "Please use the main entrance and check in at reception"
  },
  "statusTracking": {
    "isCheckedIn": true,
    "checkInTime": "2024-01-15T09:30:00Z",
    "checkOutTime": null,
    "badgePrinted": true,
    "badgePrintedTime": "2024-01-15T09:32:00Z",
    "badgeNumber": "V-2024-001",
    "qrCode": "visitor-123e4567-e89b-12d3-a456-426614174000",
    "status": "checked-in",
    "notes": "Visitor arrived 15 minutes early"
  },
  "systemMetadata": {
    "createdAt": "2024-01-15T09:25:00Z",
    "updatedAt": "2024-01-15T09:32:00Z",
    "createdBy": "kiosk-system",
    "updatedBy": "kiosk-system"
  }
}
```

## Validation Rules Summary

### Required Fields

- Personal: `firstName`, `lastName`, `dateOfBirth`
- ID Data: `documentType`, `documentNumber`, `issuingCountry`
- Visit: `purpose`, `hostName`
- Status: `isCheckedIn`, `badgePrinted`, `status`

### Data Types

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
- Phone numbers should include country code
- Email addresses must be valid email format
- Country codes should use ISO 3166-1 alpha-2 standard

### Business Rules

- Visitors must be 18+ years old
- Document expiry date cannot be in the past
- Check-out time must be after check-in time
- Badge can only be printed after check-in
- Status transitions must follow logical flow: pending → checked-in → checked-out

## Security Considerations

- Sensitive data (document images, personal details) should be encrypted at rest
- PII data should be masked in logs and non-essential displays
- Document images should be stored securely with appropriate access controls
- Data retention policies should be implemented for visitor records
- GDPR/privacy compliance should be considered for data handling

## Integration Notes

- This schema is designed to work with the OCR system (Tesseract.js) for ID extraction
- QR code generation should use the visitor ID for easy lookup
- Badge printing system should use the badgeNumber and QR code
- Status updates should trigger appropriate notifications
- Data should be synchronized with any backend visitor management system
