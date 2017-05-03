const Joi = require('joi');

const facebookConnectInputSchema = Joi.object().keys({
    accessToken: Joi.string().required()
});
const facebookConnectOutputSchema =  Joi.object().keys({
    access_token: Joi.string(),
    refresh_token: Joi.string(),
    type: Joi.string().valid('Bearer'),
    expires_in: Joi.number()
});

const facebookRegisterInputSchema = Joi.object().keys({
    accessToken: Joi.string().required(),
    pseudo: Joi.string().required()
});

const facebookRegisterOutputSchema = Joi.object().keys({
    id: Joi.any().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    pseudo: Joi.string().required(),
    email: Joi.string().required(),
    picture_url: Joi.string()
});

module.exports = {
    facebookConnectInputSchema: facebookConnectInputSchema,
    facebookConnectOutputSchema: facebookConnectOutputSchema,
    facebookRegisterInputSchema: facebookRegisterInputSchema,
    facebookRegisterOutputSchema: facebookRegisterOutputSchema,
};