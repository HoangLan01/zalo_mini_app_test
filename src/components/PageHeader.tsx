import React from 'react';
import { Text, Icon, useNavigate } from 'zmp-ui';

interface PageHeaderProps {
  title: string;
  showBackIcon?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBackIcon = true }) => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#0068FF', color: 'white', display: 'flex', alignItems: 'center', padding: '12px 16px', paddingTop: 'max(12px, env(safe-area-inset-top, 0px))', zIndex: 100 }}>
      {showBackIcon ? (
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon icon="zi-chevron-left" style={{ color: 'white' }} />
        </div>
      ) : (
        <div style={{ width: '24px' }}></div>
      )}
      <Text style={{ fontSize: '18px', fontWeight: 600, flex: 1, textAlign: 'center', margin: '0 8px', color: 'white' }}>{title}</Text>
      <div style={{ width: '24px' }}></div>
    </div>
  );
};

export default PageHeader;
