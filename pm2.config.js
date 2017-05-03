module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
        {
            name      : "footify-login-service",
            script    : "./index.js",
            watch: ['src', 'node_modules'],
            ignore_watch: ['data', 'log'],
            watch_options: {
                usePolling: true,
                // interval: 300,
                // useFsEvents: true // override usePolling for osx
            }
        }
    ]
};
