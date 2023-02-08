/**
 * config server NodeJS with Framwork Express.
 */

/**
 * setup server
 * @type {createApplication}
 */
const express = require('express');
const app = express();
const { session } = require('./config');
const passport = require('passport');
const passportSetup = require('./helpers/authHelper');
const db = require('./mongo/db');
const port = process.env.PORT || 3001;
/**
 * import module path.
 * https://devdocs.io/node/path
 * -----------------------------
 * path to work with files and folders
 * @type {module:path}
 */
const path = require('path');

// set up session cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [session.cookieKey]
}));
// initialize passport
app.use(passport.initialize());
app.use(passport.session());

/**
 * body-parser to get post data
 * https://github.com/expressjs/body-parser
 * @type {Parsers}
 */
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse body to JSON format
app.use(bodyParser.urlencoded({extended: false})); // parse application/x-www-form-urlencoded


/**
 * objects req (request) and res (response)
 * are exactly the same as those of NodeJS.
 * ---------------------------------------------
 * when the GET request happen, 
 * Node execute the callback function
 * and send html file as response
 */
const app_router = require('./routes/appRoutes');
app.use('/', app_router);

/**
 * start server on port ENV
 */
app.listen(port, () => {
    console.log(`App listening on port ${port} !`);
});

