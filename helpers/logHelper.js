const jwt = require('jsonwebtoken');
const Account = require('../models/account');

//format of token
//Authorization : Bearer <access_token>

//get Token function
exports.getToken = (req, res) => {
    try{
        //get auth header value
        const bearerHeader = req.headers['authorization'];
        //check if bearer is undefined
        if(typeof bearerHeader !== 'undefined'){
            //split at the space of bearer <access_token>
            const bearer = bearerHeader.split(' ');
            //get token from array
            const bearerToken = bearer[1];
            //set the token
            req.token = bearerToken;
            return req.token
        }
        else{
            //forbidden
            return 'undefined';
        }
    }catch(e){
        return e;
    }
}
