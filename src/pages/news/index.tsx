import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Tabs, Spinner } from 'zmp-ui';
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

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Tin tức - Thông báo" />
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        <Tabs id="news-tabs" activeKey={activeTab} onChange={(key) => setActiveTab(key as string)}>
          <Tabs.Tab key="all" label="Tất cả" />
          <Tabs.Tab key="tin-tuc" label="Tin tức" />
          <Tabs.Tab key="thong-bao" label="Thông báo" />
          <Tabs.Tab key="van-ban" label="Văn bản" />
        </Tabs>

        {loading ? (
          <Box flex justifyContent="center" alignItems="center" style={{ padding: '32px' }}>
            <Spinner />
          </Box>
        ) : (
          <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {newsList.length > 0 ? (
              newsList.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate('/news-detail', { state: { id: item.id } })}
                  style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <img 
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=160'} 
                    alt={item.title} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </Text>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '12px', color: '#888888' }}>{formatDate(item.publishedAt)}</Text>
                      <div style={{ backgroundColor: '#E8F0FE', padding: '2px 8px', borderRadius: '12px' }}>
                        <Text style={{ fontSize: '12px', color: '#246BFD' }}>{item.category}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Box flex justifyContent="center" alignItems="center" style={{ padding: '32px' }}>
                <Text style={{ color: '#888888' }}>Chưa có bài viết nào.</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default NewsIndexPage;
