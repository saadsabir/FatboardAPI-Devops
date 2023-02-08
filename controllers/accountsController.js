/**********************Accounts**************************/
const {validationResult} = require('express-validator');
const Account = require('../models/account');
const logHelper = require('../helpers/logHelper');
const config = require('../config');
// --Json Web Token JWT
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
//mailer
var nodemailer = require('nodemailer');
var schemes = config.schemes;
var client = config.client;
//test config
const testconf = require('../test/config');

/**
 * POST /accounts/connection
 */
exports.connection = (req, res) => {
    try{
        var email = req.body.email;
        var password = req.body.password;
        //email accept only alphabet and numbers and those three caracters ._- and respect the form of an normal email like "example@example.example" max lenght 60
        var checkemail=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        //password max lenght 25 and accept only alphabet and numbers and those caracters .!#%&*+=?^_-@ 
        var checkpw =/^[a-zA-Z0-9.!#%&*+=?^@_-]*$/;
        //verify if email and password respect caracters 
        if (checkemail.test(email) && email.length<61 && checkpw.test(password) && password.length<=25){
            //get email and password
            if( ( (typeof email !== 'undefined') || (email === '') ) ||
            ( (typeof password !== 'undefined') || ( password === '') ) ){
                //check email if Exist in DB
                Account.find({email : email},function(err, account){
                    if (err){
                        res.status(400);
                        resultats = {
                            "success": false,
                            "message": "Error : "+err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else if (account.length!=0){
                        if(account[0].enable===false){
                            res.status(403);
                                resultats = {
                                    "success": false,
                                    "message": 'This account is disabled, please contact support for more information',
                                    "result": ''
                                }
                                res.json(resultats);
                        }
                        if((account[0].google.id)===undefined && (account[0].facebook.id)===undefined){//dont have google & facebook account
                            if(account.length){
                                //if exist,
                                //get password of this account
                                if(bcrypt.compareSync(password,account[0].password)){//if password ok
                                    //create new token
                                    try{
                                        jwt.sign({
                                            account
                                        },
                                        config.secretKey,
                                        (err,token) => {
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            res.status(200);
                                            resultats = {
                                                "success": true,
                                                "message": "SUCCESS",
                                                "result": token
                                            }
                                            res.json(resultats);
                                        });
                                    }catch(e){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : '+ e,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                }
                                else{
                                    res.status(401);
                                    resultats = {
                                        "success": false,
                                        "message": "Error, check email/password",
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }

                            }
                            else{
                                res.status(401);
                                resultats = {
                                    "success": false,
                                    "message": 'Error : check email/password',
                                    "result": ''
                                }
                                res.json(resultats);
                            }
                        }
                        else{
                            res.status(401);
                            resultats = {
                                "success": false,
                                "message": "Error, check email/password",
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                    else{
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": "Error, check email/password",
                            "result": ''
                        }
                        res.json(resultats);
                    }
                });
            }
            else{
                res.status(400);
                resultats = {
                    "success": false,
                    "message": 'Error : check email/password',
                    "result": ''
                }
                res.json(resultats);
            }
        }
        else{
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : Email/Password format not authorized',
                "result": ''
            }
            res.json(resultats);
        }
    }catch(e){
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ e,
            "result": ''
        }
        res.json(resultats);
    }
}

/**
 * GET /accounts/getallaccounts (admin or serveur only)
 */
exports.getallaccounts = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        //check if authdata account exist in DB
                        if(id !== 'undefined'){
                            //find account
                            Account.findById(id,function (err,account){
                                if(account === null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(err){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : '+err,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                    else{
                                        var role = account.role;
                                        if(role==="admin" || role==="serveur"){
                                            //Get list of accounts from DB
                                            Account.find(function(err, accounts){
                                                if (err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+ err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }else{
                                                    res.status(200);
                                                    resultats = {
                                                        "success": true,
                                                        "message": "SUCCESS",
                                                        "result": accounts
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }else{
                                            res.status(401);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : token dont have permissions for this function',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }
                                    }
                                }
                            })
                        }
                        else{
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * POST /accounts/getaccountsbyfilter (admin or serveur only)
 */
exports.getaccountsbyfilter = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        //check if authdata account exist in DB
                        if(id !== 'undefined'){
                            //find account
                            Account.findById(id,function (err,account){
                                if(account === null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(err){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : '+err,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                    else{
                                        var role = account.role;
                                        if(role==="admin" || role==="serveur"){
                                            //Get list of accounts by email from DB
                                            var email = req.body.email;
                                            var role= req.body.role;
                                            var enable = req.body.enable;
                                            console.log(email+role+enable);
                                            Account.find({$or:[ {'email':email}, {'role':role}, {'enable':enable} ]},function(err, accounts){
                                                if (err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+ err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }else{
                                                    res.status(200);
                                                    resultats = {
                                                        "success": true,
                                                        "message": "SUCCESS",
                                                        "result": accounts
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }else{
                                            res.status(401);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : token dont have permissions for this function',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }
                                    }
                                }
                            })
                        }
                        else{
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * GET /accounts/getmyaccount
 */
exports.getmyaccount = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //Get account by id from DB
                            Account.findById(id,function(err, account){
                                if (err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    res.status(200);
                                    resultats = {
                                        "success": true,
                                        "message": "SUCCESS",
                                        "result": account
                                    }
                                    res.json(resultats);
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/disableaccountbytoken
 */
exports.disableaccountbytoken = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //find account
                            Account.findById(id,function (err,account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{//set enable to false
                                    account.enable = false;
                                    account.save(function(err){
                                        if(err){
                                            res.status(400);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : '+err,
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }else{
                                            //send email
                                            var smtpTransport = nodemailer.createTransport({
                                                service : 'Gmail',
                                                auth : {
                                                    user : config.supportemail,
                                                    pass : config.gmailPSW
                                                }
                                            });
                                            var mailOptions = {
                                                to : account.email,
                                                from: 'Fatboar Restaurant <'+config.supportemail+'>',
                                                subject : "Votre compte FATBOAR a été désactivé",
                                                text : "Votre compte : "+account.email+" a bien été désactivé. \n \n Nous vous remercions pour votre intérêt et espérons vous compter très prochainement parmi les membres de notre communauté.\n A bientôt ! \n \n L'équipe FATBOAR"
                                            }
                                            smtpTransport.sendMail(mailOptions,function(err){
                                                if(err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+ err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else{
                                                    res.status(200);
                                                    resultats = {
                                                        "success": true,
                                                        "message": "SUCCESS",
                                                        "result": account
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/disableaccountbyid (Admin only)
 */
exports.disableaccountbyid = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                         //check if authData Account exist in DB
                         if(id !== 'undefined'){
                             //find account
                            Account.findById(id,function (err,account){
                                if(account === null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(err){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : '+err,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                    else{//check role if admin
                                        var role = account.role;
                                        if(role === 'admin'){
                                            //find account
                                            Account.findById(req.body.id,function (err,account){
                                                if(err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else if(account===null){
                                                    res.status(404);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : Account not found',
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else{//set enable to false
                                                    account.enable = false;
                                                    account.save(function(err){
                                                        if(err){
                                                            res.status(400);
                                                            resultats = {
                                                                "success": false,
                                                                "message": 'Error : '+err,
                                                                "result": ''
                                                            }
                                                            res.json(resultats);
                                                        }else{
                                                            //send email
                                                            var smtpTransport = nodemailer.createTransport({
                                                                service : 'Gmail',
                                                                auth : {
                                                                    user : config.supportemail,
                                                                    pass : config.gmailPSW
                                                                }
                                                            });
                                                            var mailOptions = {
                                                                to : account.email,
                                                                from: 'Fatboar Restaurant <'+config.supportemail+'>',
                                                                subject : "Votre compte FATBOAR a été désactivé",
                                                                text : "Votre compte : "+account.email+" a bien été désactivé. \n \n Nous vous remercions pour votre intérêt et espérons vous compter très prochainement parmi les membres de notre communauté.\n A bientôt ! \n \n L'équipe FATBOAR"
                                                            }
                                                            smtpTransport.sendMail(mailOptions,function(err){
                                                                if(err){
                                                                    res.status(400);
                                                                    resultats = {
                                                                        "success": false,
                                                                        "message": 'Error : '+ err,
                                                                        "result": ''
                                                                    }
                                                                    res.json(resultats);
                                                                }
                                                                else{
                                                                    res.status(200);
                                                                    resultats = {
                                                                        "success": true,
                                                                        "message": "SUCCESS",
                                                                        "result": account
                                                                    }
                                                                    res.json(resultats);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            res.status(401);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : token dont have permissions for this function',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }
                                    }
                                }
                            });
                         }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/enableaccountbyid (Admin only)
 */
exports.enableaccountbyid = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                         //check if authData Account exist in DB
                         if(id !== 'undefined'){
                             //find account
                            Account.findById(id,function (err,account){
                                if(account === null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(err){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : '+err,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                    else{//check role if admin
                                        var role = account.role;
                                        if(role === 'admin'){
                                            //find account
                                            Account.findById(req.body.id,function (err,account){
                                                if(err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else if(account===null){
                                                    res.status(404);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : Account not found',
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else{//set enable to true
                                                    account.enable = true;
                                                    account.save(function(err){
                                                        if(err){
                                                            res.status(400);
                                                            resultats = {
                                                                "success": false,
                                                                "message": 'Error : '+err,
                                                                "result": ''
                                                            }
                                                            res.json(resultats);
                                                        }else{
                                                            //send email
                                                            var smtpTransport = nodemailer.createTransport({
                                                                service : 'Gmail',
                                                                auth : {
                                                                    user : config.supportemail,
                                                                    pass : config.gmailPSW
                                                                }
                                                            });
                                                            var mailOptions = {
                                                                to : account.email,
                                                                from: 'Fatboar Restaurant <'+config.supportemail+'>',
                                                                subject : "Votre compte FATBOAR a été activé",
                                                                text : "Votre compte : "+account.email+" a bien été activé. \n \n Nous vous souhaitons la bienvenue parmi nous à nouveau ! \n \n L'équipe FATBOAR"
                                                            }
                                                            smtpTransport.sendMail(mailOptions,function(err){
                                                                if(err){
                                                                    res.status(400);
                                                                    resultats = {
                                                                        "success": false,
                                                                        "message": 'Error : '+ err,
                                                                        "result": ''
                                                                    }
                                                                    res.json(resultats);
                                                                }
                                                                else{
                                                                    res.status(200);
                                                                    resultats = {
                                                                        "success": true,
                                                                        "message": "SUCCESS",
                                                                        "result": account
                                                                    }
                                                                    res.json(resultats);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else{
                                            res.status(401);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : token dont have permissions for this function',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }
                                    }
                                }
                            });
                         }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * POST /accounts/addaccount/
 */
exports.addaccount = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var emailreq = req.body.email;
            var passwordreq = req.body.password;
            //email accept only alphabet and numbers and those three caracters ._- and respect the form of an normal email like "example@example.example" max lenght 60
            var checkemail=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            //password max lenght 25 and accept only alphabet and numbers and those caracters .!#%&*+=?^_-@ 
            var checkpw =/^[a-zA-Z0-9.!#%&*+=?^@_-]*$/;
            //verify if email and password respect caracters 
            if (checkemail.test(emailreq) && emailreq.length<61 && checkpw.test(passwordreq) && passwordreq.length<=25){
                //creer account in DB
                //crypt password
                var pass = req.body.password;
                if(pass!==undefined){var hashpass = bcrypt.hashSync(pass,10);}
                var acceptCGU = req.body.acceptCGU;
                if(acceptCGU === undefined || acceptCGU === false){
                    res.status(400);
                    resultats = {
                        "success": false,
                        "message": 'Error : Should accept CGU',
                        "result": ''
                    }
                    res.json(resultats);
                }
                else{
                    const account = new Account({
                        email : req.body.email,
                        password : hashpass,
                        acceptCGU : acceptCGU
                    });
                    //sauvegarde des données
                    account.save((err => {
                        if(err){
                            res.status(400);
                            resultats = {
                                "success": false,
                                "message": 'Error : '+ err,
                                "result": ''
                            }
                            res.json(resultats);
                        }
                        else{
                            //send email
                            var smtpTransport = nodemailer.createTransport({
                                service : 'Gmail',
                                auth : {
                                    user : config.supportemail,
                                    pass : config.gmailPSW
                                }
                            });
                            var mailOptions = {
                                to : account.email,
                                from: 'Fatboar Restaurant <'+config.supportemail+'>',
                                subject : "Bienvenue chez FATBOAR !",
                                text : "Bienvenue chez FATBOAR ! \n \n Votre compte : "+account.email+" a bien été créé. \n \n Nos dernières offres exclusives n'attendent plus que vous sur notre site Fatboar.\n A bientôt ! \n \n L'équipe FATBOAR"
                            }
                            smtpTransport.sendMail(mailOptions,function(err){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    res.status(200);
                                    resultats = {
                                        "success": true,
                                        "message": "SUCCESS",
                                        "result": account
                                    }
                                    res.json(resultats);
                                }
                            });
                        }
                    }));
                }
            }
            else{
                res.status(400);
                resultats = {
                    "success": false,
                    "message": 'Error : Email/Password format not authorized',
                    "result": ''
                }
                res.json(resultats);
            } 
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/updateaccount
 */
exports.updateaccount = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //get account
                            Account.findById(id,function(err, account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : Account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(account.enable===true){
                                        //crypt new password
                                        var pass = req.body.password;
                                        if(pass!==undefined){
                                        var hashpass = bcrypt.hashSync(pass,10);
                                        }
                                        //update
                                        account.email = req.body.email;
                                        account.nom = req.body.nom;
                                        account.prenom = req.body.prenom;
                                        account.tel = req.body.tel;
                                        account.datenaissance = req.body.datenaissance;
                                        account.password =hashpass;

                                        account.save(function(err){
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            else{
                                                res.status(200);
                                                resultats = {
                                                    "success": true,
                                                    "message": "SUCCESS",
                                                    "result": account
                                                }
                                                res.json(resultats);
                                            }
                                        });
                                    }
                                    else{
                                        res.status(403);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : Ce compte est desactivé, impossible de le modifier',
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{//token undefined
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};
/**
 * PUT /accounts/updateaccountv2
 */
exports.updateaccountv2 = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //get account
                            Account.findById(id,function(err, account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : Account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(account.enable===true){
                                        //crypt new password
                                        var pass = req.body.password;
                                        if(pass===undefined){
                                            res.status(404);
                                            resultats = {
                                                "success": false,
                                                "message": "Error : password required",
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }else{
                                            //get password of this account
                                            if(bcrypt.compareSync(pass,account.password)){//if password ok
                                                //update
                                                account.email = req.body.email;
                                                account.nom = req.body.nom;
                                                account.prenom = req.body.prenom;
                                                account.tel = req.body.tel;
                                                account.datenaissance = req.body.datenaissance;

                                                account.save(function(err){
                                                    if(err){
                                                        res.status(400);
                                                        resultats = {
                                                            "success": false,
                                                            "message": 'Error : '+ err,
                                                            "result": ''
                                                        }
                                                        res.json(resultats);
                                                    }
                                                    else{
                                                        res.status(200);
                                                        resultats = {
                                                            "success": true,
                                                            "message": "SUCCESS",
                                                            "result": account
                                                        }
                                                        res.json(resultats);
                                                    }
                                                });
                                            }else{
                                                res.status(401);
                                                resultats = {
                                                    "success": false,
                                                    "message": "Error, check email/password",
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                        }
                                        
            
                                    }
                                    else{
                                        res.status(403);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : Ce compte est desactivé, impossible de le modifier',
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{//token undefined
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/updateaccountbyid (admin only)
 */
exports.updateaccountbyid = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //get account
                            Account.findById(id,function(err, account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : Account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(account.enable===true && account.role==="admin"){
                                        accountid = req.body.id;
                                        // //get account of req.body.id
                                        Account.findById(accountid,function(err,acc){
                                            if(acc !== undefined){//update account
                                                //crypt new password
                                                var pass = req.body.password;
                                                if(pass!==undefined){
                                                    var hashpass = bcrypt.hashSync(pass,10);
                                                }
                                                //update
                                                acc.nom = req.body.nom;
                                                acc.prenom = req.body.prenom;
                                                acc.tel = req.body.tel;
                                                acc.datenaissance = req.body.datenaissance;
                                                acc.password =hashpass;
                                                acc.save(function(err){
                                                    if(err){
                                                        res.status(400);
                                                        resultats = {
                                                            "success": false,
                                                            "message": 'Error : '+ err,
                                                            "result": ''
                                                        }
                                                        res.json(resultats);
                                                    }
                                                    else{
                                                        res.status(200);
                                                        resultats = {
                                                            "success": true,
                                                            "message": "SUCCESS",
                                                            "result": acc
                                                        }
                                                        res.json(resultats);
                                                    }
                                                });
                                            }
                                            else{
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }

                                        });
                                    }
                                    else{
                                        res.status(403);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : Ce compte est desactivé, impossible de le modifier',
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{//token undefined
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};
/**
 * PUT /accounts/updateaccountbyidv2 (admin only)
 */
exports.updateaccountbyidv2 = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //get account
                            Account.findById(id,function(err, account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+ err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : Account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    if(account.enable===true && account.role==="admin"){
                                        accountid = req.body.id;
                                        // //get account of req.body.id
                                        Account.findById(accountid,function(err,acc){
                                            if(acc !== undefined){//update account
                                                //update
                                                acc.email = req.body.email;
                                                acc.nom = req.body.nom;
                                                acc.prenom = req.body.prenom;
                                                acc.tel = req.body.tel;
                                                acc.datenaissance = req.body.datenaissance;
                                                acc.save(function(err){
                                                    if(err){
                                                        res.status(400);
                                                        resultats = {
                                                            "success": false,
                                                            "message": 'Error : '+ err,
                                                            "result": ''
                                                        }
                                                        res.json(resultats);
                                                    }
                                                    else{
                                                        res.status(200);
                                                        resultats = {
                                                            "success": true,
                                                            "message": "SUCCESS",
                                                            "result": acc
                                                        }
                                                        res.json(resultats);
                                                    }
                                                });
                                            }
                                            else{
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }

                                        });
                                    }
                                    else{
                                        res.status(403);
                                        resultats = {
                                            "success": false,
                                            "message": 'Error : Ce compte est desactivé, impossible de le modifier',
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{//token undefined
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }
        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * GET /accounts/getrolebytoken/
 */
exports.getrolebytoken = (req,res) => {
    try{
        var token = logHelper.getToken(req,res);
        //check token
        jwt.verify(token,config.secretKey, (err,authData) => {
            if(err){
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : '+ err,
                    "result": ''
                }
                res.json(resultats);
            }
            else{//token ok
                //get id from authData
                var id = 'undefined';
                if(authData.account._id){//for google/facebook accounts
                    id = authData.account._id;
                }
                else if(authData.account[0]._id){//normal account
                    id = authData.account[0]._id;
                }
                //check if authData account exist in DB
                if(id !== 'undefined'){
                    //find account
                    Account.findById(id, function(err, account){
                        if(account === null){
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }else{
                            if(err){
                                res.status(400);
                                resultats = {
                                    "success": false,
                                    "message": 'Error : '+ err,
                                    "result": ''
                                }
                                res.json(resultats);
                            }
                            else{
                                 var role = account.role;
                                 res.status(200);
                                 resultats = {
                                    "success": true,
                                    "message": "SUCCESS",
                                    "result": role
                                }
                                res.json(resultats);

                            }
                        }
                    });
                }
                else{
                    res.status(404);
                    resultats = {
                        "success": false,
                        "message": 'Error : account not found',
                        "result": ''
                    }
                    res.json(resultats);
                }
            }
        });
    }catch(e){
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ e,
            "result": ''
        }
        res.json(resultats);
    }
}

/**
 * POST /accounts/sendforgotpasswordlink
 */
exports.sendforgotpasswordlink = (req,res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        if(req.body.email===undefined){
            res.status(400);
                    resultats = {
                        "success": false,
                        "message": "Error : email required",
                        "result": ''
                    }
                    res.json(resultats);
        }
        try{//check if email exist in DB
            var email = req.body.email;
            Account.find({email : email},function(err,account){
                if (err){
                    res.status(400);
                    resultats = {
                        "success": false,
                        "message": "Error : "+err,
                        "result": ''
                    }
                    res.json(resultats);
                }else{
                    if((account[0]===undefined) ||( (account[0].google.id)!==undefined || (account[0].facebook.id)!==undefined) ){//account dont exist or account with google or facebook auth
                        res.status(404);
                        resultats = {
                            "success": false,
                            "message": "Error : this email don't exist",
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//dont have google & facebook account
                        //send email with a link
                        //generate a token
                        var token;
                        crypto.randomBytes(20,function(err,buf){
                            if(err){
                                res.status(400);
                                resultats = {
                                    "success": false,
                                    "message": "Error : "+err,
                                    "result": ''
                                }
                                res.json(resultats);
                            }else{
                                token = buf.toString('hex');
                                //set resetpasswordtoken & resetpasswordexpires in DB
                                account[0].resetpasswordtoken = token;
                                account[0].resetpasswordexpires = Date.now()+3600000; //1 hour

                                account[0].save(function(err){
                                    if(err){
                                        res.status(400);
                                        resultats = {
                                            "success": false,
                                            "message": "Error : "+err,
                                            "result": ''
                                        }
                                        res.json(resultats);
                                    }else{//send email
                                        var smtpTransport = nodemailer.createTransport({
                                            service : 'Gmail',
                                            auth : {
                                                user : config.supportemail,
                                                pass : config.gmailPSW
                                            }
                                        });
                                        var mailOptions = {
                                            to : account[0].email,
                                            from: 'Fatboar Restaurant <'+config.supportemail+'>',
                                            subject : "FATBOAR : Réinitialisation de votre mot de passe",
                                            text : "Bonjour,\n \t Il semble que vous ayez un petit trou de mémoire, vous avez demandé une réinitialisation de votre mot de passe.\n Merci de cliquer sur le lien ci-dessous et de suivre les instructions relatives au changement de mot de passe.\n (Le lien de réinitialisation est valide pour une durée de 1 heure) \n\n \t\t"+schemes+client+"/resetpassword/" +token+ "\n \n Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce mail : votre mot de passe actuel ne sera pas modifié.\n \n Cordialement,\n\n L'équipe Fatboar",
                                        }

                                        smtpTransport.sendMail(mailOptions,function(err){
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            else{
                                                res.status(200);
                                                resultats = {
                                                    "success": true,
                                                    "message": "SUCCESS",
                                                    "result": "Sended to "+account[0].email
                                                }
                                                res.json(resultats);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }

    }
    else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
}

/**
 * POST /accounts/resetpassword/:token
 */
exports.resetpassword = (req,res) => {
    try{
        const errors = validationResult(req);
        if(errors.isEmpty()){
            var token = req.params.token;
            var password = req.body.password;
            var confirmpassword = req.body.confirmpassword;
            if(password===confirmpassword){
                // check token and date expiration
                Account.findOne({resetpasswordtoken : token, resetpasswordexpires : {$gt : Date.now()}},function(err,account){
                    if(err){
                        res.status(400);
                        resultats = {
                            "success": false,
                            "message": "Error : "+err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else if(account) {//if token valid
                        // set resetpasswordtoken to null
                        account.resetpasswordtoken = null;
                        // set resetpasswordexpires to null
                        account.resetpasswordexpires = null;
                        //crypt new password
                        var hashpass = bcrypt.hashSync(password,10);
                        // set new password
                        account.password = hashpass;

                        account.save(function(err){
                            if(err){
                                res.status(400);
                                resultats = {
                                    "success": false,
                                    "message": "Error : "+err,
                                    "result": ''
                                }
                                res.json(resultats);
                            }else{
                                res.status(200);
                                resultats = {
                                    "success": true,
                                    "message": "SUCCESS",
                                    "result": account
                                }
                                res.json(resultats);
                            }
                        });


                    }
                    else{
                        res.status(403);
                        resultats = {
                            "success": false,
                            "message": "Error : token is not valid or has expired",
                            "result": ''
                        }
                        res.json(resultats);
                    }
                });
            }else{
                res.status(403);
                resultats = {
                    "success": false,
                    "message": "Error : password and confirm password are not identical",
                    "result": ''
                }
                res.json(resultats);
            }
        }
        else{
            res.status(400);
            resultats = {
                "success": false,
                "message": "Error : "+errors,
                "result": ''
            }
            res.json(resultats);
        }
    }catch(e){
        res.status(400);
        resultats = {
            "success": false,
            "message": "Error : "+e,
            "result": ''
        }
        res.json(resultats);
    }
}
/**
 * GET /accounts/getstataccounts/
 */
exports.getstataccounts = (req, res) => {
    try{
        var token = logHelper.getToken(req,res);
        if(typeof token !== 'undefined'){
            //check token
            jwt.verify(token,config.secretKey, (err,authData) => {
                if(err){
                    res.status(401);
                    resultats = {
                        "success": false,
                        "message": 'Error : '+ err,
                        "result": ''
                    }
                    res.json(resultats);
                }
                else{//token ok
                    //get id from authData
                    var id = 'undefined';
                    if(authData.account._id){//for google/facebook accounts
                        id = authData.account._id;
                    }
                    else if(authData.account[0]._id){//normal account
                        id = authData.account[0]._id;
                    }
                    //check if authdata account exist in DB
                    if(id !== 'undefined'){
                        //find account
                        Account.findById(id,function (err,account){
                            if(account === null){
                                res.status(404);
                                resultats = {
                                    "success": false,
                                    "message": 'Error : account not found',
                                    "result": ''
                                }
                                res.json(resultats);
                            }
                            else{
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{
                                    var role = account.role;
                                    if(role==="admin"){
                                        //Get SUM accounts active and SUM accounts not active from DB
                                        Account.aggregate([
                                            {$group: {_id: '$enable', total: {$sum: 1}}}
                                        ],function(err, result) {
                                            res.status(200);
                                            resultats = {
                                                "success": true,
                                                "message": "SUCCESS",
                                                "result": result
                                            }
                                            res.json(resultats);
                                        });
                                    }
                                    else{
                                        res.status(401);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : token dont have permissions for this function',
                                                "result": ''
                                            }
                                        res.json(resultats);
                                    }
                                }
                            }
                        });
                    }
                    else{
                        res.status(404);
                        resultats = {
                            "success": false,
                            "message": 'Error : account not found',
                            "result": ''
                        }
                        res.json(resultats);
                    }
                }
            });
        }
        else{
            res.status(401);
            resultats = {
                "success": false,
                "message": 'Error : token is undefined',
                "result": ''
            }
            res.json(resultats);
        }
    }catch(e){
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ e,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/setacceptCGU
 */
exports.setacceptCGU = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //find account
                            Account.findById(id,function (err,account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{//set acceptCGU to true
                                    account.acceptCGU = true;
                                    account.save(function(err){
                                        if(err){
                                            res.status(400);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : '+err,
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }else{
                                            res.status(200);
                                            resultats = {
                                                "success": true,
                                                "message": "SUCCESS",
                                                "result": account
                                            }
                                            res.json(resultats);
                                        }
                                    });
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};

/**
 * PUT /accounts/setacceptCookies
 */
exports.setacceptCookies = (req, res) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        try{
            var token = logHelper.getToken(req,res);
            if(typeof token !== 'undefined'){
                //check token
                jwt.verify(token,config.secretKey, (err,authData) => {
                    if(err){
                        res.status(401);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    else{//token ok
                        //get id from authData
                        var id = 'undefined';
                        if(authData.account._id){//for google/facebook accounts
                            id = authData.account._id;
                        }
                        else if(authData.account[0]._id){//normal account
                            id = authData.account[0]._id;
                        }
                        if(id !== 'undefined'){
                            //find account
                            Account.findById(id,function (err,account){
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else if(account===null){
                                    res.status(404);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : account not found',
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }
                                else{//set acceptCookies to true
                                    account.acceptCookies = true;
                                    account.save(function(err){
                                        if(err){
                                            res.status(400);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : '+err,
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }else{
                                            res.status(200);
                                            resultats = {
                                                "success": true,
                                                "message": "SUCCESS",
                                                "result": account
                                            }
                                            res.json(resultats);
                                        }
                                    });
                                }
                            });
                        }
                        else{//account id not found
                            res.status(404);
                            resultats = {
                                "success": false,
                                "message": 'Error : account id not found',
                                "result": ''
                            }
                            res.json(resultats);
                        }
                    }
                });
            }
            else{
                res.status(401);
                resultats = {
                    "success": false,
                    "message": 'Error : token is undefined',
                    "result": ''
                }
                res.json(resultats);
            }

        }catch(e){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ e,
                "result": ''
            }
            res.json(resultats);
        }
    }else{
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ errors,
            "result": ''
        }
        res.json(resultats);
    }
};


/**
 * DELETE /test/deletetestaccount
 */
exports.deletetestaccount = (req,res) =>{
    Account.remove({"email": testconf.emailtest},function(err,account){
        if(err){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error :'+err,
                "result": ''
            }
            res.json(resultats);
        }
        else{
            res.status(200);
            resultats = {
                "success": true,
                "message": 'SUCCESS',
                "result": account
            }
            res.json(resultats);
        }
    });
};
/**
 * POST /test/addadmintestaccount
 */
exports.addadmintestaccount = (req,res) =>{
    const account = new Account({
        email : "admintest001@test.fr",
        password : "hashpass",
        role : "admin"
    });
    //sauvegarde des données
    account.save((err => {
        if(err){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ err,
                "result": ''
            }
            res.json(resultats);
        }
        else{
            //create token
            try{
                jwt.sign({
                    account
                },
                config.secretKey,
                (err,token) => {
                    if(err){
                        res.status(400);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    res.status(200);
                    resultats = {
                        "success": true,
                        "message": "SUCCESS",
                        "result": token
                    }
                    res.json(resultats);
                });
            }catch(e){
                res.status(400);
                resultats = {
                    "success": false,
                    "message": 'Error : '+ e,
                    "result": ''
                }
                res.json(resultats);
            }
        }
    }));
};

/**
 * POST /test/addusertestaccount
 */
exports.addusertestaccount = (req,res) =>{
    const account = new Account({
        email : "usertest001@test.fr",
        password : "hashpass",
    });
    //sauvegarde des données
    account.save((err => {
        if(err){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error : '+ err,
                "result": ''
            }
            res.json(resultats);
        }
        else{
            //create token
            try{
                jwt.sign({
                    account
                },
                config.secretKey,
                (err,token) => {
                    if(err){
                        res.status(400);
                        resultats = {
                            "success": false,
                            "message": 'Error : '+ err,
                            "result": ''
                        }
                        res.json(resultats);
                    }
                    res.status(200);
                    resultats = {
                        "success": true,
                        "message": "SUCCESS",
                        "result": token
                    }
                    res.json(resultats);
                });
            }catch(e){
                res.status(400);
                resultats = {
                    "success": false,
                    "message": 'Error : '+ e,
                    "result": ''
                }
                res.json(resultats);
            }
        }
    }));
};
/**
 * DELETE /test/deleteadminandusertestaccount
 */
exports.deleteadminandusertestaccount = (req,res) =>{
    Account.remove({$or: [ { "email": "admintest001@test.fr" }, { "email": "usertest001@test.fr" } ]},function(err,account){
        if(err){
            res.status(400);
            resultats = {
                "success": false,
                "message": 'Error :'+err,
                "result": ''
            }
            res.json(resultats);
        }
        else{
            res.status(200);
            resultats = {
                "success": true,
                "message": 'SUCCESS',
                "result": "ok"
            }
            res.json(resultats);
        }
    });
};


/**********************End Accounts**************************/