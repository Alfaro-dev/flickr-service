const axios = require('axios');
const { History } = require('../models'); // Modelo de History
const redisClient = require('../config/redisConfig'); // Cliente Redis configurado
const { date } = require('joi');

/**
 * Obtiene el feed de Flickr con soporte de caché y guarda las búsquedas en el History del usuario autenticado.
 * @param {object} queryParams - Parámetros para la consulta.
 * @param {object} user - Usuario autenticado (opcional).
 * @returns {Promise<object>} - Los datos del feed de Flickr.
 */
const getFlickrFeed = async (queryParams, user) => {
  const { search, tags, sort = 'relevance', per_page = 50, page = 1 } = queryParams;

  const cacheKey = `${search || 'all'}:${tags || 'all'}:${sort}:${per_page}:${page}`;

  // Intenta recuperar los datos del caché
  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Error accediendo a Redis:', error.message);
  }

  try {
    // Configuración para la solicitud HTTP
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.flickr.com/services/rest',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.42.0',
      },
      params: {
        method: 'flickr.photos.search',         // Método de la API
        api_key: process.env.FLICKR_API_KEY,    // Clave de API desde el .env
        format: 'json',                         // Formato de respuesta
        nojsoncallback: 1,                      // Respuesta JSON pura
        sort: sort || 'relevance',              // Orden de los resultados (por relevancia por defecto)
        parse_tags: 1,                          // Interpretar etiquetas para mejorar precisión
        content_type: 7,                        // Tipo de contenido (7 por defecto: todos los tipos)
        per_page: per_page || 50,               // Número de resultados por página (50 por defecto)
        page: page || 1,                        // Página actual (1 por defecto)
        lang: 'en-US',    
        text: search,                      // Idioma de la respuesta
        tags: tags || '',                       // Texto o etiquetas a buscar (vacío por defecto)
        extras: [                               // Campos adicionales en la respuesta
          'description',
          'date_upload',
          'date_taken',
          'owner_name',
          'tags',
          'views',
          'url_m'
        ].join(','),                            // Lista de campos separados por comas
        csrf: '',                               // Token CSRF (vacío por defecto)
        hermes: 1,                              // Configuración interna de Flickr
        hermesClient: 1,                        // Configuración interna de Flickr
        reqId: 'f866abd5'                       // ID único de solicitud (puedes generar uno dinámico si es necesario)
      }
    };

    // Realiza la solicitud a la API de Flickr
    const response = await axios.request(config);

    // Procesa las fotos del feed
    const photos = response.data.photos.photo.map((item) => ({
      id: item.id,
      title: item.title,
      media: item.url_m,
      date_taken: item.datetaken,
      description: item.description._content,
      published: item.date_upload,
      author: item.ownername,
      views: item.views,
      tags: item.tags?.split(' ') || []
    }));

    // Guarda los datos en Redis por 10 minutos
    try {
      await redisClient.set(cacheKey, JSON.stringify(photos), { EX: 600 });
      console.log('Cache actualizado:', cacheKey);
    } catch (error) {
      console.error('Error guardando en Redis:', error.message);
    }

    // Si el usuario está autenticado, guarda la búsqueda en el History
    if (user) {
      try {
        await History.create({
          userId: user.id,
          action: 'search',
          value: JSON.stringify(queryParams),
          entity: 'FlickrFeed',
          entityId: null, // No se asocia a un ID específico en este caso
          createdBy: user.id,
        });
        console.log('History actualizado.');
      } catch (error) {
        console.error('Error al guardar el History:', error.message);
      }
    }

    return photos;
  } catch (error) {
    console.error('Error fetching data from Flickr:', error.message);
    throw new Error('Failed to fetch data from Flickr API');
  }
};

const getFlickrPhotoById = async (photoId, user) => {
  const cacheKey = `photo:${photoId}`;

  // Intenta recuperar los datos del caché
  // try {
  //   const cachedData = await redisClient.get(cacheKey);

  //   if (cachedData) {
  //     console.log('Cache hit:', cacheKey);
  //     return JSON.parse(cachedData);
  //   }
  // } catch (error) {
  //   console.error('Error accediendo a Redis:', error.message);
  // }

  try {
    // Configuración para obtener los detalles de la foto
    const photoDetailsConfig = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.flickr.com/services/rest',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.42.0',
      },
      params: {
        method: 'flickr.photos.getInfo',
        api_key: process.env.FLICKR_API_KEY,
        photo_id: photoId,
        format: 'json',
        nojsoncallback: 1,
      },
    };

    // Configuración para obtener los comentarios de la foto
    const commentsConfig = {
      method: 'get',
      url: 'https://api.flickr.com/services/rest',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.42.0',
      },
      params: {
        method: 'flickr.photos.comments.getList',
        api_key: process.env.FLICKR_API_KEY,
        photo_id: photoId,
        format: 'json',
        nojsoncallback: 1,
      },
    };

    // Realiza las solicitudes en paralelo
    const [photoResponse, commentsResponse] = await Promise.all([
      axios.request(photoDetailsConfig),
      axios.request(commentsConfig),
    ]);

    console.log('Photo response:', photoResponse.data);

    const photo = photoResponse.data.photo;
    const comments = commentsResponse.data.comments.comment || [];

    // Formateamos los detalles de la foto
    const formattedPhoto = {
      id: photo.id,
      title: photo.title._content,
      description: photo.description._content,
      media: photo.urls.url[0]._content,
      date_taken: photo.dates.taken,
      published: photo.dates.posted,
      author: photo.owner.realname || photo.owner.username,
      views: photo.views,
      tags: photo.tags.tag.map((tag) => tag.raw),
      comments: comments.map((comment) => ({
        id: comment.id,
        author: comment.authorname,
        content: comment._content,
        date_created: comment.datecreate,
      })),
    };

    // Guarda los datos en Redis por 10 minutos
    try {
      await redisClient.set(cacheKey, JSON.stringify(formattedPhoto), { EX: 600 });
      console.log('Cache actualizado:', cacheKey);
    } catch (error) {
      console.error('Error guardando en Redis:', error.message);
    }

    // Si el usuario está autenticado, guarda la acción en el History
    if (user) {
      try {
        await History.create({
          userId: user.id,
          action: 'view',
          value: photoId,
          entity: 'FlickrPhoto',
          entityId: photoId,
          createdBy: user.id,
        });
        console.log('History actualizado.');
      } catch (error) {
        console.error('Error al guardar el History:', error.message);
      }
    }

    return formattedPhoto;
  } catch (error) {
    console.error('Error fetching photo from Flickr:', error.message);
    throw new Error('Failed to fetch photo from Flickr API');
  }
};

module.exports = {
  getFlickrFeed,
  getFlickrPhotoById,
};