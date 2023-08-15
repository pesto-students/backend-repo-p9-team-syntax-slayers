import 'reflect-metadata'; // Import reflect-metadata shim
import dotenv from 'dotenv';

import { initializeSentry } from './config/sentry';
import app from './app';

// Load environment variables from .env file
dotenv.config();
const port = process.env.PORT || 3001;

initializeSentry(); // Initialize Sentry

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
export default app;
