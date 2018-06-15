const mongoose = require('mongoose');

const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp'
mongoose.Promise = global.Promise

mongoose.connect(mongoURL, {
    useMongoClient: true
}).then(() => {
    console.log(`Connection opened to DB ${mongoURL}`);
})


module.exports = {mongoose}