import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const readEnvFile = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const values = new Map();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values.set(key, value);
  }

  return values;
};

const isPlaceholder = (value) => {
  if (value === '') return true;
  return /^(change_me.*|replace_me.*|your_.*|example.*|admin@example\.com|postgresql:\/\/user:password@localhost:5432\/phuong_tungthien|postgresql:\/\/user:password@localhost:5432\/phuong_tung_thien|http:\/\/localhost:\d+|https:\/\/<random>\.trycloudflare\.com|Super Admin|development|strict|false|true|1|2h|8h|\d+)$/.test(value);
};

const checks = [
  {
    file: '.env.example',
    requiredKeys: ['APP_ID', 'ZMP_TOKEN', 'VITE_API_URL', 'VITE_ZALO_OA_ID', 'VITE_ENABLE_DEV_AUTH'],
    sensitiveKeys: ['APP_ID', 'ZMP_TOKEN', 'VITE_ZALO_OA_ID'],
    expectFalseKeys: ['VITE_ENABLE_DEV_AUTH']
  },
  {
    file: 'admin/.env.example',
    requiredKeys: ['VITE_API_URL', 'VITE_BASE_PATH'],
    sensitiveKeys: [],
    expectFalseKeys: []
  },
  {
    file: 'backend/.env.example',
    requiredKeys: [
      'NODE_ENV',
      'PORT',
      'APP_URL',
      'ADMIN_APP_URL',
      'TRUST_PROXY',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'ADMIN_JWT_EXPIRES_IN',
      'COOKIE_DOMAIN',
      'ADMIN_COOKIE_SAME_SITE',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_INITIAL_PASSWORD',
      'SUPER_ADMIN_DISPLAY_NAME',
      'ENABLE_DEV_AUTH',
      'DEV_AUTH_ZALO_ID',
      'DEV_AUTH_DISPLAY_NAME',
      'ZALO_APP_ID',
      'ZALO_APP_SECRET',
      'ZALO_OA_ID',
      'ZALO_OA_ACCESS_TOKEN',
      'ZALO_OA_REFRESH_KEY',
      'ZALO_OA_SECRET_KEY',
      'ZALO_FEEDBACK_ADMIN_USER_IDS',
      'ZALO_BOOKING_ADMIN_USER_IDS',
      'ZALO_LEADER_USER_ID',
      'ZALO_ZNS_OA_TOKEN',
      'ZNS_TEMPLATE_BOOKING_RECEIVED',
      'ZNS_TEMPLATE_BOOKING_CONFIRMED',
      'ZNS_TEMPLATE_BOOKING_REJECTED',
      'ZNS_TEMPLATE_BOOKING_REMINDER',
      'ZNS_TEMPLATE_FEEDBACK_RECEIVED',
      'ZNS_TEMPLATE_FEEDBACK_UPDATED',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ],
    sensitiveKeys: [
      'DATABASE_URL',
      'JWT_SECRET',
      'SUPER_ADMIN_EMAIL',
      'SUPER_ADMIN_INITIAL_PASSWORD',
      'ZALO_APP_ID',
      'ZALO_APP_SECRET',
      'ZALO_OA_ID',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ],
    expectFalseKeys: ['ENABLE_DEV_AUTH']
  }
];

const problems = [];

for (const check of checks) {
  const env = readEnvFile(check.file);

  for (const key of check.requiredKeys) {
    if (!env.has(key)) {
      problems.push(`${check.file}: missing required key ${key}`);
    }
  }

  for (const key of check.sensitiveKeys) {
    const value = env.get(key) ?? '';
    if (!isPlaceholder(value)) {
      problems.push(`${check.file}: ${key} must be blank or a documented placeholder, found "${value}"`);
    }
  }

  for (const key of check.expectFalseKeys) {
    const value = env.get(key);
    if (value !== 'false') {
      problems.push(`${check.file}: ${key} must default to false, found "${value ?? ''}"`);
    }
  }
}

if (problems.length > 0) {
  console.error('Environment example validation failed:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log('Environment example validation passed.');
