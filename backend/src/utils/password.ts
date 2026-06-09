import crypto from 'crypto';

export const PASSWORD_POLICY_MESSAGE = 'Mật khẩu phải có ít nhất 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';

export const isStrongPassword = (password: string) =>
  password.length >= 12 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const generateTemporaryPassword = () => {
  const random = crypto.randomBytes(12).toString('base64url');
  return `Aa1!${random}`;
};
