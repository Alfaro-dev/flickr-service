const userService = require('../services/userService');

/**
 * Obtiene todos los usuarios.
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error); // Maneja errores globales
  }
};

/**
 * Obtiene un usuario por su ID.
 */
const getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un usuario existente.
 */
const updateUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedUser = await userService.updateUser(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un usuario (soft delete).
 */
const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedUser = await userService.deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};