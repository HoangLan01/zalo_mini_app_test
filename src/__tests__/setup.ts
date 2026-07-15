/**
 * Frontend test setup
 *
 * - Mocks Zalo SDK modules
 * - Sets up global test environment
 */
import { vi, beforeEach } from 'vitest';

// Mock zmp-sdk/apis
vi.mock('zmp-sdk/apis', () => ({
  getAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
  getUserInfo: vi.fn().mockResolvedValue({
    userInfo: {
      id: 'mock-zalo-user-id',
      name: 'Mock User',
      avatar: 'https://example.com/avatar.jpg',
    },
  }),
  getPhoneNumber: vi.fn().mockResolvedValue({ token: 'mock-phone-token' }),
  openWebview: vi.fn(),
}));

// Mock zmp-ui components
vi.mock('zmp-ui', () => ({
  App: ({ children }: any) => children,
  ZMPRouter: ({ children }: any) => children,
  SnackbarProvider: ({ children }: any) => children,
  AnimationRoutes: ({ children }: any) => children,
  Route: () => null,
  Page: ({ children }: any) => children,
  Box: ({ children }: any) => children,
  Text: ({ children }: any) => children,
  Button: ({ children, ...props }: any) => children,
  Input: (props: any) => null,
  Select: (props: any) => null,
  useSnackbar: () => ({ openSnackbar: vi.fn(), closeSnackbar: vi.fn() }),
  useNavigate: () => vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
