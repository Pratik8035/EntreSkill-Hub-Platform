const { z } = require('zod');

/**
 * Zod refinement that validates a MongoDB ObjectId string (24 hex characters).
 */
const objectId = () =>
  z.string().refine((val) => /^[a-fA-F0-9]{24}$/.test(val), {
    message: 'Invalid MongoDB ObjectId',
  });

module.exports = { objectId };
