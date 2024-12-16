const { User } = require('../models');

const validateUniqueEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verifica si el correo ya existe en la base de datos
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    next();
  } catch (error) {
    console.error('Error validando el correo único:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = validateUniqueEmail;