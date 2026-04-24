// src/services/zns.service.ts
import axios from 'axios';
import logger from '../utils/logger';
import { Booking, Feedback, BookingStatus, FeedbackStatus } from '@prisma/client';
import { getCategoryLabel, getFieldLabel } from './zaloOA.service';

interface SendZNSParams {
  phone: string;
  templateId: string;
  data: Record<string, string>;
  trackingId?: string;
}

const getPhoneNumberFromToken = async (phoneToken: string): Promise<string> => {
  const response = await axios.post(
    'https://openapi.zalo.me/v2.0/oa/getinfobyphonenumbertoken',
    {
      phone_number_token: phoneToken,
      secret_key: process.env.ZALO_APP_SECRET
    },
    {
      headers: {
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || '',
        'Content-Type': 'application/json'
      }
    }
  );

  const data = response.data;
  if (data.error) {
    throw new Error(`Lỗi lấy số điện thoại từ token: ${data.message}`);
  }

  return data.data?.phone_number || '';
};

const sendZNS = async (params: SendZNSParams): Promise<boolean> => {
  try {
    const response = await axios.post(
      'https://business.zalo.me/api/notification/template/send',
      {
        phone: params.phone,
        template_id: params.templateId,
        template_data: params.data,
        tracking_id: params.trackingId
      },
      {
        headers: {
          'access_token': process.env.ZALO_ZNS_OA_TOKEN || '',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    if (data.error !== 0) {
      logger.warn(`Lỗi gửi ZNS: ${data.message}`, data);
      return false;
    }
    return true;
  } catch (error: any) {
    logger.warn('Lỗi call API ZNS:', error.response?.data || error.message);
    return false;
  }
};

const formatDate = (date: Date) => date.toISOString().split('T')[0].split('-').reverse().join('/');

export const sendBookingReceived = async (phoneToken: string | null, booking: Booking): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_BOOKING_RECEIVED || '',
      data: {
        booking_code: booking.code,
        field: getFieldLabel(booking.field),
        preferred_date: formatDate(booking.preferredDate),
        preferred_time: booking.preferredTime
      }
    });
  } catch (err) {
    logger.warn('sendBookingReceived failed:', err);
  }
};

export const sendBookingConfirmed = async (phoneToken: string | null, booking: Booking): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_BOOKING_CONFIRMED || '',
      data: {
        booking_code: booking.code,
        confirmed_date: booking.confirmedDate ? formatDate(booking.confirmedDate) : '',
        confirmed_time: booking.confirmedTime || '',
        location: "Bộ phận Một cửa – UBND Phường Tùng Thiện"
      }
    });
  } catch (err) {
    logger.warn('sendBookingConfirmed failed:', err);
  }
};

export const sendBookingRejected = async (phoneToken: string | null, booking: Booking): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_BOOKING_REJECTED || '',
      data: {
        booking_code: booking.code,
        rejection_reason: booking.rejectionReason || "Không xác định"
      }
    });
  } catch (err) {
    logger.warn('sendBookingRejected failed:', err);
  }
};

export const sendBookingReminder = async (phoneToken: string | null, booking: Booking, reminderType: '24h'|'1h'): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_BOOKING_REMINDER || '',
      data: {
        booking_code: booking.code,
        confirmed_date: booking.confirmedDate ? formatDate(booking.confirmedDate) : '',
        confirmed_time: booking.confirmedTime || '',
        reminder_type: reminderType === '24h' ? 'ngày mai' : '1 giờ nữa'
      }
    });
  } catch (err) {
    logger.warn('sendBookingReminder failed:', err);
  }
};

export const sendFeedbackReceived = async (phoneToken: string | null, feedback: Feedback): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_FEEDBACK_RECEIVED || '',
      data: {
        feedback_code: feedback.code,
        category: getCategoryLabel(feedback.category)
      }
    });
  } catch (err) {
    logger.warn('sendFeedbackReceived failed:', err);
  }
};

const getStatusLabel = (status: FeedbackStatus): string => {
  const map: Record<FeedbackStatus, string> = {
    PENDING: 'Đang tiếp nhận',
    PROCESSING: 'Đang xử lý',
    TRANSFERRED: 'Đã chuyển đơn vị',
    RESOLVED: 'Đã giải quyết'
  };
  return map[status];
};

export const sendFeedbackUpdated = async (phoneToken: string | null, feedback: Feedback): Promise<void> => {
  try {
    if (!phoneToken) return;
    const phone = await getPhoneNumberFromToken(phoneToken);
    if (!phone) return;

    await sendZNS({
      phone,
      templateId: process.env.ZNS_TEMPLATE_FEEDBACK_UPDATED || '',
      data: {
        feedback_code: feedback.code,
        status: getStatusLabel(feedback.status),
        response: feedback.response || 'Đang được xử lý'
      }
    });
  } catch (err) {
    logger.warn('sendFeedbackUpdated failed:', err);
  }
};
