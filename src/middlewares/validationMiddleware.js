/**
 * Middleware para validar datos de entrada utilizando un esquema (por ejemplo, Joi).
 * @param {object} schema - Esquema de validación.
 */
const validateDTO = (schema) => (req, res, next) => {
    // Valida el cuerpo de la solicitud contra el esquema proporcionado
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false para obtener todos los errores
    if (error) {
      // Mapea los detalles de error a un arreglo de mensajes claros
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }
    next(); // Continúa al siguiente middleware o controlador
};

module.exports = validateDTO;