const { User } = require('../models/index');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware opcional para autenticar al usuario.
 * Si está logueado, se añade `req.user`. Si no, continúa sin bloquear.
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      // No hay token, permitimos continuar sin usuario
      req.user = null;
      return next();
    }

    const token = authorization.replace("Bearer ", "").trim();

    if (!token) {
      // Token vacío, permitimos continuar sin usuario
      req.user = null;
      return next();
    }

    // Verificamos el token y extraemos el userId
    const { userId } = verifyToken(token);

    // Buscamos al usuario en la base de datos
    const user = await User.findByPk(userId, {
      include: ['Roles'], // Asumiendo que hay una relación con Roles
    });

    if (!user) {
      // Usuario no encontrado, permitimos continuar sin usuario
      req.user = null;
      return next();
    }

    // Agregamos el usuario al objeto `req` para uso posterior
    req.user = user;

  } catch (error) {
    console.error('Error verifying token or fetching user:', error.message);
    // En caso de error, continuamos sin usuario
    req.user = null;
  }

  next(); // Continuamos al siguiente middleware o controlador
};

module.exports = optionalAuthMiddleware;