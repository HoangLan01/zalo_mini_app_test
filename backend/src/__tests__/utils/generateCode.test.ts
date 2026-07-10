/**
 * Unit tests for generateCode.ts
 */
import { generateBookingCode, generateFeedbackCode } from '../../utils/generateCode';

describe('generateBookingCode', () => {
  it('should generate code with correct prefix and padded sequence', () => {
    expect(generateBookingCode(2026, 1)).toBe('LH-2026-0001');
  });

  it('should pad sequence to 4 digits', () => {
    expect(generateBookingCode(2026, 42)).toBe('LH-2026-0042');
  });

  it('should handle sequence over 4 digits', () => {
    expect(generateBookingCode(2026, 12345)).toBe('LH-2026-12345');
  });

  it('should handle different years', () => {
    expect(generateBookingCode(2025, 1)).toBe('LH-2025-0001');
    expect(generateBookingCode(2030, 999)).toBe('LH-2030-0999');
  });
});

describe('generateFeedbackCode', () => {
  it('should generate code with correct prefix and padded sequence', () => {
    expect(generateFeedbackCode(2026, 1)).toBe('PA-2026-0001');
  });

  it('should pad sequence to 4 digits', () => {
    expect(generateFeedbackCode(2026, 42)).toBe('PA-2026-0042');
  });

  it('should handle sequence over 4 digits', () => {
    expect(generateFeedbackCode(2026, 10000)).toBe('PA-2026-10000');
  });

  it('should handle boundary sequence 9999', () => {
    expect(generateFeedbackCode(2026, 9999)).toBe('PA-2026-9999');
  });
});
