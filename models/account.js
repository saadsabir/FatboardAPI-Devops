//import mongoose
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    email : {type : String, unique : true, lowercase : true, required: true},
    password : {type : String},
    prenom : {type : String, default : null},
    nom : {type : String, default : null},
    tel : {type : String, default : null},
    dateCreation : {type : Date, default : Date.now()},
    datenaissance : {type : Date, default : null},
    resetpasswordtoken :{type: String, default : null},
    resetpasswordexpires : {type : Date, default : null},
    facebook : {
        id : String,
        email : String,
        name : String
    },
    google : {
        id : String,
        email : {type : String, lowercase : true},
        name : String
    },
    role : {type : String, default : "user"},
    enable : {type : Boolean, default : true},
    acceptCGU : {type : Boolean, default : false},
    acceptCookies : {type : Boolean, default : false}
});



/**Exportation du model account
 * https://mongoosejs.com/docs/models
 * @type {Model}
 */

module.exports = mongoose.model('Account',AccountSchema);