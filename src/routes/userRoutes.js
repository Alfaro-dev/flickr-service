const express = require('express');
const userController = require('../controllers/userController');
const validateDTO = require('../middlewares/validationMiddleware');
const { updateUserDTO } = require('../validators/userValidator');

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/', userController.getUsers);

// Ruta para obtener un usuario por ID
router.get('/:id', userController.getUserById);

// Ruta para actualizar un usuario (valida con updateUserDTO)
router.put('/:id', validateDTO(updateUserDTO), userController.updateUser);

// Ruta para eliminar un usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;