const Joi = require("joi");

const campgroundSchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required(),
  image: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
}).required();

module.exports = campgroundSchema;
