const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para verificar autenticación

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', authController.register);

// Iniciar sesión
router.post('/login', authController.login);

// Obtener usuario autenticado
router.get('/me', authMiddleware, authController.me);

// Verificar permiso
router.post('/can', authMiddleware, authController.can);

// Cambiar contraseña
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;