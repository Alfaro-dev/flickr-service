require('dotenv').config();
const express = require('express');
const redis = require('redis');

const { getFlickrFeed } = require('./services/flickrService');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración básica de Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
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

// Ruta básica para probar el servidor
app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

app.get('/test-redis', async (req, res) => {
    try {
      // Guarda un valor en Redis
      await redisClient.set('test_key', 'Hello from Redis', { EX: 60 }); // Caduca en 60 segundos
  
      // Recupera el valor desde Redis
      const value = await redisClient.get('test_key');
  
      res.status(200).json({ message: 'Redis is working!', value });
    } catch (error) {
      console.error('Redis test failed:', error.message);
      res.status(500).json({ message: 'Failed to interact with Redis' });
    }
});

app.get('/flickr-feed', async (req, res) => {
    const { tags } = req.query;
  
    try {
      const data = await getFlickrFeed(tags);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching Flickr feed:', error.message);
      res.status(500).json({ message: 'Failed to fetch Flickr feed' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});