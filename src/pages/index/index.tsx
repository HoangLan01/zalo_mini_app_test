import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Icon, Swiper } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { useUserStore } from '@/store/userStore';
import { apiCall } from '@/services/api';


const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    // Mock fetching banners
    setBanners([
      { id: 1, img: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 2, img: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ]);
  }, []);

  const highlightedServices = [
    { title: 'Phản ánh', icon: '📣', path: '/feedback' },
    { title: 'Đặt lịch', icon: '📅', path: '/booking' },
    { title: 'Dịch vụ công', icon: '📋', path: '/dvc' },
    { title: 'Đánh giá', icon: '⭐', path: '/rating' },
    { title: 'iHanoi', icon: '🏙️', path: '/ihanoi' },
    { title: 'VNeID', icon: '🪪', path: '/vneid' },
  ];

  const otherServices = [
    { title: 'Tin tức', icon: '📰', path: '/news' },
    { title: 'Sự kiện', icon: '🎉', path: '/events' },
    { title: 'Di tích', icon: '🏛️', path: '/heritage' },
    { title: 'Kiến thức CĐS', icon: '💡', path: '/quiz' },
    { title: 'Giáo dục', icon: '🎓', path: '/coming-soon' },
    { title: 'Quy hoạch', icon: '🗺️', path: '/coming-soon' },
  ];

  const renderServiceBox = (service: any) => (
    <div
      key={service.title}
      onClick={() => navigate(service.path, { state: { title: service.title } })}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '12px 8px', backgroundColor: '#FFFFFF', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer'
      }}
    >
      <Text size="xLarge" style={{ marginBottom: '8px' }}>{service.icon}</Text>
      <Text size="xSmall" style={{ textAlign: 'center', fontWeight: '500', color: '#1A1A1A' }}>
        {service.title}
      </Text>
    </div>
  );

  return (
    <Page className="page" style={{ paddingBottom: '80px', backgroundColor: '#F5F5F5' }}>
      {/* 1. Header Bar */}
      <Box style={{ backgroundColor: '#0068FF', padding: '16px 16px 24px 16px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontSize: '20px' }}>🏛️</span>
          </div>
          <Text style={{ color: '#FFF', fontWeight: 600, fontSize: '18px' }}>UBND Phường Tùng Thiện</Text>
        </div>
        
        {/* 2. Greeting Card */}
        <Box style={{ marginTop: '24px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div>
            <Text style={{ color: '#888888', fontSize: '14px', marginBottom: '4px' }}>Xin chào,</Text>
            <Text style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '18px' }}>
              {userInfo?.name || 'Khách truy cập'}
            </Text>
          </div>
          {userInfo?.avatar ? (
            <img src={userInfo.avatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon="zi-user" style={{ color: '#0068FF' }} />
            </div>
          )}
        </Box>
      </Box>

      {/* 3. Banner Swiper */}
      <Box style={{ padding: '0 16px', marginTop: '-12px' }}>
        {banners.length > 0 && (
          <Swiper autoplay duration={3000} loop style={{ borderRadius: '12px', overflow: 'hidden', height: '160px' }}>
            {banners.map((banner) => (
              <Swiper.Slide key={banner.id}>
                <img src={banner.img} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Swiper.Slide>
            ))}
          </Swiper>
        )}
      </Box>

      {/* 4. Dịch vụ nổi bật */}
      <Box style={{ padding: '24px 16px 12px 16px' }}>
        <Text style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1A', marginBottom: '16px' }}>Dịch vụ nổi bật</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {highlightedServices.map(renderServiceBox)}
        </div>
      </Box>

      {/* 5. Dịch vụ khác */}
      <Box style={{ padding: '12px 16px 24px 16px' }}>
        <Text style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1A', marginBottom: '16px' }}>Dịch vụ khác</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {otherServices.map(renderServiceBox)}
        </div>
      </Box>
    </Page>
  );
};

export default IndexPage;
