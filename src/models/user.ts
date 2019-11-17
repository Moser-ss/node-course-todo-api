import validator from 'validator';
import { Query } from 'mongoose';
import { createSchema, Type, typedModel, ExtractDoc, ExtractProps } from 'ts-mongoose';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { Token } from '../../types/node-todo-api/token';
const JWT_SECRET = process.env.JWT_SECRET || '';

const UserSchema = createSchema({
	email: Type.string({
		trim: true,
		required: true,
		minlength: 1,
		unique: true,
		validate: async (value: string): Promise<boolean> => {
			return validator.isEmail(value);
		},
	}),
	password: Type.string({
		required: true,
		minlength: 6,
	}),
	tokens: [
		{
			access: {
				type: String,
				required: true,
			},
			token: {
				type: String,
				required: true,
			},
		},
	],
});

UserSchema.methods.toJSON = function(): {
	_id: string;
	email: string;
} {
	const userObject = this.toObject();

	return _.pick(userObject, ['_id', 'email']);
};
UserSchema.methods.generateAuthToken = function(): Promise<string> {
	const access = 'auth';
	const token = jwt
		.sign(
			{
				_id: this._id,
				access,
			},
			JWT_SECRET,
		)
		.toString();
	this.tokens = this.tokens.concat([
		{
			access,
			token,
		},
	]);

	return this.save().then(() => {
		return token;
	});
};

UserSchema.methods.removeToken = function(token: string): Query<UserDoc> {
	return this.updateOne({
		$pull: {
			tokens: {
				token: token,
			},
		},
	});
};

UserSchema.pre('save', function(next) {
	const user = this as UserDoc;

	if (user.isModified('password')) {
		user.password = bcrypt.hashSync(user.password, 12);
		next();
	} else {
		next();
	}
});
export const User = typedModel('User', UserSchema, undefined, undefined, {
	findByToken: function(token: string) {
		try {
			jwt.verify(token, JWT_SECRET);
		} catch (e) {
			return Promise.reject(`Authentication failed : ${e.message}`);
		}
		const decoded = jwt.decode(token);
		if (!decoded || typeof decoded === 'string') {
			throw new Error('Fail to decode user');
		}
		const decodedToken = decoded as Token;
		return this.findOne({
			_id: decodedToken._id,
			'tokens.token': token,
			'tokens.access': 'auth',
		});
	},
	findByCredentials: function(email: string, password: string) {
		return this.findOne({
			email,
		}).then(user => {
			if (!user) {
				return Promise.reject('User not found');
			}

			const hashedPassword = user.password;

			if (bcrypt.compareSync(password, hashedPassword)) {
				return Promise.resolve(user);
			} else {
				return Promise.reject('Invalid password');
			}
		});
	},
});
export type UserDoc = ExtractDoc<typeof UserSchema>;
export type UserProps = ExtractProps<typeof UserSchema>;
