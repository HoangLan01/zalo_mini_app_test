import React from 'react';
import { Page, Box, Text, ImageViewer } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';

const FeedbackDetailPage: React.FC = () => {
  const feedback = {
    code: 'PA-2026-0042',
    title: 'Hệ thống đèn đường ngõ 12 bị hỏng',
    status: 'processing',
    statusText: 'Đang xử lý',
    statusColor: '#0068FF',
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
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết phản ánh" />
      <Box style={{ flex: 1, overflow: 'auto', padding: '16px', paddingBottom: '80px' }}>
        <Box style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ backgroundColor: `${feedback.statusColor}20`, padding: '4px 12px', borderRadius: '16px' }}>
              <Text style={{ fontSize: '13px', fontWeight: 600, color: feedback.statusColor }}>{feedback.statusText}</Text>
            </div>
            <Text style={{ fontSize: '12px', color: '#888888' }}>{feedback.code}</Text>
          </div>
          <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
            {feedback.title}
          </Text>
          <Text style={{ fontSize: '13px', color: '#888888', marginBottom: '16px' }}>
            {feedback.category} • {feedback.date}
          </Text>
          <div style={{ height: '1px', backgroundColor: '#E0E0E0', marginBottom: '16px' }} />
          
          <Text style={{ fontSize: '15px', color: '#333', lineHeight: '1.6', marginBottom: '16px' }}>
            {feedback.desc}
          </Text>

          {feedback.images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
               {feedback.images.map((img, idx) => (
                 <img key={idx} src={img} alt="Đính kèm" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} />
               ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <Text style={{ fontSize: '14px', color: '#1A1A1A' }}>{feedback.address}</Text>
          </div>
        </Box>

        {/* Response */}
        <Text style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px', marginLeft: '4px' }}>
          Phản hồi từ phường
        </Text>
        <Box style={{ backgroundColor: '#E8F4FF', borderLeft: '4px solid #0068FF', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Text style={{ fontSize: '14px', color: '#1A1A1A', lineHeight: '1.6', marginBottom: '8px' }}>
            {feedback.response.content}
          </Text>
          <Text style={{ fontSize: '12px', color: '#888888' }}>Phản hồi lúc: {feedback.response.date}</Text>
        </Box>
      </Box>
    </Page>
  );
};

export default FeedbackDetailPage;
