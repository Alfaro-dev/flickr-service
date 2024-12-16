const express = require('express');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const flickrController = require('../controllers/flickrController');

const router = express.Router();


router.get('/', optionalAuthMiddleware, flickrController.getFlickrPhotos);

module.exports = router;