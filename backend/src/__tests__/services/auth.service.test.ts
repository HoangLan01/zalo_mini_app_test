/**
 * Unit tests for auth.service.ts
 */
import '../setup';
import { prismaMock, createMockUser, createMockAdminUser } from '../setup';
import * as authService from '../../services/auth.service';
import { AppError } from '../../utils/appError';
import bcrypt from 'bcryptjs';
import axios from 'axios';

// Mock axios for Zalo API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('loginWithZalo', () => {
  const mockZaloData = {
    id: 'zalo-123',
    name: 'Nguyen Van A',
    picture: { data: { url: 'https://example.com/avatar.jpg' } },
  };

  it('should login successfully with valid Zalo access token', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockZaloData });
    const mockUser = createMockUser({ zaloId: 'zalo-123', displayName: 'Nguyen Van A' });
    prismaMock.user.upsert.mockResolvedValue(mockUser);

    const result = await authService.loginWithZalo('valid-zalo-token');

    expect(mockedAxios.get).toHaveBeenCalledWith('https://graph.zalo.me/v2.0/me', {
      params: { fields: 'id,name,picture' },
      headers: { access_token: 'valid-zalo-token' },
    });
    expect(prismaMock.user.upsert).toHaveBeenCalled();
    expect(result.token).toBeDefined();
    expect(result.user.zaloId).toBe('zalo-123');
  });

  it('should throw INVALID_ZALO_TOKEN when Zalo API returns error', async () => {
    mockedAxios.get.mockResolvedValue({ data: { error: -1, message: 'invalid token' } });

    await expect(authService.loginWithZalo('invalid-token'))
      .rejects.toThrow(AppError);
  });

  it('should throw INVALID_ZALO_TOKEN when Zalo API request fails', async () => {
    mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

    await expect(authService.loginWithZalo('bad-token'))
      .rejects.toThrow(AppError);
  });
});

describe('loginDevUser', () => {
  it('should create or update dev user in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_DEV_AUTH = 'true';

    const mockUser = createMockUser({ zaloId: 'test-zalo-user', displayName: 'Test User' });
    prismaMock.user.upsert.mockResolvedValue(mockUser);

    const result = await authService.loginDevUser();

    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(prismaMock.user.upsert).toHaveBeenCalled();
  });

  it('should throw DEV_AUTH_DISABLED in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEV_AUTH = 'true';

    await expect(authService.loginDevUser())
      .rejects.toThrow('Dev auth đã bị tắt');
  });

  it('should throw DEV_AUTH_DISABLED when ENABLE_DEV_AUTH is not true', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_DEV_AUTH = 'false';

    await expect(authService.loginDevUser())
      .rejects.toThrow('Dev auth đã bị tắt');
  });

  afterEach(() => {
    // Restore test env
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_DEV_AUTH = 'true';
  });
});

describe('loginAdmin', () => {
  it('should login admin with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('StrongP@ss123', 12);
    const mockAdmin = createMockAdminUser({ passwordHash: hashedPassword });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.user.update.mockResolvedValue({ ...mockAdmin, lastLoginAt: new Date() });

    const result = await authService.loginAdmin('admin@test.com', 'StrongP@ss123');

    expect(result.token).toBeDefined();
    expect(result.user.role).toBe('ADMIN');
  });

  it('should throw INVALID_ADMIN_CREDENTIALS with wrong password', async () => {
    const hashedPassword = await bcrypt.hash('StrongP@ss123', 12);
    const mockAdmin = createMockAdminUser({ passwordHash: hashedPassword });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);

    await expect(authService.loginAdmin('admin@test.com', 'wrong-password'))
      .rejects.toThrow('Email hoặc mật khẩu không đúng');
  });

  it('should throw INVALID_ADMIN_CREDENTIALS when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(authService.loginAdmin('notexist@test.com', 'any-password'))
      .rejects.toThrow('Email hoặc mật khẩu không đúng');
  });

  it('should throw INVALID_ADMIN_CREDENTIALS for disabled admin', async () => {
    const hashedPassword = await bcrypt.hash('StrongP@ss123', 12);
    const mockAdmin = createMockAdminUser({
      passwordHash: hashedPassword,
      status: 'DISABLED',
    });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);

    await expect(authService.loginAdmin('admin@test.com', 'StrongP@ss123'))
      .rejects.toThrow('Email hoặc mật khẩu không đúng');
  });

  it('should throw INVALID_ADMIN_CREDENTIALS for USER role', async () => {
    const hashedPassword = await bcrypt.hash('StrongP@ss123', 12);
    const mockUser = createMockUser({
      email: 'user@test.com',
      passwordHash: hashedPassword,
      role: 'USER',
    });
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await expect(authService.loginAdmin('user@test.com', 'StrongP@ss123'))
      .rejects.toThrow('Email hoặc mật khẩu không đúng');
  });
});

describe('changeAdminPassword', () => {
  it('should change password with valid current password and strong new password', async () => {
    const currentHash = await bcrypt.hash('OldP@ssword123', 12);
    const mockAdmin = createMockAdminUser({ passwordHash: currentHash, sessionVersion: 0 });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);
    prismaMock.user.update.mockResolvedValue({
      ...mockAdmin,
      sessionVersion: 1,
      mustChangePassword: false,
    });

    const result = await authService.changeAdminPassword(
      'test-admin-id',
      'OldP@ssword123',
      'NewStr0ng!Pass'
    );

    expect(result.token).toBeDefined();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'test-admin-id' },
        data: expect.objectContaining({
          mustChangePassword: false,
          sessionVersion: { increment: 1 },
        }),
      })
    );
  });

  it('should throw INVALID_CURRENT_PASSWORD when current password is wrong', async () => {
    const currentHash = await bcrypt.hash('CorrectOld!Pass1', 12);
    const mockAdmin = createMockAdminUser({ passwordHash: currentHash });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);

    await expect(
      authService.changeAdminPassword('test-admin-id', 'WrongOld!Pass1', 'NewStr0ng!Pass')
    ).rejects.toThrow('Mật khẩu hiện tại không đúng');
  });

  it('should throw WEAK_PASSWORD when new password is weak', async () => {
    const currentHash = await bcrypt.hash('OldP@ssword123', 12);
    const mockAdmin = createMockAdminUser({ passwordHash: currentHash });
    prismaMock.user.findUnique.mockResolvedValue(mockAdmin);

    await expect(
      authService.changeAdminPassword('test-admin-id', 'OldP@ssword123', 'weak')
    ).rejects.toThrow('Mật khẩu mới chưa đáp ứng chính sách bảo mật');
  });
});
