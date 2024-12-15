const axios = require('axios'); // Axios para hacer solicitudes HTTP
const redisClient = require('../cache'); // Redis para el caché

/**
 * Obtiene el feed de Flickr con soporte de caché.
 * @param {string} tags - Etiquetas opcionales para filtrar las imágenes.
 * @returns {Promise<object>} - Los datos del feed de Flickr.
 */
const getFlickrFeed = async (tags) => {
//   const cacheKey = tags ? `photos:${tags}` : 'photos:all';

//   // Intenta recuperar los datos del caché
//   const cachedData = await redisClient.get(cacheKey);

//   if (cachedData) {
//     return JSON.parse(cachedData);
//   }

  try {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=true',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'PostmanRuntime/7.42.0',
            'Cookie': 'ccc=%7B%22needsConsent%22%3Afalse%2C%22managed%22%3A0%2C%22changed%22%3A0%2C%22info%22%3A%7B%22cookieBlock%22%3A%7B%22level%22%3A0%2C%22blockRan%22%3A0%7D%7D%7D; xb=096243'
        },
        params: {
            tags: tags
        }
    };

    const response = await axios.request(config);

    const photos = response.data.items.map((item) => ({
        title: item.title,
        link: item.link,
        media: item.media.m,
        date_taken: item.date_taken,
        description: item.description,
        published: item.published,
        author: item.author,
        tags: item.tags.split(' '),
    }));

    // Save the data in the cache for 10 minutes
    // await redisClient.set(cacheKey, photos, { EX: 600 });

    return photos;
  } catch (error) {
    console.error('Error fetching data from Flickr:', error.message);
    throw new Error('Failed to fetch data from Flickr API');
  }
};

module.exports = {
  getFlickrFeed,
};