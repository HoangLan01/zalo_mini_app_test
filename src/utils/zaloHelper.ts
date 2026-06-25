import { getAccessToken, getPhoneNumber, getUserInfo, openWebview } from 'zmp-sdk/apis';

export function logDevError(message: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
}

export async function getZaloUserInfo() {
  try {
    const { userInfo } = await getUserInfo({ autoRequestPermission: true });
    return userInfo;
  } catch (error) {
    logDevError('Error fetching Zalo User Info:', error);
    return null;
  }
}

export async function getZaloAccessToken(): Promise<string | null> {
  try {
    const accessToken = await getAccessToken();

    if (typeof accessToken === 'string') {
      return accessToken;
    }

    if (
      accessToken &&
      typeof accessToken === 'object' &&
      'accessToken' in accessToken &&
      typeof accessToken.accessToken === 'string'
    ) {
      return accessToken.accessToken;
    }

    return null;
  } catch (error) {
    logDevError('Error fetching Access Token:', error);
    return null;
  }
}

export async function requestPhoneNumber(): Promise<string | null> {
  try {
    const { token } = await getPhoneNumber({});
    return token ?? null;
  } catch (error) {
    logDevError('Error requesting phone number token:', error);
    return null;
  }
}

export function openExternalUrl(url: string) {
  try {
    openWebview({ url, config: { style: 'normal' } });

    const isWeb = /Chrome|Safari|Firefox|Edge/i.test(navigator.userAgent) && !/Zalo/i.test(navigator.userAgent);
    if (isWeb) {
      window.open(url, '_blank');
    }
  } catch (error) {
    logDevError('Error opening Webview:', error);
    window.open(url, '_blank');
  }
}
