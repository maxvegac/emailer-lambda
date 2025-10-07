import serverlessExpress from '@vendia/serverless-express';
import app from './index';

// Export the Express app wrapped for Lambda
export const handler = serverlessExpress({ app });
