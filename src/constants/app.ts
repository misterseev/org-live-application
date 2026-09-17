export const APP_NAME = 'Org Live';
export const APP_TAGLINE = 'Real-time messaging for teams and friends';

export const MESSAGE_MAX_LENGTH = 5000;
export const SUPPORT_MESSAGE_MAX_LENGTH = 2000;
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
] as const;

export const AUTH_COOKIE_NAME = 'org_live_session';
export const MOCK_ACCESS_TTL_MS = 60 * 60 * 1000;

export const DEMO_CREDENTIALS = {
  email: 'alex@orglive.com',
  password: 'Password1',
} as const;

export const SUPPORT_QUICK_REPLIES = [
  { id: 'pricing', label: 'Pricing', reply: 'Org Live is free during beta. Pro plans start at $8/user/month after launch.' },
  { id: 'demo', label: 'Book a demo', reply: 'Sure — email hello@orglive.com and we will schedule a 20-minute walkthrough.' },
  { id: 'hours', label: 'Support hours', reply: 'Support is available Mon–Fri, 9:00–18:00 ICT. Outside hours you can leave a message here.' },
] as const;
