// src/services/zaloOA.service.ts
import axios from 'axios';
import logger from '../utils/logger';
import { Feedback, Booking, User, Rating, FeedbackCategory, BookingField } from '@prisma/client';

import { prisma } from '../server';
import qs from 'qs';

let cachedAccessToken: string | null = null;

export const getOAToken = async (): Promise<string> => {
  try {
    let tokenRecord = await prisma.oAToken.findUnique({ where: { id: 'default' } });
    const envToken = process.env.ZALO_OA_ACCESS_TOKEN;
    const envRefresh = process.env.ZALO_OA_REFRESH_KEY;

    // 1. Đồng bộ từ .env nếu có thay đổi thủ công (Mồi lại token)
    if (envToken && envRefresh) {
      const isNewToken = !tokenRecord || (tokenRecord.accessToken !== envToken && envRefresh !== tokenRecord.refreshToken);
      
      if (isNewToken) {
        logger.info(tokenRecord ? 'Manual token override detected in .env. Updating DB...' : 'Auto-seeding OAToken from .env...');
        tokenRecord = await prisma.oAToken.upsert({
          where: { id: 'default' },
          update: {
            accessToken: envToken,
            refreshToken: envRefresh,
            expiresAt: new Date(Date.now() + 25 * 60 * 60 * 1000)
          },
          create: {
            id: 'default',
            accessToken: envToken,
            refreshToken: envRefresh,
            expiresAt: new Date(Date.now() + 25 * 60 * 60 * 1000)
          }
        });
      }
    }

    if (!tokenRecord) {
      logger.warn('No OAToken found in DB and no valid .env fallback.');
      return envToken || '';
    }

    // 2. Kiểm tra hạn sử dụng. Nếu sắp hết hạn (còn dưới 10 phút), làm mới.
    if (tokenRecord.expiresAt.getTime() - Date.now() < 10 * 60 * 1000) {
      logger.info('OA Access Token is expiring soon. Attempting automatic refresh...');
      const newToken = await refreshOAToken(tokenRecord.refreshToken);
      if (newToken) return newToken;
      
      logger.error('Automatic refresh failed. Please check if ZALO_OA_REFRESH_KEY in .env is valid or update it manually.');
    }

    return tokenRecord.accessToken;
  } catch (error) {
    logger.error('Error getting OA token:', error);
    return process.env.ZALO_OA_ACCESS_TOKEN || '';
  }
};

export const refreshOAToken = async (refreshToken: string): Promise<string> => {
  try {
    const appId = process.env.ZALO_APP_ID;
    const secretKey = process.env.ZALO_APP_SECRET;

    if (!appId || !secretKey) {
      throw new Error('Missing ZALO_APP_ID or ZALO_APP_SECRET in .env');
    }

    const response = await axios.post(
      'https://oauth.zaloapp.com/v4/oa/access_token',
      qs.stringify({
        refresh_token: refreshToken,
        app_id: appId,
        grant_type: 'refresh_token'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': secretKey
        }
      }
    );

    const { access_token, refresh_token, expires_in, error, error_description } = response.data;
    
    if (error || !access_token || !refresh_token) {
      const errMsg = error_description || response.data.message || 'Unknown error';
      throw new Error(`Zalo API Refresh Error: ${errMsg} (code: ${error})`);
    }

    const expiresAt = new Date(Date.now() + parseInt(expires_in) * 1000);
    
    await prisma.oAToken.update({
      where: { id: 'default' },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt
      }
    });

    logger.info('OA Token refreshed successfully and saved to DB');
    return access_token;

  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    logger.error('Failed to refresh OA token:', typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
    return '';
  }
};

const getBaseHeaders = async () => ({
  'Content-Type': 'application/json',
  'access_token': await getOAToken()
});

export const sendMessageToUser = async (recipientZaloId: string, message: object): Promise<string | null> => {
  try {
    const response = await axios.post(
      'https://openapi.zalo.me/v3.0/oa/message/cs',
      {
        recipient: { user_id: recipientZaloId },
        message
      },
      { headers: await getBaseHeaders() }
    );

    const data = response.data;
    if (data.error) {
      logger.warn(`Zalo OA API Error (send message): ${data.message}`, data);
      return null;
    }

    return data.data?.message_id || null;
  } catch (error: any) {
    logger.warn('Lỗi khi gọi Zalo OA API gửi tin nhắn:', error.response?.data || error.message);
    return null;
  }
};

export const getCategoryLabel = (category: FeedbackCategory): string => {
  const map: Record<FeedbackCategory, string> = {
    HA_TANG: 'Hạ tầng – Đường sá',
    VE_SINH: 'Vệ sinh môi trường',
    TRAT_TU: 'Trật tự đô thị',
    AN_NINH: 'An ninh – Trật tự',
    KHAC: 'Vấn đề khác'
  };
  return map[category];
};

