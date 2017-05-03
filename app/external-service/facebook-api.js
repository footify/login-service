const request = require('request');
const queryString = require('querystring');

function getUserInformation(token, userId) {
    return new Promise((resolve) => {
        const url = `https://graph.facebook.com/v2.9/${userId}?${queryString.stringify({
            fields: 'first_name,last_name,email,id,picture.height(100)',
            access_token: token
        })}`;

        request.get(url, (err, res, body) => {
            if (err) {
                throw err;
            } else if (res.statusCode !== 200) {
                resolve(1);
            } else {
                const reply = JSON.parse(body);
                if (reply.id === undefined || reply.first_name === undefined ||
                    reply.last_name === undefined || reply.email === undefined || reply.picture === undefined) {
                    resolve(2);
                } else {
                    resolve(reply);
                }
            }
        });
    });
}

module.exports.getUserInformation = getUserInformation;