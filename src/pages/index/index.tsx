import React, { useEffect, useState } from 'react';
import { Page, Box, Text, Swiper } from 'zmp-ui';
import { useNavigate } from 'zmp-ui';
import { useUserStore } from '@/store/userStore';
import { apiCall } from '@/services/api';
import logo from '@/assets/logo.jpg';
import bannerFit from '@/assets/banner_fit.png';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// --- Inline SVG Icons for premium feel ---
const SvgIcon = ({ children, color = '#fff' }: { children: React.ReactNode; color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconMegaphone = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></SvgIcon>
);
const IconCalendar = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></SvgIcon>
);
const IconClipboard = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></SvgIcon>
);
const IconStar = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>
);
const IconBuilding = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></SvgIcon>
);
const IconShield = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></SvgIcon>
);
const IconChat = ({ color }: { color?: string }) => (
  <SvgIcon color={color}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></SvgIcon>
);

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    setBanners([
      { id: 1, img: bannerFit },
      { id: 2, img: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ]);
  }, []);

  const quickActions = [
    { title: 'Phản ánh', icon: <IconMegaphone />, path: '/feedback', gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' },
    { title: 'Đặt lịch', icon: <IconCalendar />, path: '/booking', gradient: 'linear-gradient(135deg, #246BFD, #7C5CFC)' },
    { title: 'Nhắn OA', icon: <IconChat />, path: '/chat', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
  ];

  const mainServices = [
    { title: 'Phản ánh', icon: <IconMegaphone color="#FF6B6B" />, path: '/feedback', bgColor: '#FFF0F0', borderColor: '#FFD4D4' },
    { title: 'Đặt lịch', icon: <IconCalendar color="#246BFD" />, path: '/booking', bgColor: '#EEF4FF', borderColor: '#D4E4FF' },
    { title: 'Dịch vụ công', icon: <IconClipboard color="#7C5CFC" />, path: '/dvc', bgColor: '#F3EEFF', borderColor: '#E0D4FF' },
    { title: 'Đánh giá', icon: <IconStar color="#F59E0B" />, path: '/rating', bgColor: '#FFF8E6', borderColor: '#FFE9B3' },
    { title: 'iHanoi', icon: <IconBuilding color="#10B981" />, path: '/ihanoi', bgColor: '#ECFDF5', borderColor: '#C6F7E2' },
    { title: 'VNeID', icon: <IconShield color="#06B6D4" />, path: '/vneid', bgColor: '#ECFEFF', borderColor: '#C4F1F9' },
  ];

  const otherServices = [
    { title: 'Tin tức', icon: '📰', path: '/news', bgColor: '#E3F2FD' },
    { title: 'Trang TTĐT', icon: '🌐', path: '/ttdt', bgColor: '#F3E5F5' },
    { title: 'Sự kiện', icon: '🎉', path: '/events', bgColor: '#FFF3E0' },
    { title: 'Di tích', icon: '🏛️', path: '/heritage', bgColor: '#E8F5E9' },
    { title: 'Kiến thức CĐS', icon: '💡', path: '/quiz', bgColor: '#FFFDE7', isNew: true },
    { title: 'Giáo dục', icon: '🎓', path: '/education', bgColor: '#FCE4EC' },
    { title: 'Quy hoạch', icon: '🗺️', path: '/planning', bgColor: '#E0F2F1' },
  ];

  return (
    <Page className="page" style={{ paddingBottom: '80px', backgroundColor: 'var(--surface)' }}>
      {/* ===== HERO BANNER ===== */}
      <Box style={{ position: 'relative', height: '320px' }}>
        {banners.length > 0 && (
          <Swiper autoplay duration={4000} loop style={{ height: '320px', width: '100%' }}>
            {banners.map((banner) => (
              <Swiper.Slide key={banner.id}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={banner.img} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%)'
                  }} />
                </div>
              </Swiper.Slide>
            ))}
          </Swiper>
        )}

        {/* Identity & Greeting Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '16px', paddingTop: 'calc(env(safe-area-inset-top, 0) + 16px)',
          zIndex: 10
        }}>
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '44px', height: '44px', backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
              }}>
                <img src={logo} alt="logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
              <Text style={{ color: '#FFF', fontWeight: 800, fontSize: '18px', textShadow: '0 2px 8px rgba(0,0,0,0.3)', letterSpacing: '-0.02em' }}>
                Phường Tùng Thiện
              </Text>
            </div>
            <div className="glass-dark active-scale" style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>
            </div>
          </div>

          {/* Greeting Card — Glassmorphism */}
          <div className="glass animate-fade-in-up" style={{
            marginTop: '28px', padding: '18px 20px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <div>
              <Text style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '2px', fontWeight: 500 }}>
                {getGreeting()} 👋
              </Text>
              <Text style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
                {userInfo?.name || 'Khách truy cập'}
              </Text>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src={userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="avatar"
                style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFF', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '14px', height: '14px', backgroundColor: '#10B981',
                borderRadius: '50%', border: '2.5px solid #FFF'
              }} />
            </div>
          </div>
        </div>
      </Box>

      {/* ===== MAIN CONTENT ===== */}
      <Box style={{
        marginTop: '-28px',
        backgroundColor: 'var(--surface)',
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Quick Actions Strip */}
        <div className="animate-fade-in-up delay-50" style={{
          display: 'flex', gap: '12px',
          padding: '20px 16px 8px 16px'
        }}>
          {quickActions.map((action, i) => (
            <div
              key={action.title}
              onClick={() => navigate(action.path)}
              className="active-scale"
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '14px 8px',
                background: action.gradient,
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {action.icon}
              </div>
              <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>
                {action.title}
              </Text>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ padding: '12px 16px 0 16px' }}>
          <div className="divider-gradient" />
        </div>

        {/* Main Services Grid */}
        <Box className="animate-fade-in-up delay-100" style={{ padding: '20px 16px 12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text className="section-title">Dịch vụ chính</Text>
            <Text style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả</Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {mainServices.map((service, i) => (
              <div
                key={service.title}
                onClick={() => navigate(service.path, { state: { title: service.title } })}
                className={`card active-scale animate-fade-in-up delay-${(i + 1) * 50}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '16px 8px',
                  border: `1px solid ${service.borderColor}`,
                }}
              >
                <div className="service-icon-box" style={{
                  backgroundColor: service.bgColor,
                  marginBottom: '10px'
                }}>
                  {service.icon}
                </div>
                <Text style={{ textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {service.title}
                </Text>
              </div>
            ))}
          </div>
        </Box>

        {/* Divider */}
        <div style={{ padding: '0 16px' }}>
          <div className="divider-gradient" />
        </div>

        {/* Other Services */}
        <Box className="animate-fade-in-up delay-200" style={{ padding: '20px 16px 32px 16px' }}>
          <Text className="section-title" style={{ marginBottom: '16px' }}>Khám phá thêm</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {otherServices.map((service, i) => (
              <div
                key={service.title}
                onClick={() => navigate(service.path, { state: { title: service.title } })}
                className="active-scale"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 4px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '48px', height: '48px',
                  backgroundColor: service.bgColor,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '8px',
                  fontSize: '22px',
                  transition: 'transform 0.2s ease',
                }}>
                  {service.icon}
                </div>
                <Text style={{ textAlign: 'center', fontWeight: 600, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  {service.title}
                </Text>
                {service.isNew && (
                  <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    backgroundColor: '#EF4444', color: '#fff',
                    fontSize: '9px', fontWeight: 700,
                    padding: '2px 5px', borderRadius: '6px',
                    lineHeight: '1.2'
                  }}>
                    MỚI
                  </div>
                )}
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Page>
  );
};

export default IndexPage;
