import React from 'react';
import { Box, Text, useNavigate } from 'zmp-ui';
import logo from '../../images/anh_logo.jpg';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        position: 'relative',
        zIndex: 100,
        paddingTop: 'var(--zaui-safe-area-inset-top, env(safe-area-inset-top, 0px))',
        background: 'linear-gradient(135deg, #0052cc 0%, #00a7c8 100%)',
      }}
    >
      <Box
        flex
        alignItems="center"
        style={{
          height: '56px',
          padding: '0 16px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="active-scale"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 0',
            maxWidth: 'calc(100% - 48px)',
            border: 0,
            background: 'transparent',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          >
            <path
              d="M19 12H5m6-6-6 6 6 6"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <img
            src={logo}
            alt="Logo Phường Tùng Thiện"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.9)',
              flexShrink: 0,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
            <Text
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: '1.2',
                margin: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.92)',
                fontSize: '12px',
                lineHeight: '1.2',
                marginTop: '2px',
                margin: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              Phường Tùng Thiện
            </Text>
          </div>
        </button>
      </Box>
    </Box>
  );
};

export default PageHeader;
