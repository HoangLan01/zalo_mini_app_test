import React from 'react';
import { Page, Box, Text, ImageViewer } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';

const FeedbackDetailPage: React.FC = () => {
  const feedback = {
    code: 'PA-2026-0042',
    title: 'Hệ thống đèn đường ngõ 12 bị hỏng',
    status: 'processing',
    statusText: 'Đang xử lý',
    statusColor: '#246BFD',
    category: 'Hạ tầng - Đường sá',
    date: '20/04/2026 14:30',
    desc: 'Từ hôm qua, toàn bộ bóng đèn đường đoạn từ đầu ngõ 12 đến nhà số 45 đều không sáng. Đường rất tối và nguy hiểm cho người tham gia giao thông. Đề nghị cơ quan chức năng kiểm tra và khắc phục sớm.',
    images: [
      'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800',
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800'
    ],
    address: 'Ngõ 12, Phường Tùng Thiện',
    response: {
      content: 'Chính quyền phường đã cử cán bộ kỹ thuật kiểm tra và tiến hành thay thế bóng đèn bị cháy. Dự kiến sẽ hoàn thành trong tối nay.',
      date: '21/04/2026 09:15'
    }
  };

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết phản ánh" />
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '160px' }}>
        {/* Main Card */}
        <div className="card-elevated animate-fade-in-up" style={{ padding: '18px', borderRadius: 'var(--radius-xl)', marginBottom: '16px' }}>
          {/* Status + Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className="badge badge-primary">
              🔄 {feedback.statusText}
            </div>
            <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{feedback.code}</Text>
          </div>

          {/* Title */}
          <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.01em', lineHeight: '1.4' }}>
            {feedback.title}
          </Text>
          
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{feedback.category}</Text>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }} />
            <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{feedback.date}</Text>
          </div>

          {/* Divider */}
          <div className="divider-gradient" style={{ marginBottom: '16px' }} />

          {/* Description */}
          <Text style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
            {feedback.desc}
          </Text>

          {/* Images */}
          {feedback.images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {feedback.images.map((img, idx) => (
                <img key={idx} src={img} alt="Đính kèm" style={{
                  width: '100%', aspectRatio: '1', objectFit: 'cover',
                  borderRadius: 'var(--radius-md)'
                }} />
              ))}
            </div>
          )}

          {/* Location */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px', borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)'
          }}>
            <Text style={{ fontSize: '16px' }}>📍</Text>
            <Text style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500 }}>{feedback.address}</Text>
          </div>
        </div>

        {/* Response Section */}
        <Text className="section-title animate-fade-in-up delay-100" style={{ marginBottom: '12px', marginLeft: '4px' }}>
          Phản hồi từ phường
        </Text>
        <div className="animate-fade-in-up delay-150" style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #F0F4FF 100%)',
          borderLeft: '4px solid var(--primary)',
          padding: '16px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Text style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: '10px' }}>
            {feedback.response.content}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phản hồi lúc: {feedback.response.date}</Text>
          </div>
        </div>
      </Box>
    </Page>
  );
};

export default FeedbackDetailPage;
