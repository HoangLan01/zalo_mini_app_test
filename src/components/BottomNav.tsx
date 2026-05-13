import React from 'react';
import { BottomNavigation, useLocation, useNavigate } from 'zmp-ui';
import { openChat } from 'zmp-sdk/apis';

const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? 'var(--primary, #0052cc)' : '#8f9499'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChatIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? 'var(--primary, #0052cc)' : '#8f9499'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = ['/vneid', '/ihanoi', '/dvc', '/quiz-take', '/ttdt'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const isHome = location.pathname === '/';

  return (
    <BottomNavigation fixed activeKey={isHome ? '/' : 'chat'} style={{ backgroundColor: '#FFFFFF', zIndex: 1000 }}>
      <BottomNavigation.Item
        key="/"
        label="Trang chủ"
        icon={<HomeIcon />}
        activeIcon={<HomeIcon active />}
        onClick={() => navigate('/', { replace: true })}
      />
      <BottomNavigation.Item
        key="chat"
        label="Nhắn tin OA"
        icon={<ChatIcon />}
        activeIcon={<ChatIcon active />}
        onClick={async () => {
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
        }}
      />
    </BottomNavigation>
  );
};

export default BottomNav;
