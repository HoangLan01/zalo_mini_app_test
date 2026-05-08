import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useLocation } from 'zmp-ui';
import PageHeader from '@/components/PageHeader';
import { useHeritageStore } from '@/store/heritageStore';

const HeritageDetailPage: React.FC = () => {
  const { state } = useLocation();
  const getHeritageById = useHeritageStore(s => s.getHeritageById);
  const heritage = getHeritageById(state?.id as string);

  if (!heritage) {
    return (
      <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageHeader title="Chi tiết di tích" />
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-float" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>🏛️</div>
          <Text style={{ color: 'var(--text-muted)' }}>Không tìm thấy thông tin di tích.</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="page" style={{ backgroundColor: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Chi tiết di tích" />

      <Box style={{ flex: 1, overflow: 'auto', paddingBottom: '160px' }}>
        {/* Cover Image */}
        <div className="animate-fade-in" style={{ width: '100%', height: '260px', position: 'relative' }}>
          <img
            src={heritage.coverImage}
            alt={heritage.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px',
            background: 'linear-gradient(to top, var(--surface-raised), transparent)'
          }} />
        </div>

        {/* Content Card */}
        <Box className="animate-fade-in-up delay-100" style={{
          padding: '24px 20px',
          backgroundColor: 'var(--surface-raised)',
          marginTop: '-24px',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          position: 'relative', zIndex: 10
        }}>
          <Text style={{
            fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)',
            marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: '1.3'
          }}>
            {heritage.name}
          </Text>

          {/* Location */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            marginBottom: '20px', paddingBottom: '20px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '5px' }}>
              {heritage.address}
            </Text>
          </div>

          {/* Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '4px', height: '20px', borderRadius: '2px',
              background: 'var(--gradient-hero)'
            }} />
            <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
              Giới thiệu
            </Text>
          </div>

          {/* Description */}
          <div
            style={{
              color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '15px',
              textAlign: 'justify'
            }}
            dangerouslySetInnerHTML={{ __html: heritage.description }}
          />

          {/* Gallery */}
          {heritage.gallery && heritage.gallery.length > 0 && (
            <Box className="animate-fade-in-up delay-200" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                  width: '4px', height: '20px', borderRadius: '2px',
                  background: 'var(--gradient-warm)'
                }} />
                <Text style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  📸 Thư viện ảnh
                </Text>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {heritage.gallery.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx}`}
                    className="active-scale"
                    style={{
                      width: '100%', aspectRatio: '1', objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
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
