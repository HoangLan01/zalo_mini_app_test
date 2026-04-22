import React from 'react';
import { BottomNavigation, Icon } from 'zmp-ui';
import { useLocation, useNavigate } from 'zmp-ui';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  const isMainTab = ['/', '/news', '/services', '/profile'].includes(location.pathname);
  if (!isMainTab) return null;

  // Determine active tab based on pathname
  let activeTab = '/';
  if (location.pathname.startsWith('/news')) activeTab = '/news';
  else if (location.pathname.startsWith('/services')) activeTab = '/services';
  else if (location.pathname.startsWith('/profile')) activeTab = '/profile';

  return (
    <BottomNavigation fixed activeKey={activeTab} onChange={handleTabChange} style={{ backgroundColor: '#FFFFFF' }}>
      <BottomNavigation.Item
        key="/"
        label="Trang chủ"
        icon={<Icon icon="zi-home" />}
        activeIcon={<Icon icon="zi-home" />}
      />
      <BottomNavigation.Item
        key="/news"
        label="Tin tức"
        icon={<Icon icon="zi-list-1" />} // Zi docs doesn't have zipper/newspaper usually, zi-list-1 or zi-notebox is ok
        activeIcon={<Icon icon="zi-list-1" />}
      />
      <BottomNavigation.Item
        key="/services"
        label="Dịch vụ"
        icon={<Icon icon="zi-grid" />}
        activeIcon={<Icon icon="zi-grid" />}
      />
      <BottomNavigation.Item
        key="/profile"
        label="Cá nhân"
        icon={<Icon icon="zi-user" />}
        activeIcon={<Icon icon="zi-user" />}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
