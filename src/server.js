require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const {
    mongoose
} = require('./db/mongoose');

const app = express();
const todos = require('./routes/todos')
const users = require('./routes/users')
const port = process.env.PORT

app.use(bodyParser.json());
app.use('/todos', todos)
app.use('/users', users)

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

module.exports = {
    app
}