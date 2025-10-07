import { EmailService } from './emailService';
import { EmailRequest, SMTPConfig } from './types';

/**
 * Core email sending logic (used by both Express and Lambda)
 */
export class EmailHandler {
  private emailService: EmailService;

  constructor() {
    // Configure SMTP from environment variables
    const smtpConfig: SMTPConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.emailService = new EmailService(smtpConfig);
  }

  /**
   * Process email request and return result
   */
  async processEmailRequest(emailRequest: EmailRequest): Promise<{
    success: boolean;
    statusCode: number;
    messageId?: string;
    error?: string;
    message?: string;
  }> {
    try {
      // Validate SMTP configuration
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return {
          success: false,
          statusCode: 500,
          error: 'Incomplete SMTP configuration. Check environment variables.',
        };
      }

      // Verify SMTP connection
      const connectionOk = await this.emailService.verifyConnection();
      if (!connectionOk) {
        return {
          success: false,
          statusCode: 500,
          error: 'Could not connect to SMTP server',
        };
      }

      // Send email
      const result = await this.emailService.sendEmail(emailRequest);

      if (result.success) {
        return {
          success: true,
          statusCode: 200,
          messageId: result.messageId,
          message: 'Email sent successfully',
        };
      } else {
        return {
          success: false,
          statusCode: 500,
          error: result.error,
        };
      }
    } catch (error) {
      console.error('Error in email handler:', error);
      return {
        success: false,
        statusCode: 500,
        error: 'Internal server error',
      };
    }
  }

  /**
   * Validate email request
   */
  validateEmailRequest(emailRequest: unknown): { valid: boolean; error?: string } {
    if (
      !emailRequest.templateName ||
      !emailRequest.to ||
      !emailRequest.data ||
      !emailRequest.from
    ) {
      return {
        valid: false,
        error: 'Required fields: templateName, to, data, from',
      };
    }

    if (
      !emailRequest.data.orderNumber ||
      !emailRequest.data.customerName ||
      !emailRequest.data.licenseKey
    ) {
      return {
        valid: false,
        error: 'Required data fields: orderNumber, customerName, licenseKey',
      };
    }

    return { valid: true };
  }
}
