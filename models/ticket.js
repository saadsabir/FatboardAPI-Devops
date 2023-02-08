//import mongoose
const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const TicketSchema = new Schema({
    numTicket : {type : Number,unique : true,required : true},
    libelleGain : String,
    dateTicket : {type : Date, default : Date.now()},
    deleted : {type : Boolean, default : false},
    used : {type : Boolean, default : false},
    usedby : {type : String, default : null}
});

/**Exportation du model tickets
 * https://mongoosejs.com/docs/models
 * @type {Model}
 */

module.exports = mongoose.model('Ticket',TicketSchema);