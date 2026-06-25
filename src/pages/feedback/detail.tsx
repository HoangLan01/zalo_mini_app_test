import React, { useEffect, useState } from 'react';
import { Page, Box, Text, useLocation, useSnackbar } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { apiCall } from '@/services/api';

type FeedbackType = 'FIELD' | 'SERVICE_ATTITUDE';
type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'TRANSFERRED' | 'RESOLVED';
type FeedbackDetail = {
  id: string;
  code: string;
  type: FeedbackType;
  title: string;
  category: string;
  serviceUnit?: string | null;
  satisfactionScore?: number | null;
  contactPhone?: string | null;
  description: string;
  imageUrls: string[];
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  status: FeedbackStatus;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

const statusLabels: Record<FeedbackStatus, string> = {
  PENDING: 'Đang tiếp nhận',
  PROCESSING: 'Đang xử lý',
  TRANSFERRED: 'Đã chuyển đơn vị',
  RESOLVED: 'Đã giải quyết',
};

const categoryLabels: Record<string, string> = {
  HA_TANG: 'Hạ tầng - Đường sá',
  VE_SINH: 'Vệ sinh môi trường',
  TRAT_TU: 'Trật tự đô thị',
  AN_NINH: 'An ninh - Trật tự',
  KHAC: 'Vấn đề khác',
};

const typeLabels: Record<FeedbackType, string> = {
  FIELD: 'Phản ánh hiện trường',
  SERVICE_ATTITUDE: 'Phản ánh thái độ phục vụ',
};

const statusBadge = (status: FeedbackStatus) => {
  if (status === 'RESOLVED') return 'badge-success';
  if (status === 'PROCESSING') return 'badge-primary';
  return 'badge-warning';
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '';

const FeedbackDetailPage: React.FC = () => {
  const { state } = useLocation();
  const snackbar = useSnackbar();
  const feedbackId = (state as { id?: string } | undefined)?.id;
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!feedbackId) return;
    setLoading(true);
    apiCall<FeedbackDetail>(`/api/feedbacks/${feedbackId}`)
      .then(setFeedback)
      .catch((err) =>
        snackbar.openSnackbar({ type: 'error', text: err instanceof Error ? err.message : 'Không thể tải phản ánh' })
      )
      .finally(() => setLoading(false));
  }, [feedbackId, snackbar]);

  const locationText =
    feedback?.address || (feedback?.latitude && feedback?.longitude ? `${feedback.latitude.toFixed(5)}, ${feedback.longitude.toFixed(5)}` : '');

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết phản ánh" />
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        {feedback && (
          <>
            <div className="card-elevated animate-fade-in-up" style={{ padding: '18px', borderRadius: 'var(--radius-xl)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <div className={`badge ${statusBadge(feedback.status)}`}>{statusLabels[feedback.status]}</div>
                <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{feedback.code}</Text>
              </div>

              <Text style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                {feedback.title}
              </Text>

              <div style={{ display: 'grid', gap: '5px', marginBottom: '16px' }}>
                <Text style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>{typeLabels[feedback.type]}</Text>
                {feedback.type === 'SERVICE_ATTITUDE' ? (
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {feedback.serviceUnit} - {feedback.satisfactionScore}/5 sao
                  </Text>
                ) : (
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{categoryLabels[feedback.category] || feedback.category}</Text>
                )}
                {feedback.contactPhone && (
                  <Text style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>SĐT liên hệ: {feedback.contactPhone}</Text>
                )}
                <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDateTime(feedback.createdAt)}</Text>
              </div>

              <div className="divider-gradient" style={{ marginBottom: '16px' }} />

              <Text style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>{feedback.description}</Text>

              {feedback.imageUrls?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {feedback.imageUrls.map((img) => (
                    <img key={img} src={img} alt="Đính kèm" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  ))}
                </div>
              )}

              {locationText && (
                <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)' }}>
                  <Text style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>{locationText}</Text>
                </div>
              )}
            </div>

            <Text className="section-title animate-fade-in-up delay-100" style={{ marginBottom: '12px', marginLeft: '4px' }}>
              Phản hồi từ phường
            </Text>
            <div
              style={{
                background: 'linear-gradient(135deg, #EEF4FF 0%, #F0F4FF 100%)',
                borderLeft: '4px solid var(--primary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Text style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: feedback.respondedAt ? '10px' : 0 }}>
                {feedback.response || 'Phản ánh đang được tiếp nhận và xử lý.'}
              </Text>
              {feedback.respondedAt && (
                <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phản hồi lúc: {formatDateTime(feedback.respondedAt)}</Text>
              )}
            </div>
          </>
        )}

        {loading && <Text style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Đang tải phản ánh...</Text>}
        {!loading && !feedback && <Text style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Không tìm thấy phản ánh</Text>}
      </Box>
    </Page>
  );
};

export default FeedbackDetailPage;
