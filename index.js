const app = require('./app');
const logger = require('winston');
const database = require('./database');

const env = process.env['NODE_ENV'] || 'development';

require('dotenv').config({ path: `./.env.${env}` });


const appPort = process.env['API_PORT'] || 3000;


logger.info('Starting service ...');
database.connectToDb()
    .then(() => {
        app().listen(appPort, () => {
            logger.info(`App started on port ${process.env['API_PORT'] || 3000}`);
        });
    }).catch((e) => {
        logger.error(e);
    });
