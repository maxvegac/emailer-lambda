import request from 'supertest';
import app from '../src/index';

// Mock the EmailHandler
jest.mock('../src/emailHandler', () => ({
  EmailHandler: jest.fn().mockImplementation(() => ({
    validateEmailRequest: jest.fn(),
    processEmailRequest: jest.fn(),
  })),
}));

describe('Express Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'Windows License Emailer',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /test', () => {
    it('should return sample request data', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('sampleRequest');
      expect(response.body).toHaveProperty('instructions');
      expect(response.body.sampleRequest).toMatchObject({
        templateName: 'windows-license',
        to: 'test@example.com',
        from: 'noreply@yourcompany.com',
        data: {
          orderNumber: '3036952450',
          customerName: 'Davis Torres',
          licenseKey: 'NKBFB-K2WRR-RTWV2-VD277-46YP6',
        },
      });
    });
  });

  describe('POST /send-email', () => {
    const validEmailRequest = {
      templateName: 'windows-license',
      to: 'test@example.com',
      from: 'noreply@test.com',
      subject: 'Test Email',
      data: {
        orderNumber: '1234567890',
        customerName: 'Test User',
        licenseKey: 'TEST-KEY-12345',
      },
    };

    it('should handle successful email sending', async () => {
      const { EmailHandler } = require('../src/emailHandler');
      const mockEmailHandler = new EmailHandler();
      mockEmailHandler.validateEmailRequest.mockReturnValue({ valid: true });
      mockEmailHandler.processEmailRequest.mockResolvedValue({
        success: true,
        statusCode: 200,
        messageId: 'test-message-id',
        message: 'Email sent successfully',
      });

      const response = await request(app)
        .post('/send-email')
        .send(validEmailRequest)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        messageId: 'test-message-id',
        message: 'Email sent successfully',
      });

      expect(mockEmailHandler.validateEmailRequest).toHaveBeenCalledWith(validEmailRequest);
      expect(mockEmailHandler.processEmailRequest).toHaveBeenCalledWith(validEmailRequest);
    });

    it('should handle email sending failure', async () => {
      const { EmailHandler } = require('../src/emailHandler');
      const mockEmailHandler = new EmailHandler();
      mockEmailHandler.validateEmailRequest.mockReturnValue({ valid: true });
      mockEmailHandler.processEmailRequest.mockResolvedValue({
        success: false,
        statusCode: 500,
        error: 'Template not found',
      });

      const response = await request(app)
        .post('/send-email')
        .send(validEmailRequest)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Template not found',
      });
    });

    it('should handle handler errors', async () => {
      const { EmailHandler } = require('../src/emailHandler');
      const mockEmailHandler = new EmailHandler();
      mockEmailHandler.validateEmailRequest.mockImplementation(() => {
        throw new Error('Handler error');
      });

      const response = await request(app)
        .post('/send-email')
        .send(validEmailRequest)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should validate request body', async () => {
      const { EmailHandler } = require('../src/emailHandler');
      const mockEmailHandler = new EmailHandler();
      mockEmailHandler.validateEmailRequest.mockReturnValue({
        valid: false,
        error: 'Required fields: templateName, to, data, from',
      });

      const response = await request(app)
        .post('/send-email')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
      });
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: expect.any(Array),
      });
    });
  });
});
