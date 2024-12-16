const express = require('express');
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});