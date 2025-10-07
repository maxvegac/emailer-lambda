export interface EmailRequest {
  templateName: string;
  data: {
    orderNumber: string;
    customerName: string;
    licenseKey: string;
    productName: string;
  };
  to: string | string[];
  from: string;
  subject?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface TemplateData {
  [key: string]: unknown;
}
