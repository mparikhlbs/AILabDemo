import Datastore from 'nedb-promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

export const usersDb = Datastore.create({
  filename: path.join(dataDir, 'users.db'),
  autoload: true,
  timestampData: false,
});

export const quizzesDb = Datastore.create({
  filename: path.join(dataDir, 'quizzes.db'),
  autoload: true,
  timestampData: false,
});

export const resultsDb = Datastore.create({
  filename: path.join(dataDir, 'results.db'),
  autoload: true,
  timestampData: false,
});

export const initializeDatabase = async () => {
  await usersDb.ensureIndex({ fieldName: 'username', unique: true });
  await quizzesDb.ensureIndex({ fieldName: 'userId' });
  await resultsDb.ensureIndex({ fieldName: 'userId' });
  await resultsDb.ensureIndex({ fieldName: 'quizId', unique: true });
};