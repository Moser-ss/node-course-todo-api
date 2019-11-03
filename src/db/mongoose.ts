import * as mongoose from 'mongoose';

const mongoURL = process.env.MONGODB_URI || '';

mongoose
	.connect(mongoURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log(`Connection opened to DB ${mongoURL}`);
	})
	.catch(error => {
		console.error(`Fail to connect to DB ${mongoURL} : Error ${error}`);
	});

export default { mongoose };
