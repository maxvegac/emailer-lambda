# Windows License Emailer Lambda

A TypeScript AWS Lambda function for sending Windows license delivery emails via SMTP with template support using Handlebars.

## Features

- 📧 Send Windows license delivery emails via SMTP
- 🎨 Template system with Handlebars
- 🔧 Configurable via environment variables
- 🚀 Deploy with OpenTofu (Terraform)
- 📝 Windows license delivery template included
- 🔒 Secure SMTP configuration
- 🌐 API Gateway integration

## Project Structure

```
emailer/
├── src/
│   ├── templates/          # Email templates (Handlebars)
│   │   └── windows-license.hbs
│   ├── index.ts           # Main Lambda handler
│   ├── emailService.ts    # Email service logic
│   ├── templateService.ts # Template rendering service
│   └── types.ts          # TypeScript type definitions
├── terraform/             # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- AWS CLI configured
- OpenTofu (or Terraform) installed

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd emailer
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### SMTP Configuration

Copy the example terraform variables file and configure your SMTP settings:

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Edit `terraform/terraform.tfvars` with your SMTP configuration:

```hcl
# SMTP Configuration
smtp_host = "smtp.gmail.com"
smtp_port = 587
smtp_secure = false
smtp_user = "your-email@gmail.com"
smtp_pass = "your-app-password"
default_from_email = "noreply@yourcompany.com"
```

### Gmail Setup

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `smtp_pass`

## Deployment

1. Initialize Terraform:
```bash
cd terraform
tofu init
```

2. Plan the deployment:
```bash
tofu plan
```

3. Deploy the infrastructure:
```bash
tofu apply
```

## Usage

### API Endpoint

After deployment, you'll get an API Gateway URL. Send POST requests to:
```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}/send-email
```

### Request Format

```json
{
  "templateName": "windows-license",
  "to": "customer@example.com",
  "subject": "Windows 11 Pro License - Order 3036952450",
  "data": {
    "orderNumber": "3036952450",
    "customerName": "Davis Torres",
    "licenseKey": "NKBFB-K2WRR-RTWV2-VD277-46YP6"
  }
}
```

### Available Templates

#### Windows License Template
- **templateName**: `windows-license`
- **Variables**: 
  - `orderNumber`: Order number (e.g., "3036952450")
  - `customerName`: Customer name (e.g., "Davis Torres")
  - `licenseKey`: Windows license key (e.g., "NKBFB-K2WRR-RTWV2-VD277-46YP6")

### Response Format

**Success Response:**
```json
{
  "success": true,
  "messageId": "message-id-from-smtp",
  "message": "Email sent successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Development

### Template Structure

The Windows license template includes:
- Order number and customer name
- License key display
- Activation instructions
- Conversion instructions for Windows Home to Pro
- Contact information for support
- Professional styling with IVI branding

### Local Testing

1. Build the project:
```bash
npm run build
```

2. Test the Lambda function locally using AWS SAM or similar tools.

### Environment Variables

The Lambda function uses these environment variables:

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_SECURE`: Whether to use secure connection (true/false)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `DEFAULT_FROM_EMAIL`: Default from email address

## Security Considerations

- Store SMTP credentials securely using AWS Secrets Manager or environment variables
- Use VPC endpoints if deploying in a VPC
- Implement proper IAM roles with least privilege
- Enable CloudWatch logging for monitoring
- Consider rate limiting for the API Gateway

## Monitoring

The function creates CloudWatch logs for monitoring. Check the logs for:
- Email sending success/failure
- SMTP connection issues
- Template rendering errors

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Verify SMTP credentials
   - Check if 2FA is enabled (use App Password for Gmail)
   - Ensure SMTP server allows connections

2. **Template Not Found**
   - Verify template name matches filename (without .hbs)
   - Check template is in `src/templates/` directory

3. **Lambda Timeout**
   - Increase timeout in terraform variables
   - Check SMTP server response time

## License

MIT License
