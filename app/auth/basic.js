const dataApi = require('@footify/data-api');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

function init () {
    passport.use(new BasicStrategy((key, secret, done) => {
            return dataApi.clientModel.getByCredential(key, secret)
                .then((client) => done());
        }
    ));
}

module.exports.init = init;