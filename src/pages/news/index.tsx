import React, { useState } from 'react';
import { Page, Box, Text, Tabs } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const NewsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const newsList = [
    { id: '1', title: 'UBND Phường Tùng Thiện triển khai số hóa...', category: 'Tin tức', date: '20/04/2026', thumb: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=160' },
    { id: '2', title: 'Thông báo: Lịch tiếp công dân tháng 5/2026', category: 'Thông báo', date: '19/04/2026', thumb: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=160' },
    { id: '3', title: 'Quyết định ban hành tiêu chuẩn đô thị văn minh', category: 'Văn bản', date: '15/04/2026', thumb: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=160' },
  ];

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Tin tức - Thông báo" />
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Tabs id="news-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="all" label="Tất cả" />
          <Tabs.Tab key="tin-tuc" label="Tin tức" />
          <Tabs.Tab key="thong-bao" label="Thông báo" />
          <Tabs.Tab key="van-ban" label="Văn bản" />
        </Tabs>

        <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {newsList.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('/news-detail', { state: { id: item.id } })}
              style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <img src={item.thumb} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </Text>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '12px', color: '#888888' }}>{item.date}</Text>
                  <div style={{ backgroundColor: '#E8F0FE', padding: '2px 8px', borderRadius: '12px' }}>
                    <Text style={{ fontSize: '12px', color: '#0068FF' }}>{item.category}</Text>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Box>
      </Box>
      <BottomNav />
    </Page>
  );
};

export default NewsIndexPage;
