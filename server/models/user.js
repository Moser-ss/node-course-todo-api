const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 1,
        unique: true,
        validate: (value) => {
            return new Promise((resolve, reject) => {

                resolve(validator.isEmail(value))
            })
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject()

    return _.pick(userObject, ['_id', 'email'])
}
UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth'
    const token = jwt.sign({
        _id: user._id,
        access
    }, JWT_SECRET).toString()
    user.tokens = user.tokens.concat([{
        access,
        token
    }]);

    return user.save()
        .then(() => {
            return token
        })
}

UserSchema.methods.removeToken = function (token) {
    const user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    })
}
UserSchema.statics.findByToken = function (token) {
    let User = this;

    try {
        jwt.verify(token, JWT_SECRET)
    } catch (e) {
        return Promise.reject(`Authentication failed : ${e.message}`)
    }
    let decoded = jwt.decode(token)
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this
    return User.findOne({
                email
            })
            .then((user) => {
                if (!user) {
                    return Promise.reject('User not found')
                }

                let hashedPassword = user.password;

                if (bcrypt.compareSync(password, hashedPassword)) {
                    return Promise.resolve(user)
                } else {
                    return Promise.reject('Invalid password')
                }
            })
    
}

UserSchema.pre('save', function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = bcrypt.hashSync(user.password, 12)
        next()
    } else {
        next()
    }
})
const User = mongoose.model('User', UserSchema);

module.exports = {
    User
}