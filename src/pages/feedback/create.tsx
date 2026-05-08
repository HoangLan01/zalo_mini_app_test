import React, { useState } from 'react';
import { Page, Box, Text, Input, Select, Button, useSnackbar } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { getLocation, chooseImage, authorize } from 'zmp-sdk/apis';
import PageHeader from '@/components/PageHeader';
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
      await authorize({ scopes: ['scope.userLocation'] });
      const { latitude, longitude } = await getLocation({});
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

  // Step progress
  const step1Done = title.length >= 10 && category !== '';
  const step2Done = desc.length >= 20;

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Tạo phản ánh" />

      {/* Progress Steps */}
      <div className="animate-fade-in-up" style={{
        padding: '16px 20px', background: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step1Done ? 'var(--success)' : 'var(--gradient-hero)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '12px', fontWeight: 700
          }}>
            {step1Done ? '✓' : '1'}
          </div>
          <div style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: step1Done ? 'var(--success)' : 'var(--border)'
          }} />
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: step2Done ? 'var(--success)' : step1Done ? 'var(--gradient-hero)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: step1Done ? '#fff' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700
          }}>
            {step2Done ? '✓' : '2'}
          </div>
          <div style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: step2Done ? 'var(--success)' : 'var(--border)'
          }} />
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700
          }}>
            3
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <Text style={{ fontSize: '10px', color: step1Done ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>Thông tin</Text>
          <Text style={{ fontSize: '10px', color: step2Done ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>Mô tả</Text>
          <Text style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Gửi</Text>
        </div>
      </div>

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', backgroundColor: 'var(--surface-raised)' }}>
        {/* Title */}
        <Box className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            📝 Tiêu đề <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Input 
            placeholder="Mô tả ngắn gọn vấn đề cần phản ánh" 
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

        {/* Category */}
        <Box className="animate-fade-in-up delay-50" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            📋 Danh mục <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
          <Select 
            placeholder="Chọn danh mục" 
            value={category}
            onChange={(val) => setCategory(String(val))}
            closeOnSelect={true}
          >
            <Select.Option value="ha-tang" title="Hạ tầng – Đường sá" />
            <Select.Option value="ve-sinh" title="Vệ sinh môi trường" />
            <Select.Option value="trat-tu" title="Trật tự đô thị" />
            <Select.Option value="an-ninh" title="An ninh – Trật tự" />
            <Select.Option value="khac" title="Vấn đề khác" />
          </Select>
        </Box>

        {/* Desc */}
        <Box className="animate-fade-in-up delay-100" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            💬 Mô tả chi tiết <span style={{ color: 'var(--danger)' }}>*</span>
          </Text>
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
        <Box className="animate-fade-in-up delay-150" style={{ marginBottom: '20px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            📸 Ảnh đính kèm <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(tối đa 3)</span>
          </Text>
          <div style={{ display: 'flex', gap: '10px' }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt="attachment" style={{
                  width: '80px', height: '80px', objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)'
                }} />
                <div 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              </div>
            ))}
            {images.length < 3 && (
              <div 
                onClick={handlePickImages}
                className="active-scale"
                style={{
                  width: '80px', height: '80px',
                  border: '2px dashed var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', cursor: 'pointer',
                  background: 'var(--primary-light)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <Text style={{ fontSize: '10px', fontWeight: 600, marginTop: '4px', color: 'var(--primary)' }}>Thêm ảnh</Text>
              </div>
            )}
          </div>
        </Box>

        {/* Location */}
        <Box className="animate-fade-in-up delay-200" style={{ marginBottom: '24px' }}>
          <Text style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>📍 Vị trí</Text>
          {locationObj ? (
            <div style={{
              padding: '12px', borderRadius: 'var(--radius-md)',
              background: 'var(--success-light)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Text style={{ fontSize: '16px' }}>✅</Text>
              <Text style={{ color: 'var(--success)', fontWeight: 500, fontSize: '13px' }}>
                Đã lấy vị trí (lat: {locationObj.latitude.toFixed(4)}, lng: {locationObj.longitude.toFixed(4)})
              </Text>
            </div>
          ) : (
            <button
              onClick={fetchLocation}
              disabled={loadingLocation}
              style={{
                width: '100%', padding: '12px',
                border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent', color: 'var(--primary)',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer'
              }}
            >
              {loadingLocation ? '⏳ Đang lấy vị trí...' : '📍 Lấy vị trí hiện tại'}
            </button>
          )}
        </Box>
      </Box>

      {/* Submit */}
      <Box style={{ padding: '16px', paddingBottom: '80px', backgroundColor: 'var(--surface-raised)', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-gradient ripple-container"
          style={{
            width: '100%', padding: '14px',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? '⏳ Đang gửi...' : '🚀 Gửi phản ánh'}
        </button>
      </Box>
    </Page>
  );
};

export default FeedbackCreatePage;
