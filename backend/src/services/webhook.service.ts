// src/services/webhook.service.ts
import logger from '../utils/logger';
import { updateFeedbackFromWebhook } from './feedback.service';
import { processWebhookReply } from './booking.service';

export const processTextReply = async (text: string, quoteMessageId?: string): Promise<void> => {
  if (!quoteMessageId) {
    logger.info('Webhook: No quote message ID, skip processing');
    return;
  }

  const cleanText = text.trim().toUpperCase();

  try {
    if (cleanText.startsWith('XAC_NHAN')) {
      // Parse: XAC_NHAN 20/05/2026 09:00
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 3) {
        const dateStr = parts[1]; // dd/MM/yyyy
        const timeStr = parts[2]; // HH:mm
        
        const [dd, mm, yyyy] = dateStr.split('/');
        if (dd && mm && yyyy) {
          const confirmedDate = new Date(Date.UTC(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd)));
          await processWebhookReply(quoteMessageId, 'CONFIRMED', { confirmedDate, confirmedTime: timeStr });
          return;
        }
      }
      logger.warn('Webhook: Invalid XAC_NHAN format', { text });
    } 
    else if (cleanText.startsWith('TU_CHOI')) {
      // Parse: TU_CHOI lý do...
      const reason = text.trim().substring('TU_CHOI'.length).trim() || 'Không có lý do cụ thể';
      await processWebhookReply(quoteMessageId, 'REJECTED', { rejectionReason: reason });
    }
    else if (cleanText.startsWith('DOI_LICH')) {
      // Parse: DOI_LICH 20/05/2026 09:00 ghi chú...
      const parts = text.trim().split(/\s+/);
      if (parts.length >= 3) {
        const dateStr = parts[1];
        const timeStr = parts[2];
        const note = parts.slice(3).join(' ');
        
        const [dd, mm, yyyy] = dateStr.split('/');
        if (dd && mm && yyyy) {
          const confirmedDate = new Date(Date.UTC(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd)));
          await processWebhookReply(quoteMessageId, 'RESCHEDULED', { confirmedDate, confirmedTime: timeStr, rescheduledNote: note });
          return;
        }
      }
      logger.warn('Webhook: Invalid DOI_LICH format', { text });
    }
    else {
      logger.info('Webhook: Unknown text command format, skip', { text });
    }
  } catch (error) {
    logger.error('Webhook: processTextReply error', error);
  }
};

export const processButtonClick = async (payload: string): Promise<void> => {
  try {
    const parts = payload.trim().split(/\s+/);
    if (parts.length >= 2) {
      const action = parts[0];
      const feedbackId = parts[1]; // Note: Wait, earlier prompt said payload is "FEEDBACK_PROCESSING <feedbackId>". But our db relies on oaMessageId to update. Wait, if payload has feedbackId, we can update directly by ID.

      // Actually, since payload contains the DB id directly:
      import('../server').then(({ prisma }) => {
        if (action === 'FEEDBACK_PROCESSING') {
           prisma.feedback.update({ where: { id: feedbackId }, data: { status: 'PROCESSING' } })
            .then(updated => {
                import('./zns.service').then(zns => {
                  prisma.user.findUnique({ where: { id: updated.userId } }).then(u => {
                    if (u?.phoneToken) zns.sendFeedbackUpdated(u.phoneToken, updated);
                  });
                });
            });
        } else if (action === 'FEEDBACK_RESOLVED') {
           prisma.feedback.update({ where: { id: feedbackId }, data: { status: 'RESOLVED' } })
            .then(updated => {
              import('./zns.service').then(zns => {
                  prisma.user.findUnique({ where: { id: updated.userId } }).then(u => {
                    if (u?.phoneToken) zns.sendFeedbackUpdated(u.phoneToken, updated);
                  });
                });
            });
        }
      });
    }
  } catch (error) {
    logger.error('Webhook: processButtonClick error', error);
  }
};
