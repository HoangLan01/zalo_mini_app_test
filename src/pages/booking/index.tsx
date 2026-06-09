import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Button, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { apiCall } from '@/services/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
type BookingField = 'HO_TICH' | 'CU_TRU' | 'CHUNG_THUC' | 'DAT_DAI' | 'XA_HOI' | 'KHAC';

type BookingItem = {
  id: string;
  code: string;
  field: BookingField;
  preferredDate: string;
  preferredTime: string;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  status: BookingStatus;
  description: string;
  rejectionReason?: string | null;
  rescheduledNote?: string | null;
};

const fieldIcons: Record<BookingField, string> = {
  HO_TICH: '📋',
  CU_TRU: '🏠',
  CHUNG_THUC: '📄',
  DAT_DAI: '🏗️',
  XA_HOI: '🤝',
  KHAC: '📌',
};

const fieldLabels: Record<BookingField, string> = {
  HO_TICH: 'Hộ tịch',
  CU_TRU: 'Cư trú',
  CHUNG_THUC: 'Chứng thực',
  DAT_DAI: 'Đất đai - Xây dựng',
  XA_HOI: 'Chính sách xã hội',
  KHAC: 'Vấn đề khác',
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Đã từ chối',
  RESCHEDULED: 'Đã dời lịch',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusBadge = (status: BookingStatus) => {
  if (status === 'PENDING') return 'badge-warning';
  if (status === 'CONFIRMED' || status === 'RESCHEDULED' || status === 'COMPLETED') return 'badge-success';
  return 'badge-danger';
};

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date(value));

const BookingIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await apiCall<BookingItem[]>('/api/bookings/me?page=1&limit=50');
      setBookings(data);
    } catch (error) {
      snackbar.openSnackbar({ type: 'error', text: error instanceof Error ? error.message : 'Không thể tải lịch hẹn' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await apiCall(`/api/bookings/${id}`, { method: 'DELETE' });
      snackbar.openSnackbar({ type: 'success', text: 'Đã hủy lịch hẹn thành công' });
      await loadBookings();
    } catch (error) {
      snackbar.openSnackbar({ type: 'error', text: error instanceof Error ? error.message : 'Không thể hủy lịch hẹn' });
    }
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', paddingBottom: '80px' }}>
      <PageHeader title="Đặt lịch tiếp dân" />
      <Box style={{ padding: '16px', paddingBottom: '160px' }}>
        <div className="animate-fade-in-up" style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #F3EEFF 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '14px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--gradient-hero)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Text style={{ fontSize: '20px' }}>🕐</Text>
          </div>
          <div>
            <Text style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>Giờ tiếp dân</Text>
            <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Thứ 2 - Thứ 6: 8:00 - 11:30 và 13:30 - 17:00
            </Text>
          </div>
        </div>

        <button
          onClick={() => navigate('/booking-create')}
          className="btn-gradient ripple-container animate-fade-in-up delay-100"
          style={{
            width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', marginBottom: '24px',
            borderRadius: 'var(--radius-md)', border: 'none'
          }}
        >
          + Đặt lịch mới
        </button>

        <div className="animate-fade-in-up delay-150" style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
          <Text className="section-title" style={{ flex: 1 }}>Lịch hẹn của bạn</Text>
          <div className="badge badge-primary">{bookings.length} lịch</div>
        </div>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((booking, idx) => {
            const dateText = `${formatDate(booking.confirmedDate || booking.preferredDate)} - ${booking.confirmedTime || booking.preferredTime}`;
            return (
              <div
                key={booking.id}
                className={`card-elevated animate-fade-in-up delay-${Math.min((idx + 2) * 50, 400)}`}
                style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', flexShrink: 0
                  }}>
                    {fieldIcons[booking.field]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{dateText}</Text>
                      <div className={`badge ${statusBadge(booking.status)}`}>
                        {statusLabels[booking.status]}
                      </div>
                    </div>
                    <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Lĩnh vực: {fieldLabels[booking.field]}
                    </Text>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã: {booking.code}</Text>
                    {booking.rejectionReason && (
                      <Text style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>Lý do: {booking.rejectionReason}</Text>
                    )}
                    {booking.rescheduledNote && (
                      <Text style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Ghi chú: {booking.rescheduledNote}</Text>
                    )}
                  </div>
                </div>
                
                {['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(booking.status) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                    <Button size="small" variant="secondary" style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }} onClick={() => handleCancel(booking.id)}>
                      Hủy lịch
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          
          {!loading && bookings.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
              <div className="animate-float" style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>📅</div>
              <Text style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Bạn chưa có lịch hẹn nào</Text>
              <Text style={{ color: 'var(--text-placeholder)', fontSize: '13px', marginTop: '4px' }}>
                Nhấn "Đặt lịch mới" để bắt đầu
              </Text>
            </Box>
          )}

          {loading && (
            <Text style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Đang tải lịch hẹn...</Text>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default BookingIndexPage;
