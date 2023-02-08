module.exports = {
    jwtsecret : process.env.JWTSECRET,
    session : {
        cookieKey : process.env.COOKIEKEY
    },
    oauth : {
        facebook : {
            clientID : process.env.FACEBOOK_CLIENTID,
            clientSecret : process.env.FACEBOOK_CLIENTSECRET,
            callbackURL : process.env.FACEBOOK_CALLBACKURL,
        },
        google : {
            clientID : process.env.GOOGLE_CLIENTID,
            clientSecret : process.env.GOOGLE_CLIENTSECRET,
            redirect : process.env.GOOGLE_REDIRECT
        }
    },
    supportemail : process.env.SUPPORTEMAIL,
    gmailPSW : process.env.GMAILPSW,
    secretKey : process.env.SECRETKEY,
    schemes : process.env.SCHEMES,
    client : process.env.CLIENT,
    clientURL : process.env.CLIENTURL,
    host: process.env.HOST,
    port: process.env.PORT
};
