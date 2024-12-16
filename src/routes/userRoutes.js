const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para verificar autenticación
const adminMiddleware = require('../middlewares/adminMiddleware'); // Middleware para verificar si el usuario es administrador
const selfMiddleware = require('../middlewares/selfMiddleware'); // Middleware para verificar si el usuario es el mismo
const validateDTO = require('../middlewares/validationMiddleware');
const { updateUserDTO } = require('../validators/userValidator');

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);

// Ruta para obtener un usuario por ID
router.get('/:id', authMiddleware, selfMiddleware, userController.getUserById);

// Ruta para actualizar un usuario (valida con updateUserDTO)
router.put('/:id', authMiddleware, selfMiddleware, validateDTO(updateUserDTO), userController.updateUser);

// Ruta para eliminar un usuario
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;