const Joi = require('joi');

// DTO para la creación de un usuario
const createUserDTO = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'El correo electrónico no puede estar vacío.',
      'string.email': 'Debe ser un correo electrónico válido.',
      'any.required': 'El correo electrónico es obligatorio.',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'La contraseña no puede estar vacía.',
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
      'any.required': 'La contraseña es obligatoria.',
    }),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre no puede estar vacío.',
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre no puede superar los 100 caracteres.',
      'any.required': 'El nombre es obligatorio.',
    }),
  lastname: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El apellido no puede estar vacío.',
      'string.min': 'El apellido debe tener al menos 3 caracteres.',
      'string.max': 'El apellido no puede superar los 100 caracteres.',
      'any.required': 'El apellido es obligatorio.',
    }),
  birthdate: Joi.date()
    .optional()
    .messages({
      'date.base': 'La fecha de nacimiento debe ser válida.',
    }),
});

// DTO para la actualización de un usuario
const updateUserDTO = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Debe ser un correo electrónico válido.',
    }),
  password: Joi.string()
    .min(6)
    .optional()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
    }),
  name: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre no puede superar los 100 caracteres.',
    }),
  lastname: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El apellido debe tener al menos 3 caracteres.',
      'string.max': 'El apellido no puede superar los 100 caracteres.',
    }),
  birthdate: Joi.date()
    .optional()
    .messages({
      'date.base': 'La fecha de nacimiento debe ser válida.',
    }),
}).or('email', 'password', 'name', 'lastname', 'birthdate') // Al menos un campo debe estar presente
  .messages({
    'object.missing': 'Debe proporcionar al menos un campo para actualizar.',
  });

module.exports = {
  createUserDTO,
  updateUserDTO,
};