import nodemailer, { Transporter } from 'nodemailer';
import { SMTPConfig, EmailRequest, EmailResponse } from './types';
import { TemplateService } from './templateService';

export class EmailService {
  private transporter: Transporter;
  private templateService: TemplateService;

  constructor(smtpConfig: SMTPConfig) {
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });
    this.templateService = new TemplateService();
  }

  /**
   * Sends an email using a template
   */
  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      // Check that template exists
      const templateExists = await this.templateService.templateExists(request.templateName);
      if (!templateExists) {
        return {
          success: false,
          error: `Template '${request.templateName}' not found`,
        };
      }

      // Render template
      const htmlContent = await this.templateService.renderTemplate(
        request.templateName,
        request.data
      );

      // Configure email
      const mailOptions = {
        from: request.from,
        to: Array.isArray(request.to) ? request.to.join(', ') : request.to,
        cc: request.cc
          ? Array.isArray(request.cc)
            ? request.cc.join(', ')
            : request.cc
          : undefined,
        bcc: request.bcc
          ? Array.isArray(request.bcc)
            ? request.bcc.join(', ')
            : request.bcc
          : undefined,
        subject: request.subject || 'Windows License Delivery',
        html: htmlContent,
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }

  /**
   * Verifies SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error verifying SMTP connection:', error);
      return false;
    }
  }
}
