const logger = require('../logger');
const { httpStatus } = require('../constants');

class ValidationMiddleware {
  /**
   * @desc    Validates request data against provided Joi schema
   * @param   {Object} schema - Joi validation schema object with optional body, params, query keys
   * @returns {Function} Express middleware function
   */
  static validateRequest(schema) {
    return (req, res, next) => {
      try {
        const validationOptions = {
          abortEarly: false, // Return all validation errors, not just the first one
          allowUnknown: true, // Allow unknown keys in the object (useful for additional fields)
          stripUnknown: true, // Remove unknown keys from the validated data
        };

        // Validate request body
        if (schema.body) {
          const { error, value } = schema.body.validate(req.body, validationOptions);
          
          if (error) {
            const errors = error.details.map((detail) => ({
              field: detail.path.join('.'),
              message: detail.message,
            }));

            logger.warn('Validation error:', { errors, body: req.body });

            return res.status(httpStatus.BAD_REQUEST).json({
              success: false,
              message: 'Validation error',
              errors,
              statusCode: httpStatus.BAD_REQUEST,
            });
          }

          req.body = value; // Replace with validated and sanitized data
        }

        // Validate request params
        if (schema.params) {
          const { error, value } = schema.params.validate(req.params, validationOptions);
          
          if (error) {
            const errors = error.details.map((detail) => ({
              field: detail.path.join('.'),
              message: detail.message,
            }));

            logger.warn('Validation error in params:', { errors, params: req.params });

            return res.status(httpStatus.BAD_REQUEST).json({
              success: false,
              message: 'Validation error in URL parameters',
              errors,
              statusCode: httpStatus.BAD_REQUEST,
            });
          }

          req.params = value;
        }

        // Validate request query
        if (schema.query) {
          const { error, value } = schema.query.validate(req.query, validationOptions);
          
          if (error) {
            const errors = error.details.map((detail) => ({
              field: detail.path.join('.'),
              message: detail.message,
            }));

            logger.warn('Validation error in query:', { errors, query: req.query });

            return res.status(httpStatus.BAD_REQUEST).json({
              success: false,
              message: 'Validation error in query parameters',
              errors,
              statusCode: httpStatus.BAD_REQUEST,
            });
          }

          req.query = value;
        }

        next();
      } catch (err) {
        logger.error('Validation middleware error:', err);
        
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Validation processing error',
          error: err.message,
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    };
  }

  /**
   * @desc    Validates MongoDB ObjectId
   * @param   {string} paramName - Name of the parameter to validate
   * @returns {Function} Express middleware function
   */
  static validateObjectId(paramName = 'id') {
    return (req, res, next) => {
      const id = req.params[paramName];
      
      // MongoDB ObjectId regex pattern
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      
      if (!objectIdPattern.test(id)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: `Invalid ${paramName} format`,
          statusCode: httpStatus.BAD_REQUEST,
        });
      }
      
      next();
    };
  }
}

module.exports = ValidationMiddleware;