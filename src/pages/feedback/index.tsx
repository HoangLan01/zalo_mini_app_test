import React, { useState } from 'react';
import { Page, Box, Text, Tabs, Icon } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useFeedbackStore } from '@/store/feedbackStore';

const FeedbackIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mine');
  
  const feedbacks = useFeedbackStore(state => state.feedbacks);
  const resolvedFeedbacks = useFeedbackStore(state => state.resolvedFeedbacks);

  const list = activeTab === 'mine' ? feedbacks : resolvedFeedbacks;

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ backgroundColor: '#0068FF', color: 'white', display: 'flex', alignItems: 'center', padding: '16px', paddingTop: 'env(safe-area-inset-top, 0)' }}>
        <div onClick={() => navigate(-1)} style={{ marginRight: '16px', cursor: 'pointer' }}>
          <Icon icon="zi-arrow-left" />
        </div>
        <Text style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>Phản ánh hiện trường</Text>
        <div onClick={() => navigate('/feedback-create')} style={{ cursor: 'pointer' }}>
          <Icon icon="zi-plus" />
        </div>
      </div>
      
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Tabs id="feedback-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="mine" label="Của tôi" />
          <Tabs.Tab key="resolved" label="Đã giải quyết" />
        </Tabs>

        <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {list.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate('/feedback-detail', { state: { id: item.id } })}
              style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              {item.thumb && (
                <img src={item.thumb} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <Text style={{ fontSize: '12px', color: '#888888' }}>{item.code}</Text>
                  <Text style={{ fontSize: '11px', fontWeight: 600, color: item.statusColor }}>{item.statusText}</Text>
                </div>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: '12px', color: '#888888', marginTop: 'auto' }}>{item.date}</Text>
              </div>
            </div>
          ))}
          
          {list.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
              <Icon icon="zi-list-1" style={{ fontSize: '48px', color: '#CCCCCC', marginBottom: '16px' }} />
              <Text style={{ color: '#888888' }}>Bạn chưa có phản ánh nào. Nhấn + để tạo mới.</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default FeedbackIndexPage;
