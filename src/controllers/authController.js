const authService = require('../services/authService');

/**
 * Registrar un nuevo usuario
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar sesión
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener el usuario autenticado
 */
const me = async (req, res, next) => {
  try {
    const user = await authService.me(req);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Verificar si un usuario tiene un permiso específico
 */
const can = async (req, res, next) => {
  try {
    const { permissionName } = req.body;
    const result = await authService.can(req, { permissionName });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cambiar la contraseña del usuario autenticado
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await authService.changePassword(req, { oldPassword, newPassword });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  can,
  changePassword,
};