import request from 'supertest';
import app from '../src/index';

// Mock the EmailHandler
const mockValidateEmailRequest = jest.fn();
const mockProcessEmailRequest = jest.fn();

jest.mock('../src/emailHandler', () => ({
  EmailHandler: jest.fn().mockImplementation(() => ({
    validateEmailRequest: mockValidateEmailRequest,
    processEmailRequest: mockProcessEmailRequest,
  })),
}));

describe('Express Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        productName: 'Windows 11 Pro: Licencia Original',
      },
    };

    it('should handle successful email sending', async () => {
      mockValidateEmailRequest.mockReturnValue({ valid: true });
      mockProcessEmailRequest.mockResolvedValue({
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

      expect(mockValidateEmailRequest).toHaveBeenCalledWith(validEmailRequest);
      expect(mockProcessEmailRequest).toHaveBeenCalledWith(validEmailRequest);
    });

    it('should handle email sending failure', async () => {
      mockValidateEmailRequest.mockReturnValue({ valid: true });
      mockProcessEmailRequest.mockResolvedValue({
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
      mockValidateEmailRequest.mockImplementation(() => {
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
      mockValidateEmailRequest.mockReturnValue({
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
