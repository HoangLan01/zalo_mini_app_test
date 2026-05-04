import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Button, Spinner } from 'zmp-ui';
import { openExternalUrl } from '@/utils/zaloHelper';
import PageHeader from '@/components/PageHeader';

const TtdtPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    openExternalUrl('https://tungthien.hanoi.gov.vn/', 'Trang TTĐT Phường Tùng Thiện');
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Trang TTĐT Tùng Thiện" />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {loading ? (
          <>
            <Spinner visible />
            <Text style={{ marginTop: '16px', color: '#888888' }}>Đang kết nối Trang TTĐT Phường...</Text>
          </>
        ) : (
          <Box style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Text style={{ marginBottom: '16px', color: '#1A1A1A', lineHeight: '1.5' }}>
              Trang Thông tin điện tử Phường Tùng Thiện cung cấp thông tin, tin tức và các hoạt động của địa phương.
            </Text>
            <Button onClick={() => openExternalUrl('https://tungthien.hanoi.gov.vn/', 'Trang TTĐT Phường Tùng Thiện')} fullWidth>
              Mở lại Trang TTĐT
            </Button>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default TtdtPage;
