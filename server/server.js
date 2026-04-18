import dotenv from 'dotenv';
import app from './src/app.js';
import { initializeDatabase } from './src/config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 3001);

const start = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();