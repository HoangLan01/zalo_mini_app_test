import { create } from 'zustand';
import { getZaloUserInfo } from '../utils/zaloHelper';

interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  phoneNumber?: string;
}

interface UserState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  isLoading: false,
  fetchUser: async () => {
    set({ isLoading: true });
    const userInfo = await getZaloUserInfo();
    // userInfo from Zalo SDK will be typed as any or specific type. We map it nicely.
    if (userInfo) {
      set({
        userInfo: {
          id: userInfo.id,
          name: userInfo.name,
          avatar: userInfo.avatar,
        },
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
