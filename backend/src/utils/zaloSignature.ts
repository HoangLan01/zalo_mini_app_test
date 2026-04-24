// src/utils/zaloSignature.ts
import crypto from 'crypto';

export const verifyZaloWebhookSignature = (payload: string, mac: string): boolean => {
  const secretKey = process.env.ZALO_OA_SECRET_KEY;
  if (!secretKey) return false;

  const expectedMac = crypto
    .createHash('sha256')
    .update(process.env.ZALO_APP_ID + payload + secretKey)
    .digest('hex');

  // To prevent timing attacks, we should use timingSafeEqual, but length check is needed first
  if (expectedMac.length !== mac.length) return false;
  
  return crypto.timingSafeEqual(Buffer.from(expectedMac), Buffer.from(mac));
};
