import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';

const NewsDetailPage: React.FC = () => {
  const content = `
    <p>UBND Phường Tùng Thiện vừa chính thức công bố triển khai hệ thống thông tin kết nối người dân qua Zalo Mini App. Ứng dụng này nhằm mục đích đơn giản hóa các thủ tục hành chính, giúp người dân nắm bắt thông tin nhanh chóng.</p>
    <br/>
    <p>Mọi người dân có thể thực hiện gửi phản ánh hiện trường và đặt lịch hẹn một cách nhanh chóng ngay trên ứng dụng mà không cần phải tải thêm ứng dụng phụ nào khác.</p>
  `;

  return (
    <Page className="page" style={{ backgroundColor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết tin tức" />
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <img 
          src="https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800" 
          alt="Thumbnail" 
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
        />
        <Box style={{ padding: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
            UBND Phường Tùng Thiện triển khai số hóa hệ thống kết nối cư dân
          </Text>
          <Text style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>
            20/04/2026 • Tin tức
          </Text>
          <div style={{ height: '1px', backgroundColor: '#E0E0E0', marginBottom: '16px' }} />
          
          <div style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px' }} dangerouslySetInnerHTML={{ __html: content }} />
          
          <Button 
            variant="secondary" 
            fullWidth 
            style={{ marginTop: '32px' }}
            onClick={() => {
              // zmp-sdk share logic would go here
            }}
          >
            Chia sẻ cho bạn bè
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default NewsDetailPage;
