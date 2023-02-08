//import mongoose
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const GainSchema = new Schema({
    idAccount : {type : String,required : true},
    idTicket : {type : String,unique : true,required : true},
    emailAccount : String,
    numTicket : Number,
    libelleGain : String,
    dateGain : {type : Date, default : Date.now()},
    isTakedDate : {type : Date, default: null},
    isTaked : {type : Boolean, default : false},
    bigwinner : {type: Boolean, default: false}
});

/**Exportation du model gain
 * https://mongoosejs.com/docs/models
 * @type {Model}
 */

module.exports = mongoose.model('Gain',GainSchema);