const {validationResult} = require('express-validator');
const Account = require('../models/account');
/**
 * La page d'accueil
 */
exports.index = (req, res) => {
    res.redirect('/accounts');
};

/**
 * Lister les accounts
 */
exports.accounts = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        //Get list of account from DB
        Account.find(function(err, accounts){
            if (err){
                res.send(err); 
            }
            res.render("accounts", {
                'title': 'Mes accounts',
                'accounts': accounts,
            }); 
            
        }); 
    }else{
        res.render("accounts", {
            'title':'Mes accounts',
            'errors' : errors.array()
        });
    }
};




/**
 * Afficher un account
 */
exports.account = (req, res) => {
    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        console.log(req.params.id);
        //Get account by id from DB
        Account.findById(req.params.id,function(err, account){
            if (err){
                res.send(err); 
            }
            res.render("account", {
                'title': 'Fiche du account',
                'account': account,
            }); 
            
        }); 
    }else{
        res.render("accounts", {
            'title':'Mes accounts',
            'errors' : errors.array()
        });
    }
};