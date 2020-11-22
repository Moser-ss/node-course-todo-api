import snyk from '@snyk/nodejs-runtime-agent';
snyk({ projectId: '991fca1d-4af6-406f-9663-c919eeed8a31' });
require('./config/config.js');
import express from 'express';
import bodyParser from 'body-parser';
require('./db/mongoose');

const app = express();
import todos from './routes/todos';
import users = require('./routes/users');
const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/todos', todos);
app.use('/users', users);

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

module.exports = {
	app,
};
