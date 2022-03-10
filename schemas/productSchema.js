const Joi = require('@hapi/joi');

module.exports = Joi.object({
  name: Joi.string()
    .min(5),
  quantity: Joi.number()
    .min(1),
  id: Joi.string()
    .length(24)
    .message('Wrong id format'),
});
