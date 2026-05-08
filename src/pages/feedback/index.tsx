import React, { useState } from 'react';
import { Page, Box, Text, Tabs } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useFeedbackStore } from '@/store/feedbackStore';

const statusConfig: Record<string, { gradient: string; icon: string; label: string }> = {
  pending:    { gradient: 'linear-gradient(135deg, #FFA500, #FF8C00)', icon: '⏳', label: 'Tiếp nhận' },
  processing: { gradient: 'linear-gradient(135deg, #246BFD, #5089FD)', icon: '🔄', label: 'Đang xử lý' },
  resolved:   { gradient: 'linear-gradient(135deg, #10B981, #059669)', icon: '✅', label: 'Đã giải quyết' },
};

const FeedbackIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mine');
  
  const feedbacks = useFeedbackStore(state => state.feedbacks);
  const resolvedFeedbacks = useFeedbackStore(state => state.resolvedFeedbacks);

  const list = activeTab === 'mine' ? feedbacks : resolvedFeedbacks;

  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
  const processingCount = feedbacks.filter(f => f.status === 'processing').length;
  const resolvedCount = resolvedFeedbacks.length;

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Phản ánh hiện trường" />

      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '160px' }}>
        {/* Stats Banner */}
        <div className="animate-fade-in-up" style={{
          margin: '12px 16px', padding: '16px 20px',
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', justifyContent: 'space-around',
          boxShadow: 'var(--shadow-glow)'
        }}>
          {[
            { count: pendingCount, label: 'Chờ xử lý', icon: '⏳' },
            { count: processingCount, label: 'Đang xử lý', icon: '🔄' },
            { count: resolvedCount, label: 'Đã xong', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '11px', marginBottom: '4px' }}>{stat.icon}</Text>
              <Text style={{ color: '#fff', fontWeight: 800, fontSize: '22px', lineHeight: '1' }}>{stat.count}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 500, marginTop: '4px' }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        <Tabs id="feedback-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="mine" label="Của tôi" />
          <Tabs.Tab key="resolved" label="Đã giải quyết" />
        </Tabs>

        <Box style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((item, idx) => {
            const config = statusConfig[item.status] || statusConfig.pending;
            return (
              <div
                key={item.id}
                onClick={() => navigate('/feedback-detail', { state: { id: item.id } })}
                className={`card active-scale animate-fade-in-up delay-${Math.min((idx + 1) * 50, 300)}`}
                style={{
                  display: 'flex', gap: '12px', padding: '14px',
                  borderLeft: '4px solid transparent',
                  borderImage: `${config.gradient} 1`,
                  cursor: 'pointer'
                }}
              >
                {item.thumb ? (
                  <img src={item.thumb} alt={item.title} style={{
                    width: '64px', height: '64px', objectFit: 'cover',
                    borderRadius: 'var(--radius-md)', flexShrink: 0
                  }} />
                ) : (
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: 'var(--gradient-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    {config.icon}
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <Text style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.code}</Text>
                    <div className={`badge badge-${item.status === 'resolved' ? 'success' : item.status === 'processing' ? 'primary' : 'warning'}`}>
                      {item.statusText}
                    </div>
                  </div>
                  <Text style={{
                    fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'auto' }}>{item.date}</Text>
                </div>
              </div>
            );
          })}
          
          {list.length === 0 && (
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
              <div className="animate-float" style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>📭</div>
              <Text style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                {activeTab === 'mine' ? 'Bạn chưa có phản ánh nào' : 'Chưa có phản ánh đã giải quyết'}
              </Text>
              <Text style={{ color: 'var(--text-placeholder)', fontSize: '13px', marginTop: '4px' }}>
                Nhấn nút + để tạo phản ánh mới
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* FAB */}
      <div
        onClick={() => navigate('/feedback-create')}
        className="fab active-scale animate-bounce-in delay-300"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </Page>
  );
};

export default FeedbackIndexPage;
