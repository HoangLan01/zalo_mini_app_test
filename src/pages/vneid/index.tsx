import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Button, Spinner } from 'zmp-ui';
import { openExternalUrl } from '@/utils/zaloHelper';
import PageHeader from '@/components/PageHeader';

const VneidPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    openExternalUrl('https://vneid.gov.vn', 'VNeID');
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="VNeID – Định danh điện tử" />
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {loading ? (
          <>
            <Spinner visible />
            <Text style={{ marginTop: '16px', color: '#888888' }}>Đang kết nối VNeID...</Text>
          </>
        ) : (
          <Box style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Text style={{ marginBottom: '16px', color: '#1A1A1A', lineHeight: '1.5' }}>
              VNeID là ứng dụng định danh điện tử quốc gia do Bộ Công an phát hành. Bạn cần cài đặt ứng dụng VNeID trên thiết bị để sử dụng đầy đủ tính năng.
            </Text>
            <Button onClick={() => openExternalUrl('https://vneid.gov.vn', 'VNeID')} fullWidth>
              Tìm hiểu VNeID
            </Button>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default VneidPage;
