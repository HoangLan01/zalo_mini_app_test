import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Select, useSnackbar, DatePicker, Input } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useUserStore } from '@/store/userStore';
import { apiCall } from '@/services/api';
import { logDevError } from '@/utils/zaloHelper';

const timeSlots = [
  { value: '08:00', label: '8:00', period: 'Sang' },
  { value: '08:30', label: '8:30', period: 'Sang' },
  { value: '09:00', label: '9:00', period: 'Sang' },
  { value: '09:30', label: '9:30', period: 'Sang' },
  { value: '10:00', label: '10:00', period: 'Sang' },
  { value: '10:30', label: '10:30', period: 'Sang' },
  { value: '13:30', label: '13:30', period: 'Chieu' },
  { value: '14:00', label: '14:00', period: 'Chieu' },
  { value: '14:30', label: '14:30', period: 'Chieu' },
  { value: '15:00', label: '15:00', period: 'Chieu' },
  { value: '15:30', label: '15:30', period: 'Chieu' },
  { value: '16:00', label: '16:00', period: 'Chieu' },
  { value: '16:30', label: '16:30', period: 'Chieu' },
];

const categoryOptions = [
  { value: 'HO_TICH', label: 'Hộ tịch (khai sinh, khai tử...)' },
  { value: 'CU_TRU', label: 'Cư trú (đăng ký tạm trú...)' },
  { value: 'CHUNG_THUC', label: 'Chứng thực giấy tờ' },
  { value: 'DAT_DAI', label: 'Đất đai - Xây dựng' },
  { value: 'XA_HOI', label: 'Chính sách xã hội' },
  { value: 'KHAC', label: 'Vấn đề khác' }
];

const formatApiDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { userInfo, fetchUser } = useUserStore();
  
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      fetchUser();
    } else {
      setUserName(userInfo.name);
    }
  }, [userInfo, fetchUser]);

  const handleSubmit = async () => {
    if (!userName.trim() || !phone.trim() || !category || !time || !description.trim()) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    if (!/^\d{10,11}$/.test(phone.trim())) {
      snackbar.openSnackbar({ type: 'warning', text: 'Số điện thoại không hợp lệ!' });
      return;
    }

    if (description.trim().length < 10) {
      snackbar.openSnackbar({ type: 'warning', text: 'Nội dung cần tư vấn tối thiểu 10 ký tự.' });
      return;
    }
    
    setLoading(true);
    
    try {
      await apiCall('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          field: category,
          preferredDate: formatApiDate(date),
          preferredTime: time,
          description: description.trim(),
          contactName: userName.trim(),
          contactPhone: phone.trim()
        })
      });

      snackbar.openSnackbar({ type: 'success', text: 'Đặt lịch thành công! Cán bộ sẽ xác nhận lại qua Zalo.' });
      
      setTimeout(() => {
        navigate('/booking', { replace: true });
      }, 1000);
    } catch (error) {
      logDevError('Error in booking submission:', error);
      snackbar.openSnackbar({ type: 'error', text: error instanceof Error ? error.message : 'Không thể gửi thông tin đặt lịch. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const morningSlots = timeSlots.filter(s => s.period === 'Sang');
  const afternoonSlots = timeSlots.filter(s => s.period === 'Chieu');

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Đặt lịch mới" />

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px', backgroundColor: 'var(--surface-raised)' }}>
        <Box className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Họ và tên <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Input 
            placeholder="Nhập họ và tên" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Box>

        <Box className="animate-fade-in-up delay-50" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Số điện thoại <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Input 
            placeholder="Nhập số điện thoại liên hệ" 
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Box>

        <Box className="animate-fade-in-up delay-100" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Lĩnh vực cần tư vấn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Select 
            placeholder="Chọn lĩnh vực" 
            value={category}
            onChange={(val) => setCategory(String(val))}
            closeOnSelect={true}
          >
            {categoryOptions.map(option => (
              <Select.Option key={option.value} value={option.value} title={option.label} />
            ))}
          </Select>
        </Box>

        <Box className="animate-fade-in-up delay-150" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Ngày hẹn <span style={{ color: 'var(--danger)' }}>*</span>
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

        <Box className="animate-fade-in-up delay-200" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Khung giờ mong muốn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>

          <Text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Buổi sáng
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

          <Text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Buổi chiều
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
        </Box>

        <Box className="animate-fade-in-up delay-250" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
            Nội dung cần tư vấn <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <textarea
            placeholder="Nhập nội dung, hồ sơ hoặc vấn đề cần cán bộ hỗ trợ"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={{
              width: '100%',
              minHeight: '112px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface-raised)',
              resize: 'vertical'
            }}
          />
          <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '8px' }}>
            * Khung giờ hẹn chính xác sẽ được cán bộ duyệt và xác nhận qua Zalo.
          </Text>
        </Box>
      </Box>

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
          {loading ? 'Đang xử lý...' : 'Đặt lịch hẹn'}
        </button>
      </Box>
    </Page>
  );
};

export default BookingCreatePage;
