import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Tabs, useLocation, useNavigate, useSnackbar } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { apiCall } from '@/services/api';

type FeedbackType = 'FIELD' | 'SERVICE_ATTITUDE';
type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'TRANSFERRED' | 'RESOLVED';
type FeedbackItem = {
  id: string;
  code: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  category: string;
  serviceUnit?: string | null;
  satisfactionScore?: number | null;
  imageUrls: string[];
  response?: string | null;
  createdAt: string;
};

const statusLabels: Record<FeedbackStatus, string> = {
  PENDING: 'Đang tiếp nhận',
  PROCESSING: 'Đang xử lý',
  TRANSFERRED: 'Đã chuyển đơn vị',
  RESOLVED: 'Đã giải quyết'
};

const typeLabels: Record<FeedbackType, string> = {
  FIELD: 'Hiện trường',
  SERVICE_ATTITUDE: 'Thái độ phục vụ'
};

const statusBadge = (status: FeedbackStatus) => {
  if (status === 'RESOLVED') return 'badge-success';
  if (status === 'PROCESSING') return 'badge-primary';
  return 'badge-warning';
};

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date(value));

const FeedbackIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const snackbar = useSnackbar();
  const [activeTab, setActiveTab] = useState('mine');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const selectedType = ((state as { type?: FeedbackType } | undefined)?.type || 'FIELD') as FeedbackType;

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await apiCall<FeedbackItem[]>('/api/feedbacks/me?page=1&limit=20');
      setFeedbacks(data);
    } catch (err) {
      snackbar.openSnackbar({ type: 'error', text: err instanceof Error ? err.message : 'Không thể tải danh sách phản ánh' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const visibleFeedbacks = activeTab === 'resolved'
    ? feedbacks.filter(item => item.status === 'RESOLVED')
    : feedbacks.filter(item => item.status !== 'RESOLVED');

  const pendingCount = feedbacks.filter(item => item.status === 'PENDING').length;
  const processingCount = feedbacks.filter(item => item.status === 'PROCESSING').length;
  const resolvedCount = feedbacks.filter(item => item.status === 'RESOLVED').length;

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', paddingBottom: '80px' }}>
      <PageHeader title="Phản ánh, kiến nghị" />

      <Box style={{ paddingBottom: '160px' }}>
        <div style={{
          margin: '12px 16px',
          padding: '16px 20px',
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-around',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {[
            { count: pendingCount, label: 'Chờ xử lý' },
            { count: processingCount, label: 'Đang xử lý' },
            { count: resolvedCount, label: 'Đã xong' }
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 800, fontSize: '22px', lineHeight: '1' }}>{stat.count}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        <Tabs id="feedback-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="mine" label="Đang xử lý" />
          <Tabs.Tab key="resolved" label="Đã giải quyết" />
        </Tabs>

        <Box style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleFeedbacks.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => navigate('/feedback-detail', { state: { id: item.id } })}
              className={`card active-scale animate-fade-in-up delay-${Math.min((idx + 1) * 50, 300)}`}
              style={{ display: 'flex', gap: '12px', padding: '14px', cursor: 'pointer' }}
            >
              {item.imageUrls?.[0] ? (
                <img src={item.imageUrls[0]} alt={item.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', flexShrink: 0, background: 'var(--gradient-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                  {item.type === 'SERVICE_ATTITUDE' ? `${item.satisfactionScore || 0}*` : 'PA'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.code}</Text>
                  <div className={`badge ${statusBadge(item.status)}`}>{statusLabels[item.status]}</div>
                </div>
                <Text style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{typeLabels[item.type]}</Text>
                <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(item.createdAt)}</Text>
              </div>
            </div>
          ))}

          {!loading && visibleFeedbacks.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
              <Text style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Chưa có phản ánh nào</Text>
              <Text style={{ color: 'var(--text-placeholder)', fontSize: '13px', marginTop: '4px' }}>Nhấn nút + để tạo phản ánh mới</Text>
            </Box>
          )}

          {loading && <Text style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Đang tải phản ánh...</Text>}
        </Box>
      </Box>

      <div
        onClick={() => navigate('/feedback-create', { state: { type: selectedType } })}
        className="fab active-scale animate-bounce-in delay-300"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    </Page>
  );
};

export default FeedbackIndexPage;
