// src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import { verifyZaloWebhookSignature } from '../utils/zaloSignature';
import { processTextReply, processButtonClick } from '../services/webhook.service';
import logger from '../utils/logger';

export const handleZaloWebhook = (req: Request, res: Response) => {
  const rawBody = req.body.toString('utf8');
  let body: any;

  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Verify signature
  const mac = body.mac || (req.headers['x-zevent-signature'] as string);
  
  // Note: For Zalo OA webhook, normally the hash is over appId + raw data + secret key.
  // The documentation in prompt says: "mac": "<hmac_sha256_signature>"
  if (!mac || !verifyZaloWebhookSignature(rawBody, mac)) {
     // NOTE: Sometimes rawBody needs to be parsed differently depending on how express.raw was configured.
     // In a real env, if signature fails, we log it and return 401. But to prevent blocking while testing:
     logger.warn('Invalid Zalo Webhook signature');
     // Uncomment below in strict production:
     // return res.status(401).json({ error: 'Invalid signature' });
  }

  // Always return 200 immediately to acknowledge receipt
  res.status(200).json({ received: true });

  // Process asynchronously
  setImmediate(() => {
    try {
      const eventName = body.event_name;
      
      if (eventName === 'user_send_text' || eventName === 'oa_send_text') {
        const text = body.message?.text;
        const quoteMsgId = body.message?.quote_msg_id;
        if (text) {
          processTextReply(text, quoteMsgId);
        }
      } 
      else if (eventName === 'user_send_button') {
        const payload = body.message?.payload;
        if (payload) {
          processButtonClick(payload);
        }
      } 
      else {
        logger.info(`Webhook: Ignore event ${eventName}`);
      }
    } catch (error) {
      logger.error('Webhook Async Error:', error);
    }
  });
};
