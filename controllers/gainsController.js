/**********************Gain**************************/
const {validationResult} = require('express-validator');
const Account = require('../models/account');
const Ticket = require('../models/ticket');
const Gain = require('../models/gain');
const logHelper = require('../helpers/logHelper');
const config = require('../config');
// --Json Web Token JWT
const jwt = require('jsonwebtoken');
//mailer
var nodemailer = require('nodemailer');
//test config
const testconf = require('../test/config');

/**
 * GET /gains/getallgains/ (admin or serveur only)
 */
exports.getallgains = (req,res) => {
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
                                        //Get list of gain from DB
                                        Gain.find(function(err, gain){
                                            if (err){
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
                                                    "result": gain
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
};

/**
 * POST /gains/getgainsbyfilter/ (admin or serveur only)
 */
exports.getgainsbyfilter = (req,res) => {
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
                                        //Get list of gain by filter from DB
                                        var email = req.body.email;
                                        var numTicket = req.body.numTicket;
                                        var libelleGain = req.body.libelleGain;
                                        Gain.find({$or:[ {'emailAccount':email}, {'numTicket':numTicket}, {'libelleGain':libelleGain} ]},function(err, gain){
                                            if (err){
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
                                                    "result": gain
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
};

/**
 * GET /gains/getmygain/
 */
exports.getmygain = (req,res) => {
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
                                        //Get list of my gain from DB
                                        Gain.find({idAccount : account._id},function(err, gain){
                                            if (err){
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
                                                    "result": gain
                                                }
                                                res.json(resultats);
                                            }
                                        });
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
};

/**
 * POST /gains/takegain/
 */
exports.takegain = (req,res) => {
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
                    }else{//token ok
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
                                }else{
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
                                        //check num ticket
                                        var numticket = undefined;
                                        if((Number.isInteger(req.body.numTicket)===true) && ((req.body.numTicket).toString().length===10)){
                                            numticket = req.body.numTicket;
                                        }
                                        if(numticket===undefined){
                                            res.status(400);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : numTicket should be an integer of 10 numbers not start with number 0',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }else{//check if numticket exist in DB (ticket is usedby)
                                            Ticket.find({numTicket : numticket, deleted : false,used:true},function(err,ticket){
                                                if(ticket === null || ticket.length===0 || ticket === ''){
                                                    res.status(404);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : ticket not found or not validated',
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else if(err){
                                                    res.status(400);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : '+ err,
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                else{//ticket is valid
                                                    //get the gain
                                                    Gain.findOne({idTicket : ticket[0]._id},function(err,gain){
                                                        if (err){
                                                            res.status(400);
                                                            resultats = {
                                                                "success": false,
                                                                "message": 'Error : '+ err,
                                                                "result": ''
                                                            }
                                                            res.json(resultats);
                                                        }
                                                        else if(gain.isTaked==true || gain.isTakedDate!==null){
                                                            res.status(403);
                                                            resultats = {
                                                                "success": false,
                                                                "message": 'Error : gain already taked',
                                                                "result": ''
                                                            }
                                                            res.json(resultats);
                                                        }
                                                        else{
                                                            //update the gain
                                                                //update : isTaked to true and set isTakeddDate
                                                            gain.isTaked = true;
                                                            gain.isTakedDate = Date.now();
                                                            gain.save(function(err){
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
                                                                        "result": gain
                                                                    }
                                                                    res.json(resultats);
                                                                }
                                                            })

                                                        }
                                                    });
                                                }
                                            });
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
};

/**
 * POST /gains/setbigwinner (admin only)
 */
exports.setbigwinner = (req,res) => {
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
                                        //set a winner
                                        //check if they have a winner
                                        Gain.find({bigwinner : true},function (err, gain){
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            else if(gain.length===0){//designate a winner
                                                Gain.find().distinct('idAccount',function (err,gain){//get distinct accounts id
                                                    if(err){
                                                        res.status(400);
                                                        resultats = {
                                                            "success": false,
                                                            "message": 'Error : '+ err,
                                                            "result": ''
                                                        }
                                                        res.json(resultats);
                                                    }else{
                                                        //select a random accountid
                                                        winner = gain[Math.floor(Math.random()*gain.length)];
                                                        Gain.updateOne({"idAccount":winner},{"bigwinner":true},function(err,gain){
                                                            if(err){
                                                                res.status(400);
                                                                resultats = {
                                                                    "success": false,
                                                                    "message": 'Error : '+ err,
                                                                    "result": ''
                                                                }
                                                                res.json(resultats);
                                                            }else{
                                                                Gain.find({"idAccount":winner},function(err,gain){
                                                                    if(err){
                                                                        res.status(400);
                                                                        resultats = {
                                                                            "success": false,
                                                                            "message": 'Error : '+ err,
                                                                            "result": ''
                                                                        }
                                                                        res.json(resultats);
                                                                    }else{
                                                                        //send email to confirme gain
                                                                        var smtpTransport = nodemailer.createTransport({
                                                                            service : 'Gmail',
                                                                            auth : {
                                                                                user : config.supportemail,
                                                                                pass : config.gmailPSW
                                                                            }
                                                                        });
                                                                        var mailOptions = {
                                                                            to : gain[0].emailAccount,
                                                                            from : config.supportemail,
                                                                            subject : "FATBOAR : Vous êtes le grand gagnant du tirage au sort : Range Rover Evoque ! ",
                                                                            text : "Bonjour Madame, Monsieur, \n \n Félicitations, nous sommes heureux de vous annoncer que vous avez gagné à notre grand jeu concours <<Tirage au sort : Range Rover Evoque>> organisé par les restaurants Fatboar. \n \n Merci de répondre à ce mail avec vos coordonnées (nom, prénom, adresse postale et numéro de téléphone) pour qu'on puisse vous appeler pour prendre un rendez-vous. \n \n  Par ailleurs, nous vous remercions de l'intérêt porté à nos produits ainsi que votre fidélité envers l'enseigne Fatboar. \n \n Nous restons à votre disposition pour tout renseignement. \n \n Sincères félicitations, \n \n L'équipe FATBOAR"
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
                                                                                    "result": gain
                                                                                }
                                                                                res.json(resultats);
                                                                            }
                                                                        });
                                                                    }
                                                                })
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            else{
                                                res.status(403);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error: the winner was already designed',
                                                    "result": ''
                                                }
                                                res.json(resultats);
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
    }
    catch(e){
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
 * GET /gains/getwinner (admin or serveur only)
 */
exports.getwinner = (req,res) => {
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
                                        //get a winner
                                        Gain.find({bigwinner : true},function (err, gain){
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            else if(gain.length===0){//no winner
                                                res.status(200);
                                                resultats = {
                                                    "success": true,
                                                    "message": 'no winner designed',
                                                    "result": gain
                                                }
                                                res.json(resultats);
                                            }
                                            else{
                                                res.status(200);
                                                resultats = {
                                                    "success": true,
                                                    "message": 'SUCCESS',
                                                    "result": gain
                                                }
                                                res.json(resultats);
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
    }
    catch(e){
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
 * GET /gains/getstatgains/
 */
exports.getstatgains = (req, res) => {
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
                                        //Get SUM gains by libellegain from DB
                                        Gain.aggregate([
                                            {$group: {_id: '$libelleGain', total: {$sum: 1}}}
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

/*
* DELETE /test/deletetestgain
*/
exports.deletetestgain = (req,res) => {
    Gain.remove({"numTicket":testconf.numtickettest},function(err,gain){
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
                "result": gain
            }
            res.json(resultats);
        }
    });
};


/**********************End Gain**************************/
