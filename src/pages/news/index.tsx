import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Tabs } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { apiCall } from '@/services/api';

interface Article {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  publishedAt: string;
}

// Skeleton Card Component
const SkeletonCard = () => (
  <div style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)' }}>
    <div className="skeleton" style={{ width: '88px', height: '88px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton" style={{ height: '12px', width: '40%', marginTop: 'auto' }} />
    </div>
  </div>
);

const NewsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [newsList, setNewsList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [activeTab]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let categoryParam = '';
      if (activeTab === 'tin-tuc') categoryParam = 'Tin tức';
      else if (activeTab === 'thong-bao') categoryParam = 'Thông báo';
      else if (activeTab === 'van-ban') categoryParam = 'Văn bản';

      const url = `/api/news?page=1&limit=20${categoryParam ? `&category=${encodeURIComponent(categoryParam)}` : ''}`;
      const response = await apiCall<{ data: Article[] }>(url);
      setNewsList(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const featured = newsList.length > 0 ? newsList[0] : null;
  const restNews = newsList.slice(1);

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Tin tức - Thông báo" />
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '160px' }}>
        <Tabs id="news-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="all" label="Tất cả" />
          <Tabs.Tab key="tin-tuc" label="Tin tức" />
          <Tabs.Tab key="thong-bao" label="Thông báo" />
          <Tabs.Tab key="van-ban" label="Văn bản" />
        </Tabs>

        {loading ? (
          <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Featured skeleton */}
            <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-xl)' }} />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </Box>
        ) : (
          <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Featured Article — Full-width card */}
            {featured && (
              <div
                className="featured-card animate-fade-in-up"
                onClick={() => navigate('/news-detail', { state: { id: featured.id } })}
                style={{ height: '200px', borderRadius: 'var(--radius-xl)' }}
              >
                <img
                  src={featured.thumbnailUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800'}
                  alt={featured.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="featured-card-overlay">
                  <div className="badge badge-primary" style={{ marginBottom: '8px', fontSize: '10px' }}>
                    {featured.category}
                  </div>
                  <Text style={{
                    color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: '1.4',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }}>
                    {featured.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '6px' }}>
                    {formatDate(featured.publishedAt)}
                  </Text>
                </div>
              </div>
            )}

            {/* Rest of news */}
            {restNews.length > 0 ? (
              restNews.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/news-detail', { state: { id: item.id } })}
                  className={`card active-scale animate-fade-in-up delay-${Math.min((idx + 1) * 50, 300)}`}
                  style={{ display: 'flex', gap: '12px', padding: '12px', cursor: 'pointer' }}
                >
                  <img
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=160'}
                    alt={item.title}
                    style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Text style={{
                      fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: '1.4', letterSpacing: '-0.01em'
                    }}>
                      {item.title}
                    </Text>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(item.publishedAt)}</Text>
                      <div className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : newsList.length === 0 && (
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📰</div>
                <Text style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Chưa có bài viết nào.</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default NewsIndexPage;
