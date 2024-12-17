const axios = require('axios');
const { History } = require('../models'); // History model
const redisClient = require('../config/redisConfig'); // Redis client

const FLICKR_API_URL = process.env.FLICKR_API_URL;
const FLICKR_API_KEY = process.env.FLICKR_API_KEY;

/**
 * Fetches Flickr photos based on search parameters, with Redis caching and optional history logging.
 * @param {object} queryParams - Query parameters for search (tags, sort, pagination).
 * @param {object} user - Authenticated user (optional).
 * @returns {Promise<object>} - Paginated Flickr photo data.
 */
const getFlickrFeed = async (queryParams, user) => {
  const { search, tags, sort = 'relevance', per_page = 50, page = 1 } = queryParams;

  const cacheKey = `${search || 'search-all'}:${tags || 'tag-all'}:${sort}:${per_page}:${page}`;

  // Attempt to retrieve from Redis cache
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Error accessing Redis:', error.message);
  }

  try {
    console.log('query params:', search, tags, sort, per_page, page);
    // Flickr API request configuration
    const config = createFlickrConfig('flickr.photos.search', {
      sort,
      per_page,
      page,
      tags: tags || '',
      text: search,
      extras: 'description,date_upload,date_taken,owner_name,tags,views,url_m',
    });

    // Fetch photos from Flickr
    const response = await axios.request(config);

    console.log('Flickr API response:', response.data);

    const pagination = {
      page: response.data.photos.page,
      pages: response.data.photos.pages,
      perpage: response.data.photos.perpage,
      total: response.data.photos.total,
    };

    const photos = response.data.photos.photo.map((item) => ({
      id: item.id,
      title: item.title,
      media: item.url_m,
      date_taken: item.datetaken,
      description: item.description._content,
      published: item.date_upload,
      author: item.ownername,
      views: item.views,
      tags: item.tags?.split(' ').filter(tag => tag) || [],
    }));

    const result = { pagination, photos };

    // Save to Redis cache
    await saveToCache(cacheKey, result);

    // Log to History if the user is authenticated
    if (user && (search || tags)) {
      await saveToHistory(user, search ? 'search' : 'tags', queryParams, 'FlickrFeed', null);
    }

    return result;
  } catch (error) {
    console.error('Error fetching data from Flickr:', error.message);
    throw new Error('Failed to fetch data from Flickr API');
  }
};

/**
 * Fetches details for a specific Flickr photo, including comments, with Redis caching and optional history logging.
 * @param {string} photoId - ID of the photo.
 * @param {object} user - Authenticated user (optional).
 * @returns {Promise<object>} - Photo details and comments.
 */
const getFlickrPhotoById = async (photoId, user) => {
  const cacheKey = `photo:${photoId}`;

  // Attempt to retrieve from Redis cache
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Error accessing Redis:', error.message);
  }

  try {
    // Fetch photo details and comments in parallel
    const [photoResponse, commentsResponse] = await Promise.all([
      axios.request(createFlickrConfig('flickr.photos.getInfo', { photo_id: photoId })),
      axios.request(createFlickrConfig('flickr.photos.comments.getList', { photo_id: photoId })),
    ]);

    const photo = photoResponse.data.photo;
    const comments = commentsResponse.data.comments.comment || [];

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

    // Save to Redis cache
    await saveToCache(cacheKey, formattedPhoto);

    // Log to History if the user is authenticated
    if (user) {
      await saveToHistory(user, 'view', photoId, 'FlickrPhoto', photoId);
    }

    return formattedPhoto;
  } catch (error) {
    console.error('Error fetching photo from Flickr:', error.message);
    throw new Error('Failed to fetch photo from Flickr API');
  }
};

/**
 * Creates a Flickr API request configuration.
 * @param {string} method - Flickr API method.
 * @param {object} params - Query parameters.
 * @returns {object} - Axios request configuration.
 */
const createFlickrConfig = (method, params) => ({
  method: 'get',
  url: FLICKR_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'NodeApp',
  },
  params: {
    method,
    api_key: FLICKR_API_KEY,
    format: 'json',
    nojsoncallback: 1,
    ...params,
  },
});

/**
 * Saves data to Redis cache.
 * @param {string} key - Cache key.
 * @param {object} data - Data to cache.
 * @param {number} expiration - Expiration time in seconds (default 10 minutes).
 */
const saveToCache = async (key, data, expiration = 600) => {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: expiration });
    console.log('Cache updated:', key);
  } catch (error) {
    console.error('Error saving to Redis:', error.message);
  }
};

/**
 * Logs an action to the History model.
 * @param {object} user - Authenticated user.
 * @param {string} action - Action type (e.g., 'search', 'view').
 * @param {object} value - Value being logged.
 * @param {string} entity - Entity type (e.g., 'FlickrFeed').
 * @param {number|null} entityId - Entity ID.
 */
const saveToHistory = async (user, action, value, entity, entityId) => {
  try {
    await History.create({
      userId: user.id,
      action,
      value: JSON.stringify(value),
      entity,
      entityId,
      createdBy: user.id,
    });
    console.log('History updated for user:', user.id);
  } catch (error) {
    console.error('Error saving to History:', error.message);
  }
};

module.exports = {
  getFlickrFeed,
  getFlickrPhotoById,
};