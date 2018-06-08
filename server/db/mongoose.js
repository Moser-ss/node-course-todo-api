const mongoose = require('mongoose');

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/TodoApp', {
    useMongoClient: true
}).then(() => {
    console.log("Connection to DB open");
})


module.exports = {mongoose}