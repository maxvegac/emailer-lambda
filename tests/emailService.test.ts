import { EmailService } from '../src/emailService';
import { SMTPConfig } from '../src/types';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn(),
    sendMail: jest.fn(),
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    const nodemailer = require('nodemailer');
    mockTransporter = {
      verify: jest.fn(),
      sendMail: jest.fn(),
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const smtpConfig: SMTPConfig = {
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'test-password',
      },
    };

    emailService = new EmailService(smtpConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyConnection', () => {
    it('should return true when SMTP connection is successful', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await emailService.verifyConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    });

    it('should return false when SMTP connection fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verifyConnection();

      expect(result).toBe(false);
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendEmail', () => {
    const mockEmailRequest = {
      templateName: 'windows-license',
      to: 'test@example.com',
      from: 'noreply@test.com',
      subject: 'Test Email',
      data: {
        orderNumber: '1234567890',
        customerName: 'Test User',
        licenseKey: 'TEST-KEY-12345',
        productName: 'Windows 11 Pro: Licencia Original',
      },
    };

    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      const result = await emailService.sendEmail(mockEmailRequest);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
          to: 'test@example.com',
          subject: 'Test Email',
          html: expect.any(String),
        })
      );
    });

    it('should handle template not found error', async () => {
      const result = await emailService.sendEmail({
        ...mockEmailRequest,
        templateName: 'non-existent-template',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle SMTP send error', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await emailService.sendEmail(mockEmailRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP Error');
    });
  });
});
