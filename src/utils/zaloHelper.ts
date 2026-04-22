import { getUserInfo, getAccessToken, getPhoneNumber, openWebview } from 'zmp-sdk/apis';

export async function getZaloUserInfo() {
  try {
    const { userInfo } = await getUserInfo({ autoLogin: true });
    return userInfo;
  } catch (error) {
    console.error('Error fetching Zalo User Info:', error);
    return null;
  }
}

export async function getZaloAccessToken(): Promise<string | null> {
  try {
    const { accessToken } = await getAccessToken();
    return accessToken;
  } catch (error) {
    console.error('Error fetching Access Token:', error);
    return null;
  }
}

export async function requestPhoneNumber(): Promise<string | null> {
  try {
    const { token } = await getPhoneNumber({});
    return token;
  } catch (error) {
    console.error('Error requesting phone number token:', error);
    return null;
  }
}

export function openExternalUrl(url: string, title?: string) {
  try {
    // Gọi Zalo SDK Webview
    openWebview({ url, title: title || '' });
    
    // Dự phòng cho môi trường localhost/Web giả lập:
    // Vì openWebview không hoạt động trên web PC, nên mở thêm window.open
    const isWeb = /Chrome|Safari|Firefox|Edge/i.test(navigator.userAgent) && !/Zalo/i.test(navigator.userAgent);
    if (isWeb) {
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Error opening Webview:', error);
    // Dự phòng nếu lỗi
    window.open(url, '_blank');
  }
}
