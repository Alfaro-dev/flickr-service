const { getFlickrFeed, getFlickrPhotoById } = require('../services/flickrService');

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

const getFlickrPhoto = async (req, res) => {
  const { id } = req.params;

  const user = req.user || null;

  try {
    const photo = await getFlickrPhotoById(id, user);
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photo details' });
  }
};

module.exports = {
  getFlickrPhotos,
  getFlickrPhoto,
};