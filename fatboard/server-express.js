/**
 * Mettons en place notre serveur
 * NodeJS grâce au Framwork Express.
 */

/**
 * Mise en Place du serveur
 * @type {createApplication}
 */
const express = require('express');
const app = express();
const port = 3000;

/**
 * Importation du module path.
 * https://devdocs.io/node/path
 * -----------------------------
 * Grâce a path nous allons pouvoir
 * travailler avec des fichiers / dossiers.
 * @type {module:path}
 */
const path = require('path');

/**
 * Configuration du templating
 * avec Handlebars.
 * @type {exphbs}
 */
const hbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();

/**
 * Custom Helper permettant de rechercher une
 * valeur dans un tableau d'objets.
 * @param collection
 * @param param
 * @returns {boolean|*}
 */
helpers.ifIn = (collection = [], param) => {
    for(let i = 0 ; i < collection.length ; i++) {
        if(collection[i].param === param) {
            return collection[i];
        }
    }
    return false;
};

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: helpers
}));

app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'hbs');

/**
 * Configuration de la connexion à MongoDB
 * https://mongoosejs.com/docs/connections.html
 * @type {mongoose}
 */
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/accounts';
mongoose.connect(mongoDB, { useNewUrlParser:true });

//Recuperer la connexion par defaut
const db = mongoose.connection;

//en cas d'erreur de connexion
db.on('error', console.error.bind(console, 'connection'))


/**
 * Pour récupérer les données POST.
 * https://github.com/expressjs/body-parser
 * @type {Parsers}
 */
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Parser le body au format JSON.
app.use(bodyParser.urlencoded({extended: false})); // Parser application/x-www-form-urlencoded

/**
 * Le Middleware Static pour nos assets
 * https://expressjs.com/fr/starter/static-files.html
 */
app.use('/public',
    express.static(__dirname + '/public'));

/**
 * Les objets req (demande) et res (réponse)
 * sont exactement les mêmes que ceux de NodeJS.
 * ---------------------------------------------
 * Lorsqu'une requête GET arrive, la fonction
 * de callback est executé par Node et nous
 * envoyons comme réponse notre fichier HTML.
 */
const app_router = require('./routes/appRoutes');
app.use('/', app_router);
// app.use('/admin', admin_router);
// app.use('/api', api_router);

/**
 * Gestion des erreurs 404
 * Autre possibilité :
 * https://expressjs.com/fr/starter/faq.html
 */
app.get('/*', (req, res) => {
    res.render("error", {
        'title':'Erreur 404'
    });
});

/**
 * Démarrer le serveur sur le port 3000
 */
app.listen(port, () => {
    console.log(`App listening on port ${port} !`);
});
