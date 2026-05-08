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
      <Page className="page" style={{ backgroundColor: 'var(--surface)' }}>
        <PageHeader title="Chi tiết tin tức" />
        <Box style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton skeleton-title" style={{ width: '80%' }} />
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text" style={{ width: '90%' }} />
          <div className="skeleton skeleton-text" style={{ width: '75%' }} />
        </Box>
      </Page>
    );
  }

  if (!article) {
    return (
      <Page className="page" style={{ backgroundColor: 'var(--surface)' }}>
        <PageHeader title="Chi tiết tin tức" />
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
          <div className="animate-float" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>📄</div>
          <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy nội dung bài viết.</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface-raised)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết tin tức" />
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '160px' }}>
        {/* Hero Image */}
        <div className="animate-fade-in" style={{ position: 'relative' }}>
          <img
            src={article.thumbnailUrl || "https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=800"}
            alt={article.title}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
            background: 'linear-gradient(to top, var(--surface-raised), transparent)'
          }} />
        </div>

        {/* Content */}
        <Box className="animate-fade-in-up delay-100" style={{ padding: '0 20px', marginTop: '-20px', position: 'relative', zIndex: 1 }}>
          {/* Category Badge */}
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            {article.category}
          </div>

          {/* Title */}
          <Text style={{
            fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)',
            marginBottom: '12px', lineHeight: '1.4', letterSpacing: '-0.02em'
          }}>
            {article.title}
          </Text>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Text style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📅 {formatDate(article.publishedAt)}</Text>
            {article.author && (
              <>
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <Text style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✍️ {article.author}</Text>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="divider-gradient" style={{ marginBottom: '20px' }} />

          {/* Article Content */}
          <div
            style={{
              color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px',
              textAlign: 'justify'
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share Button */}
          <button
            className="active-scale"
            style={{
              width: '100%', padding: '14px', marginTop: '32px',
              borderRadius: 'var(--radius-pill)',
              border: '2px solid var(--primary)',
              background: 'transparent', color: 'var(--primary)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
            onClick={() => {}}
          >
            📤 Chia sẻ cho bạn bè
          </button>
        </Box>
      </Box>
    </Page>
  );
};

export default NewsDetailPage;
