import React, { useState, useEffect, useRef } from 'react';
import { Page, Box, Text, Input, Select, Button, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { openChat, chooseImage } from 'zmp-sdk/apis';
import PageHeader from '@/components/PageHeader';
import { useUserStore } from '@/store/userStore';
import { logDevError, requestPhoneNumber } from '@/utils/zaloHelper';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { userInfo, fetchUser } = useUserStore();
  
  const [phoneNumber, setPhoneNumber] = useState('Đang lấy...');
  const [phoneNumberToken, setPhoneNumberToken] = useState('');
  const [userName, setUserName] = useState('');
  const [unit, setUnit] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Drag and Drop state for Virtual Assistant
  const [botPos, setBotPos] = useState({ x: window.innerWidth - 70, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [botVisible, setBotVisible] = useState(true);
  const dragItem = useRef<any>(null);
  const botRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userInfo) {
      fetchUser();
    } else {
      setUserName(userInfo.name);
    }
  }, [userInfo, fetchUser]);

  useEffect(() => {
    const getPhone = async () => {
      try {
        const token = await requestPhoneNumber();
        if (token) {
          setPhoneNumber('Đã xác thực qua Zalo');
          setPhoneNumberToken(token);
        } else {
          setPhoneNumber('Chưa xác thực');
        }
      } catch (error) {
        setPhoneNumber('Lỗi xác thực');
      }
    };
    getPhone();
  }, []);

  const handlePickImages = async () => {
    try {
      const { filePaths } = await chooseImage({ count: 3, sourceType: ['album', 'camera'] });
      setImages([...images, ...filePaths].slice(0, 3));
    } catch (e) {
      logDevError('Error picking review images:', e);
    }
  };

  const handleOpenOA = async () => {
    try {
      await openChat({
        type: 'oa',
        id: import.meta.env.VITE_ZALO_OA_ID,
        message: 'Xin chào, tôi cần hỗ trợ về dịch vụ công',
      });
    } catch (error) {
      const oaId = import.meta.env.VITE_ZALO_OA_ID;
      window.open(`https://zalo.me/${oaId}`, '_blank');
    }
  };

  const handleSubmit = async () => {
    if (!unit) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng chọn tổ đơn vị' });
      return;
    }
    if (rating === 0) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng chọn mức độ đánh giá' });
      return;
    }
    if (!content.trim()) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng nhập nội dung đánh giá' });
      return;
    }

    setSubmitting(true);
    
    const ratingTexts = ['Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
    const message = `[ĐÁNH GIÁ MỚI]
- Người gửi: ${userName || 'Ẩn danh'}
- SĐT: ${phoneNumber}
- Đơn vị: ${unit}
- Mức độ: ${rating} sao (${ratingTexts[rating - 1]})
- Nội dung: ${content}`;

    try {
      await openChat({
        type: 'oa',
        id: import.meta.env.VITE_ZALO_OA_ID,
        message: message,
      });
      
      snackbar.openSnackbar({ type: 'success', text: 'Đánh giá đã được gửi thành công!' });
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (error) {
      logDevError('Error sending review to OA:', error);
      snackbar.openSnackbar({ type: 'error', text: 'Không thể gửi đánh giá. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Drag Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragItem.current = {
      offsetX: touch.clientX - botPos.x,
      offsetY: touch.clientY - botPos.y
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    // Boundary checks (keep on screen)
    let newX = touch.clientX - dragItem.current.offsetX;
    let newY = touch.clientY - dragItem.current.offsetY;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
    
    setBotPos({ x: newX, y: newY });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    
    // Check if dropped in "Delete" area
    // "X" button is at bottom: 100px, left: 50%
    // Let's assume the button is around 50x50 size
    const deleteAreaX = window.innerWidth / 2;
    const deleteAreaY = window.innerHeight - 100; // bottom: 100px
    
    const dist = Math.sqrt(
      Math.pow(botPos.x + 30 - deleteAreaX, 2) + 
      Math.pow(botPos.y + 30 - deleteAreaY, 2)
    );
    
    if (dist < 60) {
      setBotVisible(false);
      snackbar.openSnackbar({ type: 'info', text: 'Đã ẩn Trợ lý ảo' });
    }
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Đánh giá" />

      {/* Main Content with Padding at bottom to avoid overlap with floating button */}
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '120px', backgroundColor: 'var(--surface-raised)' }}>
        {/* Phone Number */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Số điện thoại
          </Text>
          <Input 
            value={phoneNumber}
            disabled
            style={{ backgroundColor: '#F0F2F5', color: '#1C1C1E' }}
          />
        </Box>

        {/* User Name */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Tên của bạn
          </Text>
          <Input 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nhập tên của bạn"
            style={{ backgroundColor: userName ? '#F0F2F5' : 'white' }}
          />
        </Box>

        {/* Unit */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Tổ đơn vị <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Select 
            placeholder="Tổ đơn vị" 
            value={unit}
            onChange={(val) => setUnit(String(val))}
            closeOnSelect={true}
          >
            <Select.Option value="Tư pháp hộ tịch" title="Tư pháp hộ tịch" />
            <Select.Option value="Tư pháp chứng thực" title="Tư pháp chứng thực" />
            <Select.Option value="Lao động TBXH" title="Lao động TBXH" />
            <Select.Option value="Văn hoá thông tin" title="Văn hoá thông tin" />
            <Select.Option value="Tài nguyên môi trường" title="Tài nguyên môi trường" />
            <Select.Option value="Đô thị xây dựng" title="Đô thị xây dựng" />
            <Select.Option value="Phòng Văn hoá - Xã hội" title="Phòng Văn hoá - Xã hội" />
            <Select.Option value="Phòng Kinh tế, hạ tầng, đô thị" title="Phòng Kinh tế, hạ tầng, đô thị" />
            <Select.Option value="Văn phòng" title="Văn phòng" />
            <Select.Option value="Công an phường" title="Công an phường" />
            <Select.Option value="Quân sự phường" title="Quân sự phường" />
          </Select>
        </Box>

        {/* Rating */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Đánh giá <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '10px 0' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <div 
                key={star} 
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill={star <= rating ? '#FFC107' : '#E0E0E0'}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
            ))}
          </div>
        </Box>

        {/* Content */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Nội dung đánh giá <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Input.TextArea 
            placeholder="Nội dung đánh giá" 
            maxLength={1000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            showCount
          />
        </Box>

        {/* Images */}
        <Box style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Hình ảnh
          </Text>
          <div style={{ display: 'flex', gap: '10px' }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt="attachment" style={{
                  width: '80px', height: '80px', objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'
                }} />
                <div 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '50%', width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              </div>
            ))}
            {images.length < 3 && (
              <div 
                onClick={handlePickImages}
                style={{
                  width: '80px', height: '80px',
                  border: '1px dashed #A0AEC0',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#A0AEC0', cursor: 'pointer',
                  backgroundColor: '#FAFAFA'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            )}
          </div>
        </Box>
      </Box>

      {/* Submit Button - Floating above bottom bar or padded */}
      <Box style={{ 
        padding: '16px', 
        paddingBottom: '90px', // Increased padding to avoid bottom bar covering it
        backgroundColor: 'white', 
        borderTop: '1px solid var(--border-light)',
        position: 'relative',
        zIndex: 10
      }}>
        <Button
          fullWidth
          onClick={handleSubmit}
          loading={submitting}
          style={{ backgroundColor: '#006AF5', color: 'white', fontWeight: 600 }}
        >
          Gửi phản ánh
        </Button>
      </Box>

      {/* Draggable Virtual Assistant */}
      {botVisible && (
        <div 
          ref={botRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => {
            if (!isDragging) handleOpenOA();
          }}
          style={{
            position: 'fixed',
            left: `${botPos.x}px`,
            top: `${botPos.y}px`,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'grab',
            background: '#FFF0F5',
            padding: '8px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: isDragging ? 'none' : 'all 0.1s ease',
            touchAction: 'none' // Prevent scrolling while dragging
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M12 7v4M8 15h.01M16 15h.01"/>
          </svg>
          <Text style={{ fontSize: '10px', color: '#E91E63', fontWeight: 600, marginTop: '2px' }}>Trợ lý ảo</Text>
        </div>
      )}

      {/* Delete Area (X Button) - Appears when dragging */}
      {isDragging && botVisible && (
        <div 
          style={{
            position: 'fixed',
            bottom: '100px', // Floats ABOVE the bottom bar
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 59, 48, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      )}
    </Page>
  );
};

export default ReviewPage;
