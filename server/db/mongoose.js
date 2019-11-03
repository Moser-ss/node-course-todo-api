const mongoose = require('mongoose');

const mongoURL = process.env.MONGODB_URI
mongoose.Promise = global.Promise

mongoose.connect(mongoURL,{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true 
}).then(() => {
    console.log(`Connection opened to DB ${mongoURL}`);
})
.catch((error) => {
    console.error(`Fail to connect to DB ${mongoURL} : Error ${error}`)
})


module.exports = {mongoose}