import { User, UserDoc } from '../models/user';

const authenticate = function(req, res, next) {
	const token: string = req.header('x-auth');
	User.findByToken(token)
		.then(user: UserDoc | null  => {
			if (!user) {
				return res.status(404).send({
					ok: false,
					message: 'User not found',
				});
			}
			req.user = user;
			req.token = token;
			next();
		})
		.catch(error => {
			res.status(401).send({
				ok: false,
				message: error,
			});
		});
};

module.exports = {
	authenticate,
};
