const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
const Account = require('../models/account');
// --Json Web Token JWT
const jwt = require('jsonwebtoken');
//mailer
var nodemailer = require('nodemailer');




/*******************PASSPORT CONFIG**********************/
passport.serializeUser((token,done)=>{
    done(null,token);
});

passport.deserializeUser((token,done)=>{
    done(null,token);
});
/*********************************************************/

/*******************GOOGLE AUTH*************************/
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: config.oauth.google.clientID,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.redirect
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        console.log('passport callback function fired:');
        if(profile!==null){
            var email = profile.emails[0].value;
            var nom = profile.name.familyName;
            var prenom = profile.name.givenName;
            var googleId = profile.id;
            Account.findOne({'email' : email},function (err, account){
                if(err){
                    console.log(err);
                    done(err);
                }
                if(account){//exist
                    if(err){
                        console.log(err);
                        done(err);
                    }  
                    else {//get account
                        console.log('currentAccount');
                        //check if enable = true
                        if(account.enable===true){
                            //send token
                            try{
                                jwt.sign({
                                    account
                                },config.secretKey,
                                (err,token)=>{
                                    if(err){
                                        done(err)
                                    }
                                    else{
                                        done(null,token);
                                    }
                                });
                            }
                            catch(e){
                                done(err);
                            }
                        }else{
                            done("This account is disabled, please contact support for more information",null);
                        }
                    }
                }
                else{//new account
                    if(err)
                    {
                        console.log(err);    
                        done(err);
                    }
                       
                    const account = new Account({
                        email : email,
                        nom : nom,
                        prenom : prenom,
                        acceptCGU : true,
                        google : {
                            id : googleId,
                            email : email,
                            name : nom+' '+prenom
                        }
                    });
                    //save data
                    account.save((err => {
                        if(err){
                            console.log(err);
                            done(err);
                        } 
                        else{
                            console.log('newaccount');
                            //send email
                            var smtpTransport = nodemailer.createTransport({
                                service : 'Gmail',
                                auth : {
                                    user : config.supportemail,
                                    pass : config.gmailPSW
                                }
                            });
                            var mailOptions = {
                                to : email,
                                from : config.supportemail,
                                subject : "Bienvenue chez FATBOAR !",
                                text : "Bienvenue chez FATBOAR ! \n \n Votre compte : "+email+" a bien été créé. \n \n Nos dernières offres exclusives n'attendent plus que vous sur notre site Fatboar.\n A bientôt ! \n \n L'équipe FATBOAR"
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
                                   //send token
                                    try{
                                        jwt.sign({
                                            account
                                        },config.secretKey,
                                        (err,token)=>{
                                            if(err){
                                                done(err)
                                            }
                                            else{
                                                done(null,token);
                                            }
                                        });
                                    }
                                    catch(e){
                                        done(err);
                                    }
                                }
                            });
                        }
                    }));
                }
            });
        }
        
    })
);
/*********************************************************/

/*******************FACEBOOK AUTH*************************/
passport.use(
    new FacebookStrategy({
        // options for facebook strategy
        clientID: config.oauth.facebook.clientID,
        clientSecret: config.oauth.facebook.clientSecret,
        callbackURL: config.oauth.facebook.callbackURL,
        profileFields : ['id', 'displayName', 'emails']
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        console.log('passport callback function fired:');
        console.log(profile);
        if(profile!==null){
            var id = profile.id;
            var email = profile.emails[0].value;
            if(email===undefined){email = process.env.FACEBOOK_TEST_EMAIL;}
            console.log(id);
            console.log(email);
            var strfullname = profile.displayName;
            var fullname = strfullname.split(/(\s+)/);
            var nom = fullname[2];
            var prenom = fullname[0];
            console.log("nom "+ nom);
            console.log("prenom "+ prenom);
            Account.findOne({'email' : email},function (err, account){
                if(err){
                    console.log(err);
                    done(err);
                }
                if(account){//exist
                    if(err){
                        console.log(err);
                        done(err);
                    }  
                    else {//get account
                        console.log('currentAccount');
                        //check if enable = true
                        if(account.enable===true){
                            //send token
                            try{
                                jwt.sign({
                                    account
                                },config.secretKey,
                                (err,token)=>{
                                    if(err){
                                        done(err)
                                    }
                                    else{
                                        done(null,token);
                                    }
                                });
                            }
                            catch(e){
                                done(err);
                            }
                        }else{
                            done("This account is disabled, please contact support for more information",null);
                        }
                    }
                }
                else{//new account
                    if(err)
                    {
                        console.log(err);    
                        done(err);
                    }
                       
                    const account = new Account({
                        email : email,
                        nom : nom,
                        acceptCGU : true,
                        prenom : prenom,
                        facebook : {
                            id : id,
                            email : email,
                            name : strfullname
                        }
                    });
                    //save data
                    account.save((err => {
                        if(err){
                            console.log(err);
                            done(err);
                        } 
                        else{
                            console.log('newaccount');
                            //send email
                            var smtpTransport = nodemailer.createTransport({
                                service : 'Gmail',
                                auth : {
                                    user : config.supportemail,
                                    pass : config.gmailPSW
                                }
                            });
                            var mailOptions = {
                                to : email,
                                from : config.supportemail,
                                subject : "Bienvenue chez FATBOAR !",
                                text : "Bienvenue chez FATBOAR ! \n \n Votre compte : "+email+" a bien été créé. \n \n Nos dernières offres exclusives n'attendent plus que vous sur notre site Fatboar.\n A bientôt ! \n \n L'équipe FATBOAR"
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
                                   //send token
                                    try{
                                        jwt.sign({
                                            account
                                        },config.secretKey,
                                        (err,token)=>{
                                            if(err){
                                                done(err)
                                            }
                                            else{
                                                done(null,token);
                                            }
                                        });
                                    }
                                    catch(e){
                                        done(err);
                                    }
                                }
                            });
                        }
                    }));
                }
            });
        }
        
    })
);
/*********************************************************/