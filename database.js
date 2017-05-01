const logger = require('winston');
const mongoose = require('mongoose');

const dbHost = process.env['DB_HOST'] || 'localhost';
const dbPort = process.env['DB_PORT'] || 27017;
const dbName = process.env['DB_NAME'] || 'footify';

function connectToDb() {
    const connectionStr = `mongodb://${dbHost}:${dbPort}/${dbName}`;

    return new Promise((resolve, reject) => {
        mongoose.connection.on('error', (err) => {
            reject(err);
        });

        mongoose.connection.on('open', () => {
            logger.info('DB Connection OK');
            resolve();
        });

        mongoose.connect(connectionStr);
    });
}

module.exports.connectToDb = connectToDb;