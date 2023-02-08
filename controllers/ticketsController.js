/**********************Ticket**************************/
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
 * POST /tickets/addoneticket/ (admin only)
 */
exports.addoneticket = (req, res) => {
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
                                            var numTicket = undefined;
                                            // if ticket is integer of 10 numbers
                                            if((Number.isInteger(req.body.numTicket)===true) && ((req.body.numTicket).toString().length===10)){
                                                numTicket = req.body.numTicket;
                                            }
                                            if(numTicket!==undefined){
                                                //creer ticket in DB
                                                const ticket = new Ticket({
                                                    numTicket : numTicket,
                                                    libelleGain : req.body.libelleGain
                                                });
                                                //sauvegarde des données
                                                ticket.save((err => {
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
                                                            "result": ticket
                                                        }
                                                        res.json(resultats);
                                                    }
                                                }));
                                            }
                                            else{
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : numTicket should be an integer of 10 numbers not start with number 0',
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            
                                        }
                                        else{//account role not authorized
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
 * GET /tickets/getalltickets/ (admin or serveur only)
 */
exports.getalltickets = (req,res) => {
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
                                    if(role==="admin" || role === "serveur"){
                                        fromid = req.params.idbegin;
                                        if(fromid===undefined){
                                            //Get first 500 tickets from DB
                                            Ticket.find().limit(500).exec(function(err, tickets){
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
                                                        "result": tickets
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }
                                        else{
                                            var mongoose = require('mongoose');
                                            iod = mongoose.Types.ObjectId(fromid);
                                            //Get first 500 tickets after id in params from DB 
                                            Ticket.find({_id : {$gt:iod}}).limit(500).exec(function(err, tickets){
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
                                                        "result": tickets
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }
                                        
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
 * POST /tickets/getticketssbyfilter/ (admin or serveur only)
 */
exports.getticketssbyfilter = (req,res) => {
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
                                    if(role==="admin" || role === "serveur"){
                                        fromid = req.params.idbegin;
                                        if(fromid===undefined){
                                            //Get first 500 tickets from DB
                                            var email = req.body.email;
                                            var numTicket = req.body.numTicket;
                                            var used = req.body.used;
                                            var libelleGain = req.body.libelleGain;
                                            Ticket.find({$or:[ {'usedby':email}, {'numTicket':numTicket}, {'used':used}, {'libelleGain':libelleGain} ]}).limit(500).exec(function(err, tickets){
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
                                                        "result": tickets
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }
                                        else{
                                            var mongoose = require('mongoose');
                                            iod = mongoose.Types.ObjectId(fromid);
                                            //Get first 500 tickets after id in params from DB 
                                            Ticket.find({_id : {$gt:iod}}).limit(500).exec(function(err, tickets){
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
                                                        "result": tickets
                                                    }
                                                    res.json(resultats);
                                                }
                                            });
                                        }
                                        
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
 * GET /tickets/getmytickets/
 */
exports.getmytickets = (req,res) => {
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
                                    //Get list of my tickets from DB
                                    Ticket.find({usedby : account.email},function(err, tickets){
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
                                                "result": tickets
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
 * POST /tickets/validateticket/
 */
exports.validateticket = (req,res) => {
    try{
        var token = logHelper.getToken(req,res);
        //check token
        jwt.verify(token,config.secretKey, (err,authData) => {
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
                //token ok
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
                        }
                        else{
                            if(err){
                                res.status(400);
                                resultats = {
                                    "success": false,
                                    "message": 'Error : '+ err,
                                    "result": ''
                                }
                                res.json(resultats);
                            }
                            else{//check numticket
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
                                }
                                else{//check if numticket exist in DB
                                    Ticket.find({numTicket : numticket, deleted : false},function(err,ticket){
                                        if(ticket === null || ticket.length===0 || ticket === ''){
                                            res.status(404);
                                            resultats = {
                                                "success": false,
                                                "message": 'Error : ticket not found',
                                                "result": ''
                                            }
                                            res.json(resultats);
                                        }
                                        else{
                                            if(err){
                                                res.status(400);
                                                resultats = {
                                                    "success": false,
                                                    "message": 'Error : '+ err,
                                                    "result": ''
                                                }
                                                res.json(resultats);
                                            }
                                            else{//ticket is valid
                                                //add in gain
                                                if(account.enable===true && ticket[0].usedby===null && ticket[0].used===false)//active account and ticket not used by another account
                                                {
                                                    //creer ticket in DB
                                                    const gain = new Gain({
                                                        idAccount : account._id.toString(),
                                                        idTicket : ticket[0]._id.toString(),
                                                        emailAccount : account.email,
                                                        numTicket : ticket[0].numTicket,
                                                        libelleGain : ticket[0].libelleGain
                                                    });
                                                    gain.save(function(err){
                                                        if(err){
                                                            res.status(400);
                                                            resultats = {
                                                                "success": false,
                                                                "message": 'Error : '+err,
                                                                "result": ''
                                                                }
                                                                res.json(resultats);
                                                        }else{
                                                            //update ticket 
                                                            Ticket.updateOne({numTicket : numticket},{used : true, usedby : account.email},function(err){
                                                                if(err){
                                                                    res.status(400);
                                                                    resultats = {
                                                                        "success": false,
                                                                        "message": 'Error : '+err,
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
                                                                        to : gain.emailAccount,
                                                                        from : config.supportemail,
                                                                        subject : "FATBOAR : Vous avez gagné ! ",
                                                                        text : "Félicitations ! \n \n Votre compte : "+gain.emailAccount+" a bien gagné : "+gain.libelleGain+" grace à votre ticket de caisse N°: "+gain.numTicket+". \n \n Présentez-vous à notre équipe Fatboar avec ce mail ou avec l'application Fatboar pour récupérer votre gain. \n \n Nous vous remercions pour votre visite et espérons vous revoir très prochainement pour plus de cadeau. \n \n P.S : Vous avez participé automatiquement au tirage au sort pour gagner une voiture Range Rover Evoque. \n \n Bonne chance et à bientôt ! \n \n L'équipe FATBOAR"
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
                                                            });
                                                        }
                                                    });
                                                }
                                                else if (ticket[0].usedby!==null || ticket[0].used===true){ // used ticket
                                                    res.status(403);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : ticket already used',
                                                        "result": ''
                                                    }
                                                    res.json(resultats);
                                                }
                                                
                                                else{
                                                    res.status(403);
                                                    resultats = {
                                                        "success": false,
                                                        "message": 'Error : Deleted account',
                                                        "result": ''
                                                    }
                                                    res.json(resultats); 
                                                }
                                            }
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
    catch(e){
        res.status(400);
        resultats = {
            "success": false,
            "message": 'Error : '+ e,
            "result": ''
        }
        res.json(resultats);
    }
}

/*
* POST /tickets/generateautotickets (admin only)
*/
exports.generateautotickets = (req,res) =>{
    start = new Date();
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
                            }else{
                                if(err){
                                    res.status(400);
                                    resultats = {
                                        "success": false,
                                        "message": 'Error : '+err,
                                        "result": ''
                                    }
                                    res.json(resultats);
                                }else{
                                    var role = account.role;
                                    if(role==="admin"){
                                        Ticket.deleteMany({},function(err){
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
                                                ticketsList = [];
                                                for (i=(1000000); i<2500000; i++){
                                                    // As numTicket will be randomized, we can just use "i" to create gain %
                                                    if(i<=1900000){ libelleGain = 'une entrée ou un dessert au choix'; }
                                                    else if((i>1900000)&&(i<=2200000)){ libelleGain = 'un burger au choix'; }
                                                    else if((i>2200000)&&(i<=2350000)){ libelleGain = 'un menu du jour'; }
                                                    else if((i>2350000)&&(i<=2440000)){ libelleGain = 'un menu au choix'; }
                                                    else if((i>2440000)&&(i<=2500000)){ libelleGain = '70% de réduction'; }
                                                    // We're using 1M as start nb to always 7 numbers + 3 to always get 10 numbers as final nb
                                                    randnb1 = Math.floor(Math.random() * 9)+1;
                                                    randnb2 = Math.floor(Math.random() * 9);
                                                    randnb3 = Math.floor(Math.random() * 9);
                                                    tab_i = `${i}`.toString();
                                                    i1 = tab_i[0]+tab_i[1]+tab_i[2];
                                                    i2 = tab_i[3]+tab_i[4]+tab_i[5]+tab_i[6];
                                                    numTicket = `${randnb1}${i1}${randnb2}${i2}${randnb3}`;
                                                    ticketsList.push({ 
                                                        'numTicket': parseInt(numTicket), 
                                                        'libelleGain': libelleGain 
                                                    });
                                                }
                                                //slice the array of 1 500 000 to 3 arrays of 500 000
                                                ticketlistpart1 = ticketsList.slice(0,500000);
                                                ticketlistpart2 = ticketsList.slice(500000,1000000);
                                                ticketlistpart3 = ticketsList.slice(1000000,1500000);
                                                compte = 0;
                                                listErr = [];
                                                Ticket.insertMany(ticketlistpart1,function(err,ticket){//insert first 500 000 tickets in BD
                                                    if(err){
                                                        res.status(400);
                                                        resultats = {
                                                            "success": false,
                                                            "message": 'Error 1 : '+ err,
                                                            "result": ''
                                                        }
                                                        res.json(resultats);
                                                    }
                                                    else{
                                                        compte = compte + ticket.length;
                                                        Ticket.insertMany(ticketlistpart2,function(err,ticket){//insert second 500 000 tickets in DB
                                                            if(err){
                                                                res.status(400);
                                                                resultats = {
                                                                    "success": false,
                                                                    "message": 'Error 2 : '+ err,
                                                                    "result": ''
                                                                }
                                                                res.json(resultats);
                                                            }
                                                            else{
                                                                compte =  compte + ticket.length;
                                                                Ticket.insertMany(ticketlistpart3, function(err,ticket){//insert last 500 000 tickets in DB
                                                                    if(err){
                                                                        res.status(400);
                                                                        resultats = {
                                                                            "success": false,
                                                                            "message": 'Error 3 : '+ err,
                                                                            "result": ''
                                                                        }
                                                                        res.json(resultats);
                                                                    }
                                                                    else{//send total of tickets and request time
                                                                        compte = compte + ticket.length;
                                                                        end = new Date();
                                                                        ms = end - start;
                                                                        console.log(compte)
                                                                        min = Math.floor((ms/1000/60) << 0),
                                                                        sec = Math.floor((ms/1000) % 60);
                                                                        console.log(min + 'm' + sec + 's');
                                                                        res.status(200);
                                                                        resultats = {
                                                                            "success": true,
                                                                            "message": 'SUCCESS',
                                                                            "result": compte + 'in '+min + 'm' + sec + 's'
                                                                        }
                                                                        res.json(resultats);
                                                                    }
                                                                });
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
                    }else{
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
 * GET /tickets/getstattickets/
 */
exports.getstattickets = (req, res) => {
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
                                        //Get SUM tickets used and SUM tickets not used from DB
                                        Ticket.aggregate([
                                            {$group: {_id: '$used', total: {$sum: 1}}}
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
* PUT /test/updatetestticket
*/
exports.updatetestticket = (req,res) =>{
    Ticket.updateOne({"numTicket":testconf.numtickettest},{"used":false,"usedby":null},function(err,ticket){
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
                "result": ticket
            }
            res.json(resultats);
        }
    });
};
/**
 * POST /test/addtestticket
 */
exports.addtestticket = (req,res) =>{
    const ticket = new Ticket({
        numTicket : 1111111111,
        libelleGain : "test"
    });
    //sauvegarde des données
    ticket.save((err => {
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
                "result": ticket
            }
            res.json(resultats);
            
        }
    }));
};
/**
 * DELETE /test/deletetestticket
 */
exports.deletetestticket = (req,res) =>{
    Ticket.remove({ "numTicket":  1111111111},function(err,ticket){
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

/**********************End Ticket**************************/
