const Joi = require('joi');

const facebookConnectSchema = Joi.object().keys({
    accessToken: Joi.string()
});

const facebookRegisterSchema = Joi.object().keys({
    accessToken: Joi.string(),
    pseudo: Joi.string()
});

module.exports = {
    facebookConnectSchema: facebookConnectSchema,
    facebookRegisterSchema: facebookRegisterSchema
};