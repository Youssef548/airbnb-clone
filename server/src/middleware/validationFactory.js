
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      if (error ) {
        res.status(400).json({ error: 'Validation Error', message: error.flatten() });
      } else {
        console.error('Validation Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

module.exports  = validateSchema;