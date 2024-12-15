const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  console.log('Connected to Redis!');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

// Conecta Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected.');
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
})();

module.exports = redisClient;