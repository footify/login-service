const gulp = require('gulp');
const logger = require('winston');
const database = require('./database');
const httpHelper = require('@footify/http-helper');

gulp.task('init-algolia', (done) => {
    return database.connectToDb()
        .then(() => {
            httpHelper.algoliaHelper.init();
            return httpHelper.algoliaHelper.initIndex();
        }).catch((e) => {
            logger.error(e);
        });
});