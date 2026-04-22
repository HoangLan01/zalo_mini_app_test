import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Button, Spinner } from 'zmp-ui';
import { openExternalUrl } from '@/utils/zaloHelper';
import PageHeader from '@/components/PageHeader';

const IhanoiPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    openExternalUrl('https://ihanoi.gov.vn', 'iHanoi');
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="iHanoi" />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {loading ? (
          <>
            <Spinner visible />
            <Text style={{ marginTop: '16px', color: '#888888' }}>Đang kết nối iHanoi...</Text>
          </>
        ) : (
          <Box style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Text style={{ marginBottom: '16px', color: '#1A1A1A', lineHeight: '1.5' }}>
              iHanoi là nền tảng số của Thành phố Hà Nội, cung cấp dịch vụ hành chính và tiện ích cho người dân và doanh nghiệp.
            </Text>
            <Button onClick={() => openExternalUrl('https://ihanoi.gov.vn', 'iHanoi')} fullWidth>
              Mở iHanoi
            </Button>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default IhanoiPage;
