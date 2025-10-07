import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { EmailHandler } from './emailHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Main email endpoint
app.post('/send-email', async (req, res) => {
  try {
    console.log('📧 Email request received:', JSON.stringify(req.body, null, 2));

    const emailHandler = new EmailHandler();

    // Validate request
    const validation = emailHandler.validateEmailRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Process email
    const result = await emailHandler.processEmailRequest(req.body);

    // Send response
    res.status(result.statusCode).json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      message: result.message,
    });
  } catch (error) {
    console.error('💥 Error in Express handler:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['POST /send-email - Send email'],
  });
});

// Start server only if not in Lambda environment
if (process.env.NODE_ENV !== 'lambda') {
  app.listen(PORT);
}

export default app;
