// src/services/zaloOA.service.ts
import axios from 'axios';
import logger from '../utils/logger';
import { Feedback, Booking, User, Rating, FeedbackCategory, BookingField } from '@prisma/client';

const getBaseHeaders = () => ({
  'Content-Type': 'application/json',
  'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
});

export const sendMessageToUser = async (recipientZaloId: string, message: object): Promise<string | null> => {
  try {
    const response = await axios.post(
      'https://openapi.zalo.me/v3.0/oa/message/cs',
      {
        recipient: { user_id: recipientZaloId },
        message
      },
      { headers: getBaseHeaders() }
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
