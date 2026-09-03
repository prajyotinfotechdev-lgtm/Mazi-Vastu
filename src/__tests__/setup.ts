// ─── Test Setup ─────────────────────────────────────────────────────────────
// Sets up environment variables for tests.
// ──────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/majhi_vastu_test?schema=public';
process.env.AUTH_SECRET = 'test-auth-secret-at-least-16-chars';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkPs-OZI2IQ4CR_JsINH2W0f6CcbLYVLCqnpkPtNAs';
process.env.VAPID_PRIVATE_KEY = 'UUxI4o8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';
process.env.VAPID_SUBJECT = 'mailto:test@majivastu.com';
process.env.ADMIN_EMAIL = 'admin@majivastu.com';
process.env.ADMIN_PASSWORD = 'TestPassword123';
process.env.WHATSAPP_ADMIN_NUMBER = '919876543210';
