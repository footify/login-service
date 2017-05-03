const boom = require('boom');
const httpHelper = require('@footify/http-helper');
const dataApi = require('@footify/data-api');
const schemas = require('./auth.schema');
const facebookApi = require('../external-service/facebook-api');


function registerRoute(router) {
    router.post('/auth/facebook-connect', httpHelper.generateRoute(facebookConnect));
    router.post('/auth/facebook-register', httpHelper.generateRoute(facebookRegister));
}

function facebookConnect(req, res, next) {
    const input = httpHelper.utils.getInput(req.body, schemas.facebookConnectInputSchema);
    if (input.error) {
        throw boom.badRequest('Invalid request', input.error);
    }
    return facebookApi.getUserInformation(input.value.accessToken, 'me')
        .then((userInformation) => {
            if (userInformation === 1 || userInformation === 2) {
                throw boom.badRequest('Invalid facebook token');
            }
            return dataApi.userRepository.getByFacebookEmail(userInformation.id, userInformation.email)
                .then((user) => {
                    if (!user) {
                        throw boom.notFound('User not found');
                    } else {
                        return generateToken(req.user, user)
                            .then((token) => {
                                httpHelper.sendReply(res, 200, token, schemas.facebookConnectOutputSchema);
                            });
                    }
                });
        }).catch((e) => {
            httpHelper.handleError(res, e);
        });
}

function facebookRegister(req, res, next) {
    const input = httpHelper.utils.getInput(req.body, schemas.facebookRegisterInputSchema);
    if (input.error) {
        throw boom.badRequest('Invalid request', input.error);
    }
    return facebookApi.getUserInformation(input.value.accessToken, 'me')
        .then((userInformation) => {
            if (userInformation === 1 || userInformation === 2) {
                throw boom.badRequest('Invalid facebook token');
            }
            return dataApi.userRepository.getByFacebookEmail(userInformation.id, userInformation.email)
                .then((user) => {
                    if (user) {
                        throw boom.forbidden('User exists (email address already in use)');
                    }
                    return dataApi.userRepository.getByPseudo(input.value.pseudo)
                        .then((user) => {
                            if (user) {
                                throw boom.conflict('User exists (pseudo already in use)');
                            }
                            return dataApi.userRepository.create(userInformation.id,
                                userInformation.email,
                                input.value.pseudo,
                                userInformation.first_name,
                                userInformation.last_name,
                                userInformation.picture.data.url)
                                .then((user) => {
                                    if (!user) {
                                        throw new Error('Unable to create user');
                                    }
                                    const algoliaObj = {
                                        name: '@' + user.pseudo,
                                        type: 'user',
                                        id: user._id
                                    };
                                    return httpHelper.algoliaHelper.addObjToIndex(['global', 'users'], algoliaObj).then(() => {
                                            httpHelper.sendReply(res, 201, user.toObject(), schemas.facebookRegisterOutputSchema);
                                    });
                                });
                        });
                });
        })
        .catch((e) => {
            httpHelper.handleError(res, e);
        });
}

function generateToken(client, user) {

    return dataApi.accessTokenRepository.create(client, user)
        .then((cAccessToken) => {
            if (!cAccessToken) {
                throw new Error('Unable to create access token');
            }
            return dataApi.refreshTokenRepository.create(client, user)
                .then((cRefreshToken) => {
                    if (!cRefreshToken) {
                        throw new Error('Unable to create refresh token');
                    }
                    return {
                        accessToken: cAccessToken.token,
                        refreshToken: cRefreshToken.token,
                        type: 'Bearer',
                        expiresIn: dataApi.accessTokenRepository.duration
                    };
                });
        });
}

module.exports.registerRoute = registerRoute;