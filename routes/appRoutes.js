const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
const config = require('../config');
// --Passport
const passport = require('passport');

// metrics : 
var Prometheus = require('../metric/setup');
/**
 * The below arguments start the counter functions
 */
router.use(Prometheus.requestCounters);
router.use(Prometheus.responseCounters);
/**
 * Enable metrics endpoint
 */
Prometheus.injectMetricsRoute(router);
/**
 * Enable collection of default metrics
 */
Prometheus.startCollection(); 

// -- Impoort controller
const accounts_controller = require('../controllers/accountsController');
const tickets_controller = require('../controllers/ticketsController');
const gains_controller = require('../controllers/gainsController');


// CORS
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = {
    origin: config.clientURL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    maxAge: 3600
};
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
// end cors


// Test query React
router.get('/api/hello', cors(), (req, res) => {
    res.send({ express: 'Hello depuis Express' });
});

router.post('/api/world', cors(corsOptions), (req, res) => {
    res.send(
        `Ce resultat provient de l'API : ${req.body.post}`,
    );
});




// --Chargement des routes API

// API doc Page
//set up swagger ui
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../api/swagger/swagger.json');
router.use('/fatboar/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Account API
router.get('/accounts/getallaccounts',accounts_controller.getallaccounts);
router.post('/accounts/getaccountsbyfilter',accounts_controller.getaccountsbyfilter);
router.get('/accounts/getmyaccount',accounts_controller.getmyaccount);
router.put('/accounts/disableaccountbytoken',accounts_controller.disableaccountbytoken);
router.put('/accounts/disableaccountbyid',accounts_controller.disableaccountbyid);
router.put('/accounts/enableaccountbyid',accounts_controller.enableaccountbyid);
router.post('/accounts/addaccount',accounts_controller.addaccount);
router.put('/accounts/updateaccount',accounts_controller.updateaccount);
router.put('/accounts/updateaccountv2',accounts_controller.updateaccountv2);
router.put('/accounts/updateaccountbyid',accounts_controller.updateaccountbyid);
router.put('/accounts/updateaccountbyidv2',accounts_controller.updateaccountbyidv2);
router.get('/accounts/getrolebytoken',accounts_controller.getrolebytoken);
router.get('/accounts/getstataccounts',accounts_controller.getstataccounts);
router.post('/accounts/setacceptCGU',accounts_controller.setacceptCGU);
router.post('/accounts/setacceptCookies',accounts_controller.setacceptCookies);

//Account Auth API
router.post('/accounts/connection',accounts_controller.connection);
router.post('/accounts/sendforgotpasswordlink',accounts_controller.sendforgotpasswordlink);
router.post('/accounts/resetpassword/:token',accounts_controller.resetpassword);

//Ticket API
router.post('/tickets/addoneticket',tickets_controller.addoneticket);
router.get('/tickets/getalltickets/:idbegin',tickets_controller.getalltickets);
router.get('/tickets/getalltickets',tickets_controller.getalltickets);
router.post('/tickets/getticketssbyfilter',tickets_controller.getticketssbyfilter);
router.post('/tickets/getticketssbyfilter/:idbegin',tickets_controller.getticketssbyfilter);
router.post('/tickets/validateticket',tickets_controller.validateticket);
router.get('/tickets/getmytickets',tickets_controller.getmytickets);
router.get('/tickets/getstattickets',tickets_controller.getstattickets);

//Gain API
router.get('/gains/getallgains',gains_controller.getallgains);
router.post('/gains/getgainsbyfilter',gains_controller.getgainsbyfilter);
router.get('/gains/getmygain',gains_controller.getmygain);
router.post('/gains/takegain',gains_controller.takegain);
router.post('/gains/setbigwinner',gains_controller.setbigwinner);
router.get('/gains/getwinner',gains_controller.getwinner);
router.get('/gains/getstatgains',gains_controller.getstatgains);

/*******************GOOGLE AUTH ROUTES********************* */
// auth with google+
router.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));
// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/auth/google/callback*', passport.authenticate('google'), (req, res) => {
    if(req.user){
        res.cookie('token', req.user, {
            domain : 'fatboarrestaurant.com',
            secure : true,
            expires: new Date(Date.now() + 900000)
        });
        return res.redirect(config.clientURL);
    }
    else{
        console.log('error');
        return res.redirect(config.clientURL);
    }
});
/*******************END GOOGLE AUTH********************* */

/*******************FACEBOOK AUTH ROUTES********************* */
// auth with faceboook
router.get('/auth/facebook', passport.authorize('facebook', { scope : ['email'] }));
// callback route for facebook to redirect to
// hand control to passport to use code to grab profile info
router.get('/auth/facebook/callback*', passport.authenticate('facebook'), (req, res) => {
    if(req.user){
        res.cookie('token', req.user, {
            domain : 'fatboarrestaurant.com',
            secure : true,
            expires: new Date(Date.now() + 900000)
        });
        return res.redirect(config.clientURL);
    }
    else{
        console.log('error');
        return res.redirect(config.clientURL);
    }
});
/*******************END FACEBOOK AUTH********************* */

/*******************API TEST ONLY********************* */
router.delete('/test/deletetestaccount',accounts_controller.deletetestaccount);
router.delete('/test/deletetestgain',gains_controller.deletetestgain);
router.put('/test/updatetestticket',tickets_controller.updatetestticket);
router.post('/test/addadmintestaccount',accounts_controller.addadmintestaccount);
router.post('/test/addusertestaccount',accounts_controller.addusertestaccount);
router.delete('/test/deleteadminandusertestaccount',accounts_controller.deleteadminandusertestaccount);
router.post('/test/addtestticket',tickets_controller.addtestticket);
router.delete('/test/deletetestticket',tickets_controller.deletetestticket);
/*******************END API TEST ONLY***************** */
router.post('/tickets/generateautotickets',tickets_controller.generateautotickets);

// -- Exportation du module router avec nos routes.
module.exports = router;