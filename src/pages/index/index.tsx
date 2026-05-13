import React from 'react';
import { Page, Text, useNavigate } from 'zmp-ui';
import { openChat } from 'zmp-sdk/apis';

import wardLogo from '../../../images/anh_logo.jpg';
import { useUserStore } from '@/store/userStore';

type IconName =
  | 'home'
  | 'bell'
  | 'badge'
  | 'megaphone'
  | 'calendar'
  | 'chat'
  | 'file'
  | 'heart'
  | 'medical'
  | 'education'
  | 'news'
  | 'globe'
  | 'spark'
  | 'landmark'
  | 'bulb'
  | 'map'
  | 'arrow'
  | 'lock';

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  const icons: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    badge: (
      <>
        <path d="M12 3 4.5 6v5.5c0 4.4 3 7.2 7.5 9.5 4.5-2.3 7.5-5.1 7.5-9.5V6L12 3Z" />
        <path d="m9.5 12 1.7 1.7 3.8-4" />
      </>
    ),
    megaphone: (
      <>
        <path d="M3 11v2a2 2 0 0 0 2 2h2l9 4V5L7 9H5a2 2 0 0 0-2 2Z" />
        <path d="M19 8a4 4 0 0 1 0 8" />
        <path d="M7 15v4" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="M4 10h16" />
        <path d="M8 14h3" />
        <path d="M13 14h3" />
      </>
    ),
    chat: (
      <>
        <path d="M21 14a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </>
    ),
    heart: (
      <>
        <path d="M20 11.5V20H4v-8.5" />
        <path d="m4 12 8-8 8 8" />
        <path d="M9 14h6" />
        <path d="M12 11v6" />
      </>
    ),
    medical: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="3" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M12 11v5" />
        <path d="M9.5 13.5h5" />
      </>
    ),
    education: (
      <>
        <path d="m3 8 9-4 9 4-9 4-9-4Z" />
        <path d="M7 10.5v4.2c1.6 1.2 3.2 1.8 5 1.8s3.4-.6 5-1.8v-4.2" />
        <path d="M21 8v6" />
      </>
    ),
    news: (
      <>
        <path d="M5 4h11a3 3 0 0 1 3 3v13H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M7 8h7" />
        <path d="M7 12h8" />
        <path d="M7 16h5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21" />
        <path d="M12 3c-2.2 2.5-3.3 5.5-3.3 9S9.8 18.5 12 21" />
      </>
    ),
    spark: (
      <>
        <path d="M12 2v5" />
        <path d="M12 17v5" />
        <path d="m4.9 4.9 3.5 3.5" />
        <path d="m15.6 15.6 3.5 3.5" />
        <path d="M2 12h5" />
        <path d="M17 12h5" />
        <path d="m4.9 19.1 3.5-3.5" />
        <path d="m15.6 8.4 3.5-3.5" />
      </>
    ),
    landmark: (
      <>
        <path d="m4 10 8-5 8 5" />
        <path d="M5 10h14" />
        <path d="M7 10v8" />
        <path d="M12 10v8" />
        <path d="M17 10v8" />
        <path d="M4 18h16" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8.2 14.8a6 6 0 1 1 7.6 0c-.8.6-.8 1.2-.8 2.2H9c0-1 0-1.6-.8-2.2Z" />
      </>
    ),
    map: (
      <>
        <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng,';
  if (hour < 18) return 'Chào buổi chiều,';
  return 'Chào buổi tối,';
};

