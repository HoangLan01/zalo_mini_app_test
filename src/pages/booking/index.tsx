import React from 'react';
import { Page, Box, Text, Button, Icon, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useBookingStore } from '@/store/bookingStore';

const fieldIcons: Record<string, string> = {
  'ho_tich': '📋', 'ho-tich': '📋',
  'cu_tru': '🏠', 'cu-tru': '🏠',
  'chung_thuc': '📄', 'chung-thuc': '📄',
  'dat_dai': '🏗️', 'dat-dai': '🏗️',
  'xa_hoi': '🤝', 'xa-hoi': '🤝',
  'khac': '📌',
};

const BookingIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const bookings = useBookingStore(state => state.bookings);
  const removeBooking = useBookingStore(state => state.removeBooking);

  const handleCancel = (id: string) => {
    removeBooking(id);
    snackbar.openSnackbar({ type: 'success', text: 'Đã huỷ lịch hẹn thành công' });
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', paddingBottom: '80px' }}>
      <PageHeader title="Đặt lịch tiếp dân" />
      <Box style={{ padding: '16px', paddingBottom: '160px' }}>
        
        {/* Info Banner — Gradient */}
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
              Thứ 2 – Thứ 6: 8:00 – 11:30 và 13:30 – 17:00
            </Text>
          </div>
        </div>

        {/* CTA Button */}
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

        {/* Section Title */}
        <div className="animate-fade-in-up delay-150" style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
          <Text className="section-title" style={{ flex: 1 }}>Lịch hẹn của bạn</Text>
          <div className="badge badge-primary">{bookings.length} lịch</div>
        </div>

        {/* Booking Cards */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((booking, idx) => (
            <div
              key={booking.id}
              className={`card-elevated animate-fade-in-up delay-${Math.min((idx + 2) * 50, 400)}`}
              style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}
            >
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                {/* Icon */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', flexShrink: 0
                }}>
                  {fieldIcons[booking.category] || '📌'}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{booking.dateStr}</Text>
                    <div className={`badge ${booking.status === 'pending' ? 'badge-warning' : booking.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                      {booking.statusText}
                    </div>
                  </div>
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    Lĩnh vực: {booking.category}
                  </Text>
                  <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã: {booking.code}</Text>
                </div>
              </div>
              
              {booking.status === 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <Button size="small" variant="secondary" style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600 }} onClick={() => handleCancel(booking.id)}>
                    Hủy lịch
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {bookings.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
              <div className="animate-float" style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>📅</div>
              <Text style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Bạn chưa có lịch hẹn nào</Text>
              <Text style={{ color: 'var(--text-placeholder)', fontSize: '13px', marginTop: '4px' }}>
                Nhấn "Đặt lịch mới" để bắt đầu
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default BookingIndexPage;
