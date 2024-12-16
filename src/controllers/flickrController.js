const { getFlickrFeed } = require('../services/flickrService');

const getFlickrPhotos = async (req, res) => {
  const { search, tags, sort, per_page, page } = req.query;

  const user = req.user || null; // Extrae al usuario autenticado del middleware

  try {
    const photos = await getFlickrFeed({ search, tags, sort, per_page, page }, user);
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Flickr feed' });
  }
};

module.exports = {
  getFlickrPhotos,
};