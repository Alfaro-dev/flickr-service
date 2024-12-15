const { User } = require('../models');

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
const getAllUsers = async () => {
  return await User.findAll({
    where: {
      deletedAt: null
    }
  });
};

/**
 * Obtiene un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} Usuario encontrado o null
 */
const getUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * Actualiza un usuario por ID
 * @param {number} id - ID del usuario a actualizar
 * @param {Object} updates - Datos para actualizar
 * @returns {Promise<Object|null>} Usuario actualizado o null si no existe
 */
const updateUser = async (id, updates) => {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  await user.update(updates);
  return user;
};

/**
 * Elimina un usuario por ID (Soft Delete)
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<Object|null>} Usuario eliminado o null si no existe
 */
const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  await user.destroy(); // Soft delete si tienes habilitado `paranoid: true` en el modelo
  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};