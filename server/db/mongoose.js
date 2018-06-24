const mongoose = require('mongoose');

const mongoURL = process.env.MONGODB_URI
mongoose.Promise = global.Promise

mongoose.connect(mongoURL, {
    useMongoClient: true
}).then(() => {
    console.log(`Connection opened to DB ${mongoURL}`);
})


module.exports = {mongoose}