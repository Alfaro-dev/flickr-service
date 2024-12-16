const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para verificar autenticación
const validateDTO = require('../middlewares/validationMiddleware');
const { createUserDTO } = require('../validators/userValidator');
const validateUniqueEmail = require('../middlewares/uniqueEmailMiddleware');

const router = express.Router();

// Registrar un nuevo usuario
router.post(
    '/register',
    validateDTO(createUserDTO), // Valida las reglas básicas de Joi
    validateUniqueEmail,        // Verifica que el correo sea único en la base de datos
    authController.register     // Controlador para manejar el registro
);

// Iniciar sesión
router.post('/login', authController.login);

// Obtener usuario autenticado
router.get('/me', authMiddleware, authController.me);

// Verificar permiso
router.post('/can', authMiddleware, authController.can);

// Cambiar contraseña
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;