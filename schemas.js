const Joi = require("joi");

module.exports.userSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).required(),
});
