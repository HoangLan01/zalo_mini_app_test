import React, { useMemo } from 'react';
import { Page, Box, Text, Icon, ImageViewer } from 'zmp-ui';
import { useLocation, useNavigate } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useHeritageStore } from '@/store/heritageStore';

const HeritageDetailPage: React.FC = () => {
  const { state } = useLocation();
  const getHeritageById = useHeritageStore(s => s.getHeritageById);
  const heritage = getHeritageById(state?.id as string);

  if (!heritage) {
    return (
      <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="Chi tiết di tích" />
        <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text>Không tìm thấy thông tin di tích.</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="page" style={{ backgroundColor: '#F5F5F5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết di tích" />
      
      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
        {/* Cover Image */}
        <div style={{ width: '100%', height: '240px', position: 'relative' }}>
          <img 
            src={heritage.coverImage} 
            alt={heritage.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}></div>
        </div>

        <Box style={{ padding: '20px', backgroundColor: '#FFFFFF', marginTop: '-20px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', position: 'relative', zIndex: 10 }}>
          <Text style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
            {heritage.name}
          </Text>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E0E0E0' }}>
            <Icon icon="zi-location" size={20} style={{ color: '#0068FF' }} />
            <Text style={{ fontSize: '15px', color: '#555555', lineHeight: '1.4' }}>
              {heritage.address}
            </Text>
          </div>

          <Text style={{ fontSize: '18px', fontWeight: 700, color: '#0068FF', marginBottom: '16px' }}>
            Giới thiệu
          </Text>
          
          <div 
            style={{ color: '#333333', lineHeight: '1.6', fontSize: '15px', textAlign: 'justify' }} 
            dangerouslySetInnerHTML={{ __html: heritage.description }} 
          />

          {heritage.gallery && heritage.gallery.length > 0 && (
            <Box style={{ marginTop: '32px' }}>
              <Text style={{ fontSize: '18px', fontWeight: 700, color: '#0068FF', marginBottom: '16px' }}>
                Thư viện ảnh
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {heritage.gallery.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Gallery ${idx}`} 
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                ))}
              </div>
            </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default HeritageDetailPage;
