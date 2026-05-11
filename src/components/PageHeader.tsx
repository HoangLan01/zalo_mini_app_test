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
        // Dùng CSS variable của ZaUI hoặc env để chừa khoảng trống cho thanh trạng thái (status bar)
        paddingTop: 'var(--zaui-safe-area-inset-top, env(safe-area-inset-top, 0px))', 
      }}
    >
      {/* Background Wrapper */}
      <div style={{
        position: 'absolute',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}>
        {/* Background Image Layer */}
        <div style={{
          position: 'absolute',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px)',
          transform: 'scale(1.1)',
        }} />
        
        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        }} />
      </div>

      {/* Header Content */}
      <Box 
        flex 
        alignItems="center" 
        style={{ 
          height: '56px', // Chiều cao chuẩn của header content
          padding: '0 16px',
        }}
      >
        {/* Nút Back + Logo + Text gom chung thành 1 cụm bấm được */}
        <div 
          onClick={() => navigate(-1)}
          className="active-scale" // Hiệu ứng của ZaUI khi bấm
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 0',
            maxWidth: 'calc(100% - 100px)' // Chừa phần bên phải cho nút 3 chấm của Zalo
          }}
        >
          {/* Mũi tên bằng SVG để không phụ thuộc font Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M19.5 11.4H5.99998L12.47 4.91998C12.5251 4.86482 12.5689 4.79934 12.5987 4.72728C12.6286 4.65521 12.6439 4.57798 12.6439 4.49998C12.6439 4.42197 12.6286 4.34474 12.5987 4.27267C12.5689 4.20061 12.5251 4.13513 12.47 4.07998C12.4148 4.02482 12.3493 3.98107 12.2773 3.95122C12.2052 3.92137 12.128 3.90601 12.05 3.90601C11.972 3.90601 11.8947 3.92137 11.8227 3.95122C11.7506 3.98107 11.6851 4.02482 11.63 4.07998L4.12998 11.58C4.07246 11.6323 4.02794 11.6974 3.99998 11.77C3.93995 11.9174 3.93995 12.0825 3.99998 12.23C4.02794 12.3026 4.07246 12.3676 4.12998 12.42L11.63 19.92C11.6851 19.9751 11.7506 20.0189 11.8227 20.0487C11.8947 20.0786 11.972 20.0939 12.05 20.0939C12.128 20.0939 12.2052 20.0786 12.2773 20.0487C12.3493 20.0189 12.4148 19.9751 12.47 19.92C12.5251 19.8648 12.5689 19.7993 12.5987 19.7273C12.6286 19.6552 12.6439 19.578 12.6439 19.5C12.6439 19.422 12.6286 19.3447 12.5987 19.2727C12.5689 19.2006 12.5251 19.1351 12.47 19.08L5.99998 12.6H19.5C19.6591 12.6 19.8117 12.5368 19.9242 12.4242C20.0368 12.3117 20.1 12.1591 20.1 12C20.1 11.8408 20.0368 11.6882 19.9242 11.5757C19.8117 11.4632 19.6591 11.4 19.5 11.4Z" fill="white"/>
          </svg>
          
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: '34px', height: '34px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.9)',
              flexShrink: 0
            }} 
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
            <Text style={{ 
              color: 'white', 
              fontWeight: 700, 
              fontSize: '15px', 
              lineHeight: '1.2',
              textShadow: '0px 1px 3px rgba(0,0,0,0.5)',
              margin: 0,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              width: '100%'
            }}>
              {title}
            </Text>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: '12px', 
              lineHeight: '1.2',
              textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
              marginTop: '2px',
              margin: 0,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              width: '100%'
            }}>
              Phường Tùng Thiện
            </Text>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default PageHeader;
