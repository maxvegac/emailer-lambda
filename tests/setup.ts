import 'dotenv/config';

// Mock environment variables for testing
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.test.com';
process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
process.env.SMTP_SECURE = process.env.SMTP_SECURE || 'false';
process.env.SMTP_USER = process.env.SMTP_USER || 'test@test.com';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'test-password';

// Global test timeout
jest.setTimeout(10000);
