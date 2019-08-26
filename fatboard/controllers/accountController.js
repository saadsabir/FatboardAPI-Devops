const {validationResult} = require('express-validator');
const Account = require('../models/account');
const session = require('express-session')
const flash = require('flash')();

/**
 * Permet d'affiche le formulaire
 * permettant l'ajout d'un account
 * @param req
 * @param res
 */
exports.add = (req, res) => {
    res.render("new-account", {
        'title':'Ajouter un account'
    });
};

/**
 * Traitement POST du Formulaire.
 * @param req
 * @param res
 */
exports.create = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        //Créer dans la BDD
        //Creation d'un objet account
        const account = new Account({
            prenom : req.body.prenom,
            nom : req.body.nom,
            email : req.body.email,
            tel : req.body.tel,
        });
        //sauvegarde des données
        account.save((err => {
            if(err) console.log(err);
            //Redirection sur la fiche du account.
            //res.redirect('/account/'+ account._id);
            res.redirect('/accounts/');
        }));

    }else{
        res.render("new-account", {
            'title':'Ajouter un account',
            'errors': errors.array()
        });
    }    
};

/**
 * DELETE /deleteaccount/:id
 */
exports.deleteaccount = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        //Delete account by id from DB
        Account.remove({_id : req.params.id},function(err, account){
            if (err){
                res.send(err); 
            }
            //res.json({message:"Le account "+req.params.id+" a été bien supprimé"}); 
            req.flash('info : ', "Le account "+req.params.id+" a été bien supprimé");
            res.redirect('/accounts/');
        }); 
    }else{
        req.flash('error : ', errors);
        res.render("deleteaccount", {
            'title':'Mes accounts',
            'errors': errors.array()
        });
    }
};
/**
 * UPDATE /updateaccount/:id
 */
exports.account = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        console.log(req.params.id);
        //first get account
        Account.findById(req.params.id,function(err, account){
            if (err){
                res.send(err); 
            }
            //update account by id in DB
            account.nom = req.body.nom;
            account.prenom = req.body.prenom;
            account.email = req.body.email;
            account.tel = req.body.tel;

            account.save(function(err){
                if(err) res.send(err);

                //If its ok
                res.redirect('/accounts/');
            });
            
        }); 
    }else{
        res.render("account", {
            'title':'Mes accounts',
            'errors': errors.array()
        });
    }
};