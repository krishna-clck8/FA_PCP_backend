import crypto from 'crypto';

export const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};
