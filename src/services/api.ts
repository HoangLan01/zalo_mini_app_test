import { getZaloAccessToken } from '../utils/zaloHelper';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const JWT_KEY = 'mini_app_jwt';
const ENABLE_DEV_AUTH = import.meta.env.VITE_ENABLE_DEV_AUTH === 'true' || import.meta.env.DEV;

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

async function readApiResponse<T>(res: Response): Promise<T> {
  const json = await res.json() as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.success ? `API error: ${res.status}` : json.error.message);
  }

  return json.data;
}

async function loginWithDevUser(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await readApiResponse<{ token: string }>(res);
  localStorage.setItem(JWT_KEY, data.token);
  return data.token;
}

async function loginWithZalo(): Promise<string> {
  const cached = localStorage.getItem(JWT_KEY);
  if (cached) return cached;

  const accessToken = await getZaloAccessToken();
  if (!accessToken) {
    if (ENABLE_DEV_AUTH) {
      return loginWithDevUser();
    }

    throw new Error('Không lấy được Zalo access token. Vui lòng mở trong Zalo Mini App hoặc bật dev auth khi chạy local.');
  }

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  });

  const data = await readApiResponse<{ token: string }>(res);
  localStorage.setItem(JWT_KEY, data.token);
  return data.token;
}

export function clearApiToken() {
  localStorage.removeItem(JWT_KEY);
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = await loginWithZalo();

  const doRequest = () => fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  let res = await doRequest();
  if (res.status === 401) {
    clearApiToken();
    token = await loginWithZalo();
    res = await doRequest();
  }

  return readApiResponse<T>(res);
}
