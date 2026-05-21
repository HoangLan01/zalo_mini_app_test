import React from 'react';
import { Page, Text, Box, useNavigate } from 'zmp-ui';
import PageHeader from './PageHeader';

interface ComingSoonProps {
  title?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title = 'Đang phát triển' }) => {
  const navigate = useNavigate();

  return (
    <Page style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={title} />
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 32px',
          paddingBottom: '160px',
        }}
      >
        <div className="animate-bounce-in" style={{ marginBottom: '24px' }}>
          <svg width="112" height="112" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="url(#coming-soon-grad)" opacity="0.1" />
            <circle cx="60" cy="60" r="40" fill="url(#coming-soon-grad)" opacity="0.08" />
            <g className="animate-float">
              <rect x="35" y="50" width="50" height="35" rx="6" fill="#0052cc" opacity="0.2" />
              <rect x="40" y="45" width="40" height="30" rx="5" fill="#0052cc" opacity="0.4" />
              <rect x="45" y="40" width="30" height="25" rx="4" fill="#0052cc" opacity="0.72" />
              <path d="M55 48L65 55L55 62V48Z" fill="white" />
            </g>
            <circle cx="85" cy="30" r="4" fill="#F59E0B" className="animate-pulse" />
            <circle cx="30" cy="35" r="3" fill="#10B981" className="animate-pulse delay-200" />
            <circle cx="90" cy="70" r="3" fill="#EF4444" className="animate-pulse delay-400" />
            <defs>
              <linearGradient id="coming-soon-grad" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#0052cc" />
                <stop offset="1" stopColor="#00b8d9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <Text style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </Text>
        <Text style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '14px', lineHeight: '1.6' }}>
          Tính năng này đang được xây dựng và sẽ sớm ra mắt. Cảm ơn sự kiên nhẫn của bạn!
        </Text>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 32px',
            borderRadius: 'var(--radius-pill)',
            border: '2px solid var(--primary)',
            background: 'transparent',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Quay lại
        </button>
      </Box>
    </Page>
  );
};

export default ComingSoon;
