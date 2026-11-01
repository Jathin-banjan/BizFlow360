import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (err: any) {
      console.warn('MongoDB connection pending or failed in serverless function:', err.message);
    }
  }
  return app(req, res);
}
