const express = require('express');
const { getFlickrFeed } = require('../services/flickrService');

const router = express.Router();

// Ruta para obtener el feed de Flickr
router.get('/', async (req, res) => {
    const { tags } = req.query;

    try {
        // const cacheKey = `flickr:${tags || 'all'}`;

        // // Verifica si la respuesta ya está en caché
        // const cachedData = await redisClient.get(cacheKey);
        
        // if (cachedData) {
        //     return res.status(200).json(JSON.parse(cachedData));
        // }

        // Si no está en caché, solicita a la API de Flickr
        const data = await getFlickrFeed(tags);

        // Almacena la respuesta en Redis (caché por 1 hora)
        // await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 });

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Flickr feed:', error.message);
        res.status(500).json({ message: 'Failed to fetch Flickr feed' });
    }
});

module.exports = router;