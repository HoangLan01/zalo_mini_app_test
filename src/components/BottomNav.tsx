import React from 'react';
import { BottomNavigation, Icon, useLocation, useNavigate } from 'zmp-ui';
import { openChat } from 'zmp-sdk/apis';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = ['/vneid', '/ihanoi', '/dvc', '/quiz-take'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <BottomNavigation fixed activeKey={location.pathname === '/' ? '/' : 'chat'} style={{ backgroundColor: '#FFFFFF', zIndex: 1000 }}>
      <BottomNavigation.Item
        key="/"
        label="Trang chủ"
        icon={<Icon icon="zi-home" />}
        activeIcon={<Icon icon="zi-home" />}
        onClick={() => navigate('/', { replace: true })}
      />
      <BottomNavigation.Item
        key="chat"
        label="Nhắn tin OA"
        icon={<Icon icon="zi-chat" />}
        activeIcon={<Icon icon="zi-chat" />}
        onClick={async () => {
          try {
            await openChat({
              type: 'oa',
              id: import.meta.env.VITE_ZALO_OA_ID || '3699742042171241198',
              message: 'Xin chào, tôi cần hỗ trợ',
            });
          } catch (error) {
            console.log(error);
          }
        }}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
