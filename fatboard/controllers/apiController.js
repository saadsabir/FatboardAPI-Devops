const {validationResult} = require('express-validator');
const Account = require('../models/account');

/**
 * API Doc page
 */
exports.apidoc = (req, res) => {
    res.render("apidoc", {
        'title':'API Doc'
    });
};

/**
 * GET /api/accounts 
 */
exports.getaccounts = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        //Get list of account from DB
        Account.find(function(err, accounts){
            if (err){
                res.send(err); 
            }
            res.json(accounts); 
            
        }); 
    }else{
        res.json(errors);
    }
};

/**
 * GET /api/account/:id 
 */
exports.getaccount = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        console.log(req.params.id);
        //Get account by id from DB
        Account.findById(req.params.id,function(err, account){
            if (err){
                res.send(err); 
            }
            res.json(account); 
            
        }); 
    }else{
        res.json(errors);
    }
};

/**
 * DELETE /api/deleteaccount/
 */
exports.deleteaccount = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        console.log(req.params.id);
        //Delete account by id from DB
        Account.remove({_id : req.params.id},function(err, account){
            if (err){
                res.send(err); 
            }
            res.json({message:"Le account "+req.params.id+" a été bien supprimé"}); 
            
        }); 
    }else{
        res.json(errors);
    }
};

/**
 * POST /api/addaccount/
 */
exports.createaccount = (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if(errors.isEmpty()){
        console.log(req.params.id);
        //creer account in DB
        const account = new Account({
            prenom : req.body.prenom,
            nom : req.body.nom,
            email : req.body.email,
            tel : req.body.tel,
        });
        //sauvegarde des données
        account.save((err => {
            if(err) console.log(err);
            res.json({message:"Le account "+account._id+" a été bien ajouté"});
        }));
    }else{
        res.json(errors);
    }
};

/**
 * PUT /api/updateaccount/:id
 */
exports.updateaccount = (req, res) => {

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
                res.json({message : "Le account "+account._id+" a été bien modifié"})
            });
            
        }); 
    }else{
        res.json(errors);
    }
};