import { usersDb } from '../config/db.js';

export const createUserDocument = async (user) => usersDb.insert(user);

export const findUserByUsername = async (username) => usersDb.findOne({ username });

export const findUserById = async (userId) => usersDb.findOne({ _id: userId });

export const updateUserPassword = async (userId, passwordHash) =>
  usersDb.update(
    { _id: userId },
    {
      $set: {
        passwordHash,
        updatedAt: new Date().toISOString(),
      },
    }
  );