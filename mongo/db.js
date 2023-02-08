/**
 * config MongoDB connection
 * https://mongoosejs.com/docs/connections.html
 */

const mongoose = require('mongoose');

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB	
} = process.env;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500, 
    connectTimeoutMS: 10000,
};

const mongoUri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(mongoUri, options).then( function() {
  console.log(`DB: ${MONGO_DB} is connected !`);
})
  .catch( function(err) {
  console.log(err);
});
