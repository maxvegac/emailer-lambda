import { handler } from '../src/lambda';
import { LambdaFunctionURLEvent, Context } from 'aws-lambda';

// Mock the EmailService
jest.mock('../src/emailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    verifyConnection: jest.fn().mockResolvedValue(true),
    sendEmail: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
    }),
  })),
}));

describe('Lambda Handler', () => {
  let mockEmailService: any;
  let mockContext: Context;

  beforeEach(() => {
    const { EmailService } = require('../src/emailService');
    mockEmailService = new EmailService();
    mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'test-function',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
      memoryLimitInMB: '256',
      awsRequestId: 'test-request-id',
      logGroupName: '/aws/lambda/test-function',
      logStreamName: 'test-stream',
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (body: any): LambdaFunctionURLEvent => ({
    version: '2.0',
    routeKey: 'POST /',
    rawPath: '/',
    rawQueryString: '',
    headers: {
      'content-type': 'application/json',
      'content-length': JSON.stringify(body).length.toString(),
    },
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      domainName: 'test.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'test',
      http: {
        method: 'POST',
        path: '/',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test-agent',
      },
      requestId: 'test-request-id',
      routeKey: 'POST /',
      stage: 'test',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  });

  describe('Request validation', () => {
    it('should return 400 when body is missing', async () => {
      const event = createMockEvent(null);
      delete event.body;

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Request body required');
    });

    it('should return 400 when JSON is invalid', async () => {
      const event = createMockEvent(null);
      event.body = 'invalid json';

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid JSON');
    });

    it('should return 400 when required fields are missing', async () => {
      const event = createMockEvent({
        templateName: 'windows-license',
        // missing to, data, from
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Required fields');
    });

    it('should return 400 when template data is incomplete', async () => {
      const event = createMockEvent({
        templateName: 'windows-license',
        to: 'test@example.com',
        from: 'noreply@test.com',
        data: {
          orderNumber: '123',
          // missing customerName, licenseKey
        },
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Required data fields');
    });
  });

  describe('SMTP configuration', () => {
    it('should return 500 when SMTP config is incomplete', async () => {
      // Mock missing environment variables
      const originalEnv = process.env;
      process.env = {};

      const event = createMockEvent({
        templateName: 'windows-license',
        to: 'test@example.com',
        from: 'noreply@test.com',
        data: {
          orderNumber: '1234567890',
          customerName: 'Test User',
          licenseKey: 'TEST-KEY-12345',
        },
      });

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('SMTP configuration');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Email sending', () => {
    const validRequest = {
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

    beforeEach(() => {
      // Mock environment variables
      process.env.SMTP_HOST = 'smtp.test.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_SECURE = 'false';
      process.env.SMTP_USER = 'test@test.com';
      process.env.SMTP_PASS = 'test-password';
    });

    it('should return 500 when SMTP connection fails', async () => {
      mockEmailService.verifyConnection.mockResolvedValue(false);

      const event = createMockEvent(validRequest);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Could not connect');
    });

    it('should send email successfully', async () => {
      mockEmailService.verifyConnection.mockResolvedValue(true);
      mockEmailService.sendEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const event = createMockEvent(validRequest);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.messageId).toBe('test-message-id');
      expect(body.message).toContain('successfully');
    });

    it('should handle email sending failure', async () => {
      mockEmailService.verifyConnection.mockResolvedValue(true);
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        error: 'Template not found',
      });

      const event = createMockEvent(validRequest);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Template not found');
    });
  });
});
