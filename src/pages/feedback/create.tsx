import React, { useState } from 'react';
import { Page, Box, Text, Input, Select, Button, Icon, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { getLocation, chooseImage, authorize } from 'zmp-sdk/apis';
import { useFeedbackStore } from '@/store/feedbackStore';

const FeedbackCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const addFeedback = useFeedbackStore(state => state.addFeedback);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [locationObj, setLocationObj] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      // Yêu cầu quyền truy cập định vị trước
      await authorize({ scopes: ['scope.userLocation'] });
      
      const { latitude, longitude } = await getLocation({ type: 'wgs84' });
      setLocationObj({ latitude, longitude });
    } catch (e) {
      snackbar.openSnackbar({ type: 'error', text: 'Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.' });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const { filePaths } = await chooseImage({ count: 3, sourceType: ['album', 'camera'] });
      setImages([...images, ...filePaths].slice(0, 3));
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = () => {
    if (title.length < 10) {
      snackbar.openSnackbar({ type: 'warning', text: 'Tiêu đề cần tối thiểu 10 ký tự' });
      return;
    }
    if (!category || desc.length < 20) {
      snackbar.openSnackbar({ type: 'warning', text: 'Vui lòng chọn danh mục và nhập mô tả chi tiết' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      
      const newFeedback = {
        id: Math.random().toString(36).substr(2, 9),
        code: `PA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        status: 'pending',
        statusText: 'Đang tiếp nhận',
        statusColor: '#FFA500',
        date: new Date().toLocaleDateString('vi-VN'),
        thumb: images.length > 0 ? images[0] : undefined,
        category,
        desc
      };
      
      addFeedback(newFeedback);
      
      snackbar.openSnackbar({ type: 'success', text: 'Phản ánh đã được gửi thành công!' });
      navigate('/feedback', { replace: true });
    }, 1500);
  };

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#0068FF', color: 'white', display: 'flex', alignItems: 'center', padding: '16px', paddingTop: 'env(safe-area-inset-top, 0)' }}>
        <Text onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '16px' }}>Hủy</Text>
        <Text style={{ fontSize: '18px', fontWeight: 600, flex: 1, textAlign: 'center' }}>Tạo phản ánh</Text>
        <div style={{ width: '28px' }}></div>
      </div>
      
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', backgroundColor: '#FFFFFF' }}>
        {/* Title */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Tiêu đề *</Text>
          <Input 
            placeholder="Mô tả ngắn gọn vấn đề cần phản ánh" 
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        {/* Category */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Danh mục *</Text>
          <Select 
            placeholder="Chọn danh mục" 
            value={category}
            onChange={(val) => setCategory(String(val))}
          >
            <Select.Option value="ha-tang" title="Hạ tầng – Đường sá" />
            <Select.Option value="ve-sinh" title="Vệ sinh môi trường" />
            <Select.Option value="trat-tu" title="Trật tự đô thị" />
            <Select.Option value="an-ninh" title="An ninh – Trật tự" />
            <Select.Option value="khac" title="Vấn đề khác" />
          </Select>
        </Box>

        {/* Desc */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Mô tả chi tiết *</Text>
          <Input.TextArea 
            placeholder="Mô tả đầy đủ vấn đề bạn muốn phản ánh..." 
            maxLength={1000}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            showCount
          />
        </Box>

        {/* Images */}
        <Box style={{ marginBottom: '16px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Ảnh đính kèm</Text>
          <div style={{ display: 'flex', gap: '8px' }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt="attachment" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon icon="zi-close" size={12} />
                </div>
              </div>
            ))}
            {images.length < 3 && (
              <div 
                onClick={handlePickImages}
                style={{ width: '80px', height: '80px', border: '1px dashed #0068FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0068FF' }}
              >
                <Icon icon="zi-plus" />
              </div>
            )}
          </div>
        </Box>

        {/* Location */}
        <Box style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A1A' }}>Vị trí</Text>
          {locationObj ? (
            <Text style={{ color: '#0068FF' }}>📍 Đã lấy vị trí (lat: {locationObj.latitude.toFixed(4)}, lng: {locationObj.longitude.toFixed(4)})</Text>
          ) : (
            <Button variant="secondary" onClick={fetchLocation} loading={loadingLocation}>
              Lấy vị trí hiện tại
            </Button>
          )}
        </Box>
      </Box>

      <Box style={{ padding: '16px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <Button fullWidth onClick={handleSubmit} loading={submitting}>
          Gửi phản ánh
        </Button>
      </Box>
    </Page>
  );
};

export default FeedbackCreatePage;
