import React, { useState } from 'react';
import { Page, Box, Text, Select, Button, useSnackbar, DatePicker } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useBookingStore } from '@/store/bookingStore';

const timeSlots = [
  { value: '08:00', label: '8:00', period: 'Sáng' },
  { value: '08:30', label: '8:30', period: 'Sáng' },
  { value: '09:00', label: '9:00', period: 'Sáng' },
  { value: '09:30', label: '9:30', period: 'Sáng' },
  { value: '10:00', label: '10:00', period: 'Sáng' },
  { value: '10:30', label: '10:30', period: 'Sáng' },
  { value: '13:30', label: '13:30', period: 'Chiều' },
  { value: '14:00', label: '14:00', period: 'Chiều' },
  { value: '14:30', label: '14:30', period: 'Chiều' },
  { value: '15:00', label: '15:00', period: 'Chiều' },
  { value: '15:30', label: '15:30', period: 'Chiều' },
  { value: '16:00', label: '16:00', period: 'Chiều' },
  { value: '16:30', label: '16:30', period: 'Chiều' },
];

const BookingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const addBooking = useBookingStore(state => state.addBooking);
  
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!category || !time) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        code: `LH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        dateStr: `${date.toLocaleDateString('vi-VN')} - ${time}`,
        category,
        status: 'pending',
        statusText: 'Chờ xác nhận',
        statusColor: '#FFA500'
      };
      
      addBooking(newBooking);
      
      snackbar.openSnackbar({ type: 'success', text: 'Đặt lịch thành công! Cán bộ sẽ xác nhận lại qua Zalo.' });
      navigate('/booking', { replace: true });
    }, 1500);
  };

  const morningSlots = timeSlots.filter(s => s.period === 'Sáng');
  const afternoonSlots = timeSlots.filter(s => s.period === 'Chiều');

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Đặt lịch mới" />

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px', backgroundColor: 'var(--surface-raised)' }}>
        
        {/* Category */}
        <Box className="animate-fade-in-up" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', fontSize: '15px' }}>
            🗂️ Lĩnh vực cần tư vấn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Select 
            placeholder="Chọn lĩnh vực" 
            value={category}
            onChange={(val) => setCategory(String(val))}
            closeOnSelect={true}
          >
            <Select.Option value="ho-tich" title="Hộ tịch (khai sinh, khai tử...)" />
            <Select.Option value="cu-tru" title="Cư trú (đăng ký tạm trú...)" />
            <Select.Option value="chung-thuc" title="Chứng thực giấy tờ" />
            <Select.Option value="dat-dai" title="Đất đai – Xây dựng" />
            <Select.Option value="xa-hoi" title="Chính sách xã hội" />
            <Select.Option value="khac" title="Vấn đề khác" />
          </Select>
        </Box>

        {/* Date */}
        <Box className="animate-fade-in-up delay-50" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', fontSize: '15px' }}>
            📅 Ngày hẹn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <DatePicker 
            placeholder="Chọn ngày"
            value={date}
            onChange={(val) => setDate(val as Date)}
            mask
            maskClosable
            title="Chọn ngày"
          />
        </Box>

        {/* Time Slots Grid */}
        <Box className="animate-fade-in-up delay-100" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', fontSize: '15px' }}>
            ⏰ Khung giờ mong muốn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>

          {/* Morning */}
          <Text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🌅 Buổi sáng
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {morningSlots.map(slot => (
              <div
                key={slot.value}
                onClick={() => setTime(slot.value)}
                className="active-scale"
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: time === slot.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: time === slot.value ? 'var(--primary-light)' : 'var(--surface-raised)',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Text style={{
                  fontWeight: 700, fontSize: '14px',
                  color: time === slot.value ? 'var(--primary)' : 'var(--text-primary)'
                }}>
                  {slot.label}
                </Text>
              </div>
            ))}
          </div>

          {/* Afternoon */}
          <Text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🌇 Buổi chiều
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {afternoonSlots.map(slot => (
              <div
                key={slot.value}
                onClick={() => setTime(slot.value)}
                className="active-scale"
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: time === slot.value ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: time === slot.value ? 'var(--primary-light)' : 'var(--surface-raised)',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Text style={{
                  fontWeight: 700, fontSize: '14px',
                  color: time === slot.value ? 'var(--primary)' : 'var(--text-primary)'
                }}>
                  {slot.label}
                </Text>
              </div>
            ))}
          </div>

          <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            * Khung giờ hẹn chính xác sẽ được cán bộ duyệt và xác nhận qua Zalo.
          </Text>
        </Box>
      </Box>

      {/* Submit */}
      <Box style={{ padding: '16px', paddingBottom: '80px', backgroundColor: 'var(--surface-raised)', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-gradient ripple-container"
          style={{
            width: '100%', padding: '14px',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '⏳ Đang xử lý...' : '📅 Đặt lịch hẹn'}
        </button>
      </Box>
    </Page>
  );
};

export default BookingCreatePage;
