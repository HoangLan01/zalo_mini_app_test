/**
 * Unit tests for password.ts
 */
import { isStrongPassword, generateTemporaryPassword, PASSWORD_POLICY_MESSAGE } from '../../utils/password';

describe('isStrongPassword', () => {
  it('should accept a strong password with all requirements', () => {
    expect(isStrongPassword('MyP@ssw0rd!!12')).toBe(true);
  });

  it('should accept password with exactly 12 characters', () => {
    expect(isStrongPassword('Abcdefgh1!@#')).toBe(true);
  });

  it('should reject password shorter than 12 characters', () => {
    expect(isStrongPassword('Abc1!short')).toBe(false);
  });

  it('should reject password without uppercase letter', () => {
    expect(isStrongPassword('abcdefgh1!@#')).toBe(false);
  });

  it('should reject password without lowercase letter', () => {
    expect(isStrongPassword('ABCDEFGH1!@#')).toBe(false);
  });

  it('should reject password without digit', () => {
    expect(isStrongPassword('Abcdefgh!@#$')).toBe(false);
  });

  it('should reject password without special character', () => {
    expect(isStrongPassword('Abcdefgh1234')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isStrongPassword('')).toBe(false);
  });
});

describe('generateTemporaryPassword', () => {
  it('should generate a password that passes isStrongPassword', () => {
    const password = generateTemporaryPassword();
    expect(isStrongPassword(password)).toBe(true);
  });

  it('should generate unique passwords', () => {
    const passwords = new Set(Array.from({ length: 10 }, () => generateTemporaryPassword()));
    expect(passwords.size).toBe(10);
  });

  it('should start with Aa1! prefix', () => {
    const password = generateTemporaryPassword();
    expect(password.startsWith('Aa1!')).toBe(true);
  });
});

describe('PASSWORD_POLICY_MESSAGE', () => {
  it('should be a non-empty string', () => {
    expect(PASSWORD_POLICY_MESSAGE).toBeTruthy();
    expect(typeof PASSWORD_POLICY_MESSAGE).toBe('string');
  });
});
