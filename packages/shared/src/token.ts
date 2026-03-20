type ShareTokenPayload = {
  applicationId: string;
  pageId?: string;
  userId?: string;
  role?: 'viewer' | 'editor';
  exp?: number;
};

const encodeBase64Url = (input: string) =>
  btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
};

export const createShareToken = (payload: ShareTokenPayload) => {
  return encodeBase64Url(JSON.stringify(payload));
};

export const parseShareToken = (token: string): ShareTokenPayload | null => {
  try {
    const payload = JSON.parse(decodeBase64Url(token)) as ShareTokenPayload;

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};