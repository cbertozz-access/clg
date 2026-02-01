/**
 * Input Validation Unit Tests
 */

import { validateContactForm, validationErrorBody, ContactFormSchema } from '../validation';

describe('Input Validation', () => {
  describe('validateContactForm', () => {
    const validFormData = {
      contactFirstName: 'John',
      contactLastName: 'Smith',
      contactEmail: 'john.smith@example.com',
      contactPhone: '+61412345678',
      contactCompanyName: 'Acme Corp',
      contactMessage: 'I would like to hire some equipment for my project.',
      contactType: 'General Inquiry',
      sourceDepot: 'Website',
    };

    it('should validate correct form data', () => {
      const result = validateContactForm(validFormData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should transform email to lowercase', () => {
      const result = validateContactForm({
        ...validFormData,
        contactEmail: 'JOHN.SMITH@EXAMPLE.COM',
      });

      expect(result.success).toBe(true);
      expect(result.data?.contactEmail).toBe('john.smith@example.com');
    });

    it('should normalize phone numbers by removing formatting', () => {
      const result = validateContactForm({
        ...validFormData,
        contactPhone: '+61 (412) 345-678',
      });

      expect(result.success).toBe(true);
      expect(result.data?.contactPhone).toBe('+61412345678');
    });

    it('should sanitize HTML from text fields', () => {
      const result = validateContactForm({
        ...validFormData,
        contactFirstName: 'John<script>alert("xss")</script>',
        contactMessage: 'Hello <b>world</b> this is a test message.',
      });

      expect(result.success).toBe(true);
      expect(result.data?.contactFirstName).toBe('Johnalert("xss")');
      expect(result.data?.contactMessage).toBe('Hello world this is a test message.');
    });

    it('should reject missing required fields', () => {
      const result = validateContactForm({
        contactFirstName: 'John',
        // Missing other required fields
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.contactLastName).toBeDefined();
      expect(result.errors?.contactEmail).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const result = validateContactForm({
        ...validFormData,
        contactEmail: 'not-an-email',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.contactEmail).toBeDefined();
      expect(result.errors?.contactEmail[0]).toContain('email');
    });

    it('should reject short first name', () => {
      const result = validateContactForm({
        ...validFormData,
        contactFirstName: 'J',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.contactFirstName).toBeDefined();
    });

    it('should reject message that is too short', () => {
      const result = validateContactForm({
        ...validFormData,
        contactMessage: 'Hi',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.contactMessage).toBeDefined();
    });

    it('should reject message that exceeds max length', () => {
      const result = validateContactForm({
        ...validFormData,
        contactMessage: 'a'.repeat(5001),
      });

      expect(result.success).toBe(false);
      expect(result.errors?.contactMessage).toBeDefined();
    });

    it('should accept valid Australian phone numbers', () => {
      const validPhones = [
        '0412345678',
        '+61412345678',
        '61412345678',
      ];

      for (const phone of validPhones) {
        const result = validateContactForm({
          ...validFormData,
          contactPhone: phone,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should accept optional fields when provided', () => {
      const result = validateContactForm({
        ...validFormData,
        contactCountry: 'New Zealand',
        contactIndustry: 'Construction',
        projectLocationSuburb: 'Melbourne',
        transactionType: 'hire',
        visitorId: 'visitor-123',
        utmSource: 'google',
      });

      expect(result.success).toBe(true);
      expect(result.data?.contactCountry).toBe('New Zealand');
      expect(result.data?.contactIndustry).toBe('Construction');
      expect(result.data?.utmSource).toBe('google');
    });

    it('should reject invalid transaction type', () => {
      const result = validateContactForm({
        ...validFormData,
        transactionType: 'invalid-type',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.transactionType).toBeDefined();
    });

    it('should handle null/undefined input gracefully', () => {
      const resultNull = validateContactForm(null);
      expect(resultNull.success).toBe(false);

      const resultUndefined = validateContactForm(undefined);
      expect(resultUndefined.success).toBe(false);
    });

    it('should handle non-object input', () => {
      const resultString = validateContactForm('not an object');
      expect(resultString.success).toBe(false);

      const resultNumber = validateContactForm(123);
      expect(resultNumber.success).toBe(false);
    });
  });

  describe('validationErrorBody', () => {
    it('should format error body correctly', () => {
      const errors = {
        contactEmail: ['Please provide a valid email address'],
        contactPhone: ['Phone number must be at least 10 digits', 'Invalid format'],
      };

      const body = validationErrorBody(errors);

      expect(body.success).toBe(false);
      expect(body.error).toBe('Validation failed');
      expect(body.message).toBe('Please correct the following errors');
      expect(body.details).toHaveLength(2);
      expect(body.details[0]).toEqual({
        field: 'contactEmail',
        message: 'Please provide a valid email address',
      });
      // Only first error per field
      expect(body.details[1]).toEqual({
        field: 'contactPhone',
        message: 'Phone number must be at least 10 digits',
      });
    });
  });
});
