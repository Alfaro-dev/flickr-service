const express = require('express');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flickrRoutes = require('./routes/flickrRoutes');

const app = express();

// Middleware para analizar JSON
app.use(express.json());

// Usar las rutas de usuario
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/flickr-feed', flickrRoutes);

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;