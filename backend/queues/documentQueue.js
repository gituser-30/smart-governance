const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_HOST?.includes('upstash') ? {} : undefined
};

const documentQueue = new Queue('documentVerificationQueue', { connection });

const addDocumentToQueue = async (data) => {
  // Push the data to bullmq background processing
  await documentQueue.add('verifyJob', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

module.exports = { documentQueue, addDocumentToQueue, connection };
