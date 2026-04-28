import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Button, Spinner } from 'zmp-ui';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { apiCall } from '@/services/api';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnailUrl: string;
  category: string;
  publishedAt: string;
  author: string;
}

const NewsDetailPage: React.FC = () => {
  const location = useLocation();
  const articleId = location.state?.id;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articleId) {
      fetchDetail();
    }
  }, [articleId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await apiCall<{ success: boolean; data: Article }>(`/api/news/${articleId}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <Page className="page">
        <PageHeader title="Chi tiết tin tức" />
        <Box flex justifyContent="center" alignItems="center" style={{ height: '200px' }}>
          <Spinner />
        </Box>
      </Page>
    );
  }

  if (!article) {
    return (
      <Page className="page">
        <PageHeader title="Chi tiết tin tức" />
        <Box style={{ padding: '20px' }}>
          <Text>Không tìm thấy nội dung bài viết.</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="page" style={{ backgroundColor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết tin tức" />
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        <img 
          src={article.thumbnailUrl || "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800"} 
          alt={article.title} 
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} 
        />
        <Box style={{ padding: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
            {article.title}
          </Text>
          <Text style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>
            {formatDate(article.publishedAt)} • {article.category} {article.author ? `• By ${article.author}` : ''}
          </Text>
          <div style={{ height: '1px', backgroundColor: '#E0E0E0', marginBottom: '16px' }} />
          
          <div 
            style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px' }} 
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
          
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