const getGreetingName = (name?: string) => name || 'Công dân Tùng Thiện';

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const citizenName = getGreetingName(userInfo?.name);
  const shouldAnimateName = citizenName.length > 18;

  const handleOpenChat = async () => {
    try {
      await openChat({
        type: 'oa',
        id: import.meta.env.VITE_ZALO_OA_ID,
        message: 'Xin chào, tôi cần hỗ trợ',
      });
    } catch (error) {
      const oaId = import.meta.env.VITE_ZALO_OA_ID;
      window.open(`https://zalo.me/${oaId}`, '_blank');
    }
  };

  const quickActions = [
    {
      title: 'Phản ánh',
      subtitle: 'Kiến nghị',
      icon: 'megaphone' as IconName,
      tone: 'blue',
      onClick: () => navigate('/feedback'),
    },
    {
      title: 'Đặt lịch',
      subtitle: 'Làm việc',
      icon: 'calendar' as IconName,
      tone: 'warm',
      onClick: () => navigate('/booking'),
    },
    {
      title: 'Nhắn OA',
      subtitle: 'Trực tuyến',
      icon: 'chat' as IconName,
      tone: 'mint',
      onClick: handleOpenChat,
    },
  ];

  const publicServices = [
    {
      title: 'Thủ tục hành chính',
      description: 'Cấp giấy tờ, chứng thực',
      icon: 'file' as IconName,
      tone: 'indigo',
      path: '/dvc',
    },
    {
      title: 'An sinh xã hội',
      description: 'Hỗ trợ, bảo trợ xã hội',
      icon: 'heart' as IconName,
      tone: 'coral',
      path: '/social-security',
    },
    {
      title: 'Y tế',
      description: 'Khám bệnh, tiêm chủng',
      icon: 'medical' as IconName,
      tone: 'green',
      path: '/health',
    },
    {
      title: 'Giáo dục',
      description: 'Trường học, khuyến học',
      icon: 'education' as IconName,
      tone: 'amber',
      path: '/education',
    },
  ];

  const exploreItems = [
    { title: 'Tin tức', icon: 'news' as IconName, tone: 'sky', path: '/news' },
    { title: 'Trang TTĐT', icon: 'globe' as IconName, tone: 'violet', path: '/ttdt' },
    { title: 'Sự kiện', icon: 'spark' as IconName, tone: 'orange', path: '/events' },
    { title: 'Di tích', icon: 'landmark' as IconName, tone: 'emerald', path: '/heritage' },
    { title: 'Kiến thức CDS', icon: 'bulb' as IconName, tone: 'yellow', path: '/quiz', isNew: true },
    { title: 'Giáo dục', icon: 'education' as IconName, tone: 'pink', path: '/education' },
    { title: 'Quy hoạch', icon: 'map' as IconName, tone: 'teal', path: '/planning' },
  ];

  return (
    <Page className="home-page">
      <header className="home-topbar">
        <div className="home-brand">
          <span className="home-brand-logo">
            <img src={wardLogo} alt="Logo Phường Tùng Thiện" />
          </span>
          <Text className="home-brand-title">Phường Tùng Thiện</Text>
        </div>
        <button className="home-icon-button" type="button" aria-label="Thông báo">
          <Icon name="bell" size={21} />
        </button>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-grid" />
        <Text className="home-hero-kicker">Zalo Mini App</Text>
        <Text id="home-title" className="home-hero-title">
          Phường Tùng Thiện
        </Text>
      </section>

      <main className="home-content">
        <section className="citizen-card" aria-label="Định danh công dân">
          <div className="citizen-profile">
            <div className="citizen-identity">
              <img
                className="citizen-avatar"
                src={userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop'}
                alt="Ảnh đại diện"
              />
              <div className="citizen-badge">
                <Icon name="badge" size={14} />
                <span>Công dân số</span>
              </div>
            </div>
            <div className="citizen-copy">
              <Text className="citizen-greeting">{getGreeting()}</Text>
              <div className={`citizen-name${shouldAnimateName ? ' is-marquee' : ''}`} aria-label={citizenName}>
                <span className="citizen-name-track">
                  <span>{citizenName}</span>
                  {shouldAnimateName && <span aria-hidden="true">{citizenName}</span>}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-banner" aria-label="Hành chính hiện đại">
          <div className="admin-banner-art" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <Text className="admin-banner-title">Hành chính hiện đại - Phục vụ người dân</Text>
          <Text className="admin-banner-copy">Minh bạch - Nhanh chóng - Tiện lợi</Text>
          <button className="admin-banner-button" type="button" onClick={() => navigate('/dvc')}>
            <span>Tìm hiểu thêm</span>
            <Icon name="arrow" size={18} />
          </button>
        </section>

        <section className="quick-actions" aria-label="Chức năng nhanh">
          {quickActions.map((action) => (
            <button
              key={action.title}
              className={`quick-action-card quick-action-card-${action.tone}`}
              type="button"
              onClick={action.onClick}
            >
              <span className="quick-action-icon">
                <Icon name={action.icon} size={20} />
              </span>
              <span className="quick-action-title">{action.title}</span>
              <span className="quick-action-subtitle">{action.subtitle}</span>
            </button>
          ))}
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <Text className="home-section-title">Dịch vụ công</Text>
            <button type="button" className="home-section-link" onClick={() => navigate('/dvc')}>
              Tất cả
            </button>
          </div>
          <div className="public-service-grid">
            {publicServices.map((service) => (
              <button
                key={service.title}
                type="button"
                className="public-service-card"
                onClick={() => navigate(service.path, { state: { title: service.title } })}
              >
                <span className={`service-icon service-icon-${service.tone}`}>
                  <Icon name={service.icon} size={19} />
                </span>
                <span className="service-title">{service.title}</span>
                <span className="service-description">{service.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-section">
          <Text className="home-section-title">Khám phá thêm</Text>
          <div className="explore-grid">
            {exploreItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className="explore-item"
                onClick={() => navigate(item.path, { state: { title: item.title } })}
              >
                <span className={`explore-icon explore-icon-${item.tone}`}>
                  <Icon name={item.icon} size={20} />
                </span>
                <span className="explore-title">{item.title}</span>
                {item.isNew && <span className="explore-new">Mới</span>}
              </button>
            ))}
          </div>
        </section>

        <footer className="security-footer">
          <Icon name="lock" size={17} />
          <Text>Dữ liệu được bảo vệ an toàn</Text>
          <Text>NỀN TẢNG PHỤC VỤ CÔNG DÂN SỐ</Text>
        </footer>
      </main>
    </Page>
  );
};

export default IndexPage;
