import React, { useState } from 'react';
import { Page, Box, Text, Input, Select, useLocation, useNavigate, useSnackbar } from 'zmp-ui';
import { getLocation, chooseImage, authorize } from 'zmp-sdk/apis';
import PageHeader from '@/components/PageHeader';
import { apiCall, uploadFeedbackImages } from '@/services/api';

type FeedbackType = 'FIELD' | 'SERVICE_ATTITUDE';
type FeedbackCategory = 'HA_TANG' | 'VE_SINH' | 'TRAT_TU' | 'AN_NINH' | 'KHAC';

const categoryOptions: Array<{ value: FeedbackCategory; label: string }> = [
  { value: 'HA_TANG', label: 'Hạ tầng - Đường sá' },
  { value: 'VE_SINH', label: 'Vệ sinh môi trường' },
  { value: 'TRAT_TU', label: 'Trật tự đô thị' },
  { value: 'AN_NINH', label: 'An ninh - Trật tự' },
  { value: 'KHAC', label: 'Vấn đề khác' }
];

const serviceUnits = [
  'Tư pháp hộ tịch',
  'Tư pháp chứng thực',
  'Lao động TBXH',
  'Văn hóa thông tin',
  'Tài nguyên môi trường',
  'Đô thị xây dựng',
  'Văn phòng',
  'Công an phường',
  'Quân sự phường'
];

const FeedbackCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { state } = useLocation();
  const type = ((state as { type?: FeedbackType } | undefined)?.type || 'FIELD') as FeedbackType;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [description, setDescription] = useState('');
  const [serviceUnit, setServiceUnit] = useState('');
  const [satisfactionScore, setSatisfactionScore] = useState(0);
  const [contactPhone, setContactPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [locationObj, setLocationObj] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isServiceAttitude = type === 'SERVICE_ATTITUDE';

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      await authorize({ scopes: ['scope.userLocation'] });
      const { latitude, longitude } = await getLocation({});
      setLocationObj({ latitude, longitude });
    } catch {
      snackbar.openSnackbar({ type: 'error', text: 'Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí.' });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handlePickImages = async () => {
    try {
      const { filePaths } = await chooseImage({ count: 3 - images.length, sourceType: ['album', 'camera'] });
      setImages([...images, ...filePaths].slice(0, 3));
    } catch {
      // User cancelled the picker.
    }
  };

  const validate = () => {
    if (!/^\d{10,11}$/.test(contactPhone.trim())) return 'Số điện thoại không hợp lệ';

    if (isServiceAttitude) {
      if (!serviceUnit.trim()) return 'Vui lòng chọn đơn vị';
      if (satisfactionScore < 1 || satisfactionScore > 5) return 'Vui lòng chọn mức đánh giá từ 1-5 sao';
      if (!description.trim()) return 'Vui lòng nhập nội dung phản ánh';
      return '';
    }

    if (title.trim().length < 10) return 'Tiêu đề cần tối thiểu 10 ký tự';
    if (!category) return 'Vui lòng chọn danh mục';
    if (description.trim().length < 20) return 'Mô tả cần tối thiểu 20 ký tự';
    return '';
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      snackbar.openSnackbar({ type: 'warning', text: error });
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = isServiceAttitude ? [] : await uploadFeedbackImages(images);
      await apiCall('/api/feedbacks', {
        method: 'POST',
        body: JSON.stringify(isServiceAttitude ? {
          type: 'SERVICE_ATTITUDE',
          serviceUnit: serviceUnit.trim(),
          satisfactionScore,
          contactPhone: contactPhone.trim(),
          description: description.trim()
        } : {
          type: 'FIELD',
          title: title.trim(),
          category,
          contactPhone: contactPhone.trim(),
          description: description.trim(),
          imageUrls,
          latitude: locationObj?.latitude,
          longitude: locationObj?.longitude
        })
      });

      snackbar.openSnackbar({ type: 'success', text: 'Đã gửi phản ánh thành công!' });
      navigate('/feedback', { replace: true, state: { type } });
    } catch (err) {
      snackbar.openSnackbar({ type: 'error', text: err instanceof Error ? err.message : 'Không thể gửi phản ánh' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={isServiceAttitude ? 'Phản ánh thái độ phục vụ' : 'Phản ánh hiện trường'} />

      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px', backgroundColor: 'var(--surface-raised)' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {isServiceAttitude ? (
            <>
              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
                  Đơn vị <span style={{ color: 'var(--danger)' }}>*</span>
                </Text>
                <Select placeholder="Chọn đơn vị" value={serviceUnit} onChange={(value) => setServiceUnit(String(value))} closeOnSelect>
                  {serviceUnits.map(unit => <Select.Option key={unit} value={unit} title={unit} />)}
                </Select>
              </Box>

              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
                  Mức độ hài lòng <span style={{ color: 'var(--danger)' }}>*</span>
                </Text>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '10px 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setSatisfactionScore(star)} style={{ background: 'transparent', border: 0, padding: 4 }}>
                      <svg width="42" height="42" viewBox="0 0 24 24" fill={star <= satisfactionScore ? '#FFC107' : '#D8DEE9'}>
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
                  Tiêu đề <span style={{ color: 'var(--danger)' }}>*</span>
                </Text>
                <Input placeholder="Mô tả ngắn gọn vấn đề cần phản ánh" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
              </Box>

              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
                  Danh mục <span style={{ color: 'var(--danger)' }}>*</span>
                </Text>
                <Select placeholder="Chọn danh mục" value={category} onChange={(value) => setCategory(String(value) as FeedbackCategory)} closeOnSelect>
                  {categoryOptions.map(option => <Select.Option key={option.value} value={option.value} title={option.label} />)}
                </Select>
              </Box>
            </>
          )}

          <Box>
            <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
              Số điện thoại liên hệ <span style={{ color: 'var(--danger)' }}>*</span>
            </Text>
            <Input
              placeholder="Nhập số điện thoại để cán bộ liên hệ lại"
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
            />
          </Box>

          <Box>
            <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
              Nội dung <span style={{ color: 'var(--danger)' }}>*</span>
            </Text>
            <Input.TextArea
              placeholder={isServiceAttitude ? 'Nhập nội dung phản ánh thái độ phục vụ...' : 'Mô tả đầy đủ vấn đề bạn muốn phản ánh...'}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              showCount
            />
          </Box>

          {!isServiceAttitude && (
            <>
              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>
                  Ảnh đính kèm <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(tối đa 3)</span>
                </Text>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {images.map((img, idx) => (
                    <div key={img} style={{ position: 'relative' }}>
                      <img src={img} alt="attachment" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: 'var(--danger)', color: '#fff' }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button
                      type="button"
                      onClick={handlePickImages}
                      style={{ width: 80, height: 80, border: '2px dashed var(--primary)', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}
                    >
                      Thêm ảnh
                    </button>
                  )}
                </div>
              </Box>

              <Box>
                <Text style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', fontSize: '15px' }}>Vị trí</Text>
                {locationObj ? (
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--success-light)' }}>
                    <Text style={{ color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>
                      Đã lấy vị trí ({locationObj.latitude.toFixed(4)}, {locationObj.longitude.toFixed(4)})
                    </Text>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={fetchLocation}
                    disabled={loadingLocation}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--primary)', fontWeight: 700 }}
                  >
                    {loadingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
                  </button>
                )}
              </Box>
            </>
          )}
        </div>
      </Box>

      <Box style={{ padding: '16px', paddingBottom: '80px', backgroundColor: 'var(--surface-raised)', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-gradient ripple-container"
          style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '15px', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Đang gửi...' : 'Gửi phản ánh'}
        </button>
      </Box>
    </Page>
  );
};

export default FeedbackCreatePage;
