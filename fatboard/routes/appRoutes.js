const express = require('express');
const router = express.Router();
const {check} = require('express-validator');

// -- Importation de nos controleurs
const default_controller = require('../controllers/defaultController');
const account_controller = require('../controllers/accountController');
const api_controller = require('../controllers/apiController');

// -- Chargement des routes
router.get('/', default_controller.index);
router.get('/accounts', default_controller.accounts);
router.get('/account/:id', default_controller.account);
router.get('/ajouter-un-account', account_controller.add);
router.post('/ajouter-un-account', [
    check('prenom').trim().not().isEmpty().withMessage('Vous devez saisir le prénom.'),
    check('nom').trim().not().isEmpty().withMessage('Vous devez saisir le nom.'),
    check('email').trim().normalizeEmail().not().isEmpty().withMessage('Vous devez saisir un email.').isEmail().withMessage('Le format de votre email est incorrect'),
    check('tel').blacklist(' ').isMobilePhone('fr-FR').withMessage('Vérifiez le format de votre numéro de téléphone.')
], account_controller.create);
router.get('/deleteaccount/:id', account_controller.deleteaccount);
router.post('/account/:id', [
    check('prenom').trim().not().isEmpty().withMessage('Vous devez saisir le prénom.'),
    check('nom').trim().not().isEmpty().withMessage('Vous devez saisir le nom.'),
    check('email').trim().normalizeEmail().not().isEmpty().withMessage('Vous devez saisir un email.').isEmail().withMessage('Le format de votre email est incorrect'),
    check('tel').blacklist(' ').isMobilePhone('fr-FR').withMessage('Vérifiez le format de votre numéro de téléphone.')
], account_controller.account);


// --Chargement des routes API
router.get('/apidoc',api_controller.apidoc);
router.get('/api/accounts',api_controller.getaccounts);
router.get('/api/account/:id',api_controller.getaccount);
router.delete('/api/deleteaccount/:id',api_controller.deleteaccount);
router.post('/api/addaccount',api_controller.createaccount);
router.put('/api/updateaccount/:id',api_controller.updateaccount);

// -- Exportation du module router avec nos routes.
module.exports = router;