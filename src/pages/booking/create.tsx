import React, { useState } from 'react';
import { Page, Box, Text, Select, Button, useSnackbar, DatePicker } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { useBookingStore } from '@/store/bookingStore';

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

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        background: 'linear-gradient(180deg, #246BFD 0%, #0052CC 100%)', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '10px 16px', 
        paddingTop: 'calc(env(safe-area-inset-top, 0) + 10px)' 
      }}>
        <Text onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '16px', color: 'white' }}>Hủy</Text>
        <Text style={{ fontSize: '17px', fontWeight: 600, flex: 1, textAlign: 'center', color: 'white' }}>Đặt lịch mới</Text>
        <div style={{ width: '28px' }}></div>
      </div>
      
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', backgroundColor: '#FFFFFF' }}>
        
        {/* Lĩnh vực */}
        <Box style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Lĩnh vực cần tư vấn *</Text>
          <Select 
            placeholder="Chọn lĩnh vực" 
            value={category}
            onChange={(val) => setCategory(String(val))}
          >
            <Select.Option value="ho-tich" title="Hộ tịch (khai sinh, khai tử...)" />
            <Select.Option value="cu-tru" title="Cư trú (đăng ký tạm trú...)" />
            <Select.Option value="chung-thuc" title="Chứng thực giấy tờ" />
            <Select.Option value="dat-dai" title="Đất đai – Xây dựng" />
             <Select.Option value="xa-hoi" title="Chính sách xã hội" />
             <Select.Option value="khac" title="Vấn đề khác" />
          </Select>
        </Box>

        {/* Ngày hẹn */}
        <Box style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Ngày hẹn *</Text>
          <DatePicker 
            placeholder="Chọn ngày"
            value={date}
            onChange={(val, pickey) => setDate(val as Date)}
            mask
            maskClosable
            title="Chọn ngày"
          />
        </Box>

        {/* Giờ hẹn */}
        <Box style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Khung giờ mong muốn *</Text>
          <Select 
            placeholder="Chọn khung giờ" 
            value={time}
            onChange={(val) => setTime(String(val))}
          >
            <Select.Option value="08:00" title="8:00 – 8:30 sáng" />
            <Select.Option value="08:30" title="8:30 – 9:00 sáng" />
            <Select.Option value="09:00" title="9:00 – 9:30 sáng" />
            <Select.Option value="09:30" title="9:30 – 10:00 sáng" />
            <Select.Option value="10:00" title="10:00 – 10:30 sáng" />
            <Select.Option value="13:30" title="13:30 – 14:00 chiều" />
            <Select.Option value="14:00" title="14:00 – 14:30 chiều" />
            <Select.Option value="14:30" title="14:30 – 15:00 chiều" />
            <Select.Option value="15:00" title="15:00 – 15:30 chiều" />
            <Select.Option value="15:30" title="15:30 – 16:00 chiều" />
            <Select.Option value="16:00" title="16:00 – 16:30 chiều" />
            <Select.Option value="16:30" title="16:30 – 17:00 chiều" />
          </Select>
          <Text style={{ fontSize: '12px', color: '#888', marginTop: '8px', fontStyle: 'italic' }}>
            * Khung giờ hẹn chính xác sẽ được cán bộ duyệt và xác nhận qua Zalo.
          </Text>
        </Box>

      </Box>

      <Box style={{ padding: '16px', paddingBottom: '80px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <Button fullWidth onClick={handleSubmit} loading={loading}>
          Đặt lịch hẹn
        </Button>
      </Box>
    </Page>
  );
};

export default BookingCreatePage;
