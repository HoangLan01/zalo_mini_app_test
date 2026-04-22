import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Button, Spinner } from 'zmp-ui';
import { openExternalUrl } from '@/utils/zaloHelper';
import PageHeader from '@/components/PageHeader';

const DvcPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    openExternalUrl('https://dichvucong.gov.vn', 'Dịch vụ công Quốc gia');
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Dịch vụ công" />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {loading ? (
          <>
            <Spinner visible />
            <Text style={{ marginTop: '16px', color: '#888888' }}>Đang mở Cổng Dịch vụ công Quốc gia...</Text>
          </>
        ) : (
          <>
            <Text style={{ textAlign: 'center', marginBottom: '16px', color: '#1A1A1A' }}>
              Nếu hệ thống không tự động chuyển hướng, vui lòng nhấn nút bên dưới.
            </Text>
            <Button onClick={() => openExternalUrl('https://dichvucong.gov.vn', 'Dịch vụ công Quốc gia')}>
              Mở lại Dịch vụ công
            </Button>
          </>
        )}
      </Box>
    </Page>
  );
};

export default DvcPage;
