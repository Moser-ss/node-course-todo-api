const env = process.env.NODE_ENV || 'development';
console.log('env set to :', env);
import * as config from './config.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasKey<O>(obj: O, key: keyof any): key is keyof O {
	return key in obj;
}

if (env === 'development' || env === 'test') {
	const envConfig = config[env];

	Object.keys(envConfig).forEach(key => {
		if (hasKey(envConfig, key)) {
			process.env[key] = envConfig[key];
		}
	});
}
