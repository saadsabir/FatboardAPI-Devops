const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = Schema({
    prenom : String,
    nom : String,
    email : String,
    tel : String,
    dateCreation : {type:Date, default: Date.now()}
});
/**Exportation du model account
 * https://mongoosejs.com/docs/models
 * @type {Model}
 */

module.exports = mongoose.model('Account',AccountSchema);