const { User } = require('../models/index');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware para verificar la autenticación basada en JWT.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verificamos el token y extraemos el userId
    const { userId } = verifyToken(token);

    // Buscamos el usuario en la base de datos
    const user = await User.findByPk(userId, {
      include: ['Roles'], // Asumiendo que hay una relación con Roles
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Agregamos el usuario al objeto `req` para uso posterior
    req.user = user;
    next(); // Continuamos al siguiente middleware o controlador

  } catch (error) {
    console.error('Error verifying token or fetching user:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;