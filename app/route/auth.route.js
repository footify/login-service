const Joi = require('joi');
const httpHelper = require('@footify/http-helper');
const dataApi = require('@footify/data-api');
const schemas = require('./auth.schema');
const facebookApi = require('../external-service/facebook-api');


function registerRoute(router) {
    router.post('/auth/facebook-connect', facebookConnect);
    router.post('/auth/facebook-register', facebookRegister);
}

function facebookConnect(req, res, next) {
    const validation = dataApi.utils.validateModel(req.body, schemas.facebookConnectSchema);
    if (validation.error) {
        const error = httpHelper.errors.invalidRequest;
        res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
    } else {
        const input = dataApi.utils.toCamelCase(validation.model);
        facebookApi.getUserInformation(input.access_token)
            .then((userInformation) => {
                if (userInformation === 1) {
                    const error = httpHelper.errors.invalidFacebookToken;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else if (userInformation === 2) {
                    const error = httpHelper.errors.invalidFacebookToken;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else {
                    return dataApi.userModel.getByFacebookEmail(result.id, result.facebookId);
                }
            }).then((user) => {
                if (!user) {
                    const error = httpHelper.errors.userNotFound;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else {
                    return generateToken(req.user, user);
                }
            }).then((authModel) => {
                res.status(200);
                res.json(httpHelper.utils.formatOutput(authModel, dataApi.authSchema));
                next();
            });
    }
}

function facebookRegister(req, res, next) {
    const validation = dataApi.utils.validateModel(req.body, schemas.facebookRegisterSchema);
    if (validation.error) {
        const error = httpHelper.errors.invalidRequest;
        res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
    } else {
        const input = validation.model;
        facebookApi.getUserInformation(input.accessToken)
            .then((userInformation) => {
                if (userInformation === 1) {
                    const error = httpHelper.errors.invalidFacebookToken;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else if (userInformation === 2) {
                    const error = httpHelper.errors.invalidFacebookToken;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else {
                    return dataApi.userModel.getByFacebookEmail(result.id, result.email);
                }
            }).then((user) => {
                if (user) {
                    const error = httpHelper.errors.userExist;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else {
                    return dataApi.userModel.getByPseudo(input.pseudo);
                }
            }).then((user) => {
                if (user) {
                    const error = httpHelper.errors.pseudoExist;
                    res.status(error.httpCode).json(httpHelper.utils.toSnakeCase(error.error));
                } else {
                    return dataApi.userRepository.create(result.id,
                        result.email,
                        input.pseudo,
                        result.first_name,
                        result.last_name);
                }
            }).then((user) => {
                if (!user) {
                    throw new Error('Unable to create user');
                }
                res.status(201);
                res.json(httpHelper.utils.formatOutput(user, dataApi.userSchema));
        });
    }
}

function generateToken(client, user) {

    return dataApi.accessTokenRepository.create(client, user)
        .then((cAccessToken) => {
            if (!cAccessToken) {
                throw new Error('Unable to create access token');
            }
            return dataApi.refreshTokenRepository.create(client, user)
                .then((refreshToken) => {
                    if (!refreshToken) {
                        throw new Error('Unable to create refresh token');
                    }
                    return {
                        access_token: cAccessToken.token,
                        refresh_token: cRefreshToken.token,
                        type: 'Bearer',
                        expires_in: dataApi.accessTokenRepository.duration
                    };
                });
        });
}

module.exports.registerRoute = registerRoute;