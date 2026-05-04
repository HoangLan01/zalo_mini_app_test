import React from 'react';
import { Page, Box, Text, Button, Icon, useSnackbar, Modal } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useBookingStore } from '@/store/bookingStore';

const BookingIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const bookings = useBookingStore(state => state.bookings);
  const removeBooking = useBookingStore(state => state.removeBooking);

  const handleCancel = (id: string) => {
    // In a real app we might want to pop up a confirmation modal first
    removeBooking(id);
    snackbar.openSnackbar({ type: 'success', text: 'Đã huỷ lịch hẹn thành công' });
  };

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Đặt lịch tiếp dân" />
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px', padding: '16px' }}>
        
        {/* Banner */}
        <Box style={{ backgroundColor: '#E8F4FF', borderLeft: '4px solid #246BFD', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '14px', fontWeight: 600, color: '#246BFD', marginBottom: '4px' }}>Giờ tiếp dân:</Text>
          <Text style={{ fontSize: '14px', color: '#1A1A1A', lineHeight: '1.6' }}>Thứ 2 – Thứ 6: 8:00 – 11:30 và 13:30 – 17:00</Text>
        </Box>

        <Button fullWidth onClick={() => navigate('/booking-create')} style={{ marginBottom: '24px' }}>
          Đặt lịch mới
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', flex: 1 }}>Lịch hẹn của bạn</Text>
        </div>

        {/* List */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map(booking => (
            <div key={booking.id} style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{booking.dateStr}</Text>
                <div style={{ backgroundColor: `${booking.statusColor}20`, padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  <Text style={{ fontSize: '11px', fontWeight: 600, color: booking.statusColor }}>{booking.statusText}</Text>
                </div>
              </div>
              <Text style={{ fontSize: '14px', color: '#333333', marginBottom: '4px' }}>Lĩnh vực: {booking.category}</Text>
              <Text style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>Mã hẹn: {booking.code}</Text>
              
              {booking.status === 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E0E0E0', paddingTop: '12px' }}>
                  <Button size="small" variant="secondary" style={{ color: '#EF4444' }} onClick={() => handleCancel(booking.id)}>
                    Hủy lịch
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {bookings.length === 0 && (
             <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                 <Icon icon="zi-note" style={{ fontSize: '48px', color: '#CCCCCC', marginBottom: '16px' }} />
                 <Text style={{ color: '#888888' }}>Bạn chưa có lịch hẹn nào</Text>
             </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default BookingIndexPage;
