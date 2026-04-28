import React from 'react';
import { Page, Header, Button, Text, Box } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';

interface ComingSoonProps {
  title?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title = 'Đang phát triển' }) => {
  const navigate = useNavigate();

  return (
    <Page style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header title={title} showBackIcon onBackClick={() => navigate(-1)} />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
        <Text style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</Text>
        <Text size="xLarge" bold style={{ color: '#1A1A1A', marginBottom: '8px' }}>
          {title}
        </Text>
        <Text style={{ color: '#888888', marginBottom: '24px' }}>
          Tính năng này đang được xây dựng và sẽ sớm ra mắt. Cảm ơn sự kiên nhẫn của bạn!
        </Text>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    </Page>
  );
};

export default ComingSoon;