export const getFieldLabel = (field: BookingField): string => {
  const map: Record<BookingField, string> = {
    HO_TICH: 'Hộ tịch',
    CU_TRU: 'Cư trú',
    CHUNG_THUC: 'Chứng thực',
    DAT_DAI: 'Đất đai – Xây dựng',
    XA_HOI: 'Chính sách xã hội',
    KHAC: 'Vấn đề khác'
  };
  return map[field];
};

export const sendFeedbackToOA = async (feedback: Feedback, user: User): Promise<string | null> => {
  const message = {
    attachment: {
      type: "template",
      payload: {
        template_type: "list",
        elements: [
          {
            title: "🚨 PHẢN ÁNH MỚI",
            subtitle: "Mã: " + feedback.code,
            image_url: feedback.imageUrls[0] || ""
          },
          {
            title: "👤 Người gửi: " + user.displayName,
            subtitle: "Danh mục: " + getCategoryLabel(feedback.category)
          },
          {
            title: "📝 Nội dung:",
            subtitle: feedback.title + " – " + feedback.description.substring(0, 100) + "..."
          },
          {
            title: "📍 Địa điểm:",
            subtitle: feedback.address || "Tọa độ: " + feedback.latitude + ", " + feedback.longitude
          }
        ],
        buttons: [
          {
            title: "✅ ĐANG XỬ LÝ",
            type: "oa.query.show",
            payload: "FEEDBACK_PROCESSING " + feedback.id
          },
          {
            title: "✔️ ĐÃ GIẢI QUYẾT",
            type: "oa.query.show",
            payload: "FEEDBACK_RESOLVED " + feedback.id
          }
        ]
      }
    }
  };

  return sendMessageToUser(user.zaloId, message);
};

export const sendBookingToOA = async (booking: Booking, user: User): Promise<string | null> => {
  const prefDate = booking.preferredDate.toISOString().split('T')[0].split('-').reverse().join('/');

  const textContent =
    `📅 YÊU CẦU ĐẶT LỊCH MỚI
Mã: ${booking.code}
👤 Người đặt: ${user.displayName}
🗂️ Lĩnh vực: ${getFieldLabel(booking.field)}
📆 Ngày mong muốn: ${prefDate}
⏰ Giờ mong muốn: ${booking.preferredTime}
📝 Nội dung: ${booking.description}

─────────────────────
Để XÁC NHẬN: Reply theo mẫu:
XAC_NHAN [ngày] [giờ]
VD: XAC_NHAN 20/05/2026 09:00

Để TỪ CHỐI: Reply:
TU_CHOI [lý do]

Để DỜI LỊCH: Reply:
DOI_LICH [ngày] [giờ] [ghi chú]`;

  return sendMessageToUser(user.zaloId, { text: textContent });
};

export const sendLowRatingAlert = async (rating: Rating, user: User): Promise<void> => {
  const leaderId = process.env.ZALO_LEADER_USER_ID;
  if (!leaderId) {
    logger.warn('Missing ZALO_LEADER_USER_ID env var, cannot send rating alert');
    return;
  }

  const textContent =
    `⚠️ ĐÁNH GIÁ THẤP
Mức độ hài lòng: ${rating.averageScore}/5 ⭐
Thủ tục: ${rating.procedure}
Nhận xét: ${rating.comment || 'Không có'}`;

  await sendMessageToUser(leaderId, { text: textContent });
};

export const getOAArticles = async (offset: number = 0, limit: number = 10) => {
  try {
    const headers = await getBaseHeaders();
    const url = `https://openapi.zalo.me/v2.0/article/getslice?offset=${offset}&limit=${limit}&type=normal`;
    logger.info(`Fetching OA articles: ${url}`);
    logger.info(`Using access_token (first 20 chars): ${headers.access_token?.substring(0, 20)}...`);

    const response = await axios.get(url, { headers });
    logger.info(`OA getslice raw response status: ${response.status}, data: ${JSON.stringify(response.data).substring(0, 500)}`);
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching OA articles:', error.response?.data || error.message);
    return null;
  }
};

export const getOAArticleDetail = async (id: string) => {
  try {
    const response = await axios.get(
      `https://openapi.zalo.me/v2.0/article/getdetail?id=${id}`,
      { headers: await getBaseHeaders() }
    );
    return response.data;
  } catch (error: any) {
    logger.error(`Error fetching OA article detail for ${id}:`, error.response?.data || error.message);
    return null;
  }
};
