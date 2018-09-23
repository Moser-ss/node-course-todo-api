const _ = require('lodash');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');
const router = require('express').Router();

//USERS ENDPOINTS
router.post('/', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.status(201).header('x-auth', token).send({
            ok: true,
            user
        });
    }).catch((error) => {
        //console.error(error);
        res.status(400).send({
            ok: false,
            message: 'Error while trying save user',
            error
        });
    });
});
router.get('/me', authenticate, (req, res) => {
    res.send({
        ok: true,
        user: req.user
    });
});
router.post('/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    if (_.isUndefined(body.email) || _.isUndefined(body.password)) {
        return res.status(400).send({
            ok: false,
            message: 'Missing email or password to login'
        });
    }
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return user.generateAuthToken()
                .then((token) => {
                    res.header('x-auth', token).send({
                        ok: true,
                        message: 'login successfully ',
                        user
                    });
                });
        })
        .catch((error) => {
            if (error === 'User not found') {
                res.status(404).send({
                    ok: false,
                    message: error
                });
            }
            else {
                if (error === 'Invalid password') {
                    res.status(401).send({
                        ok: false,
                        message: error
                    });
                }
                else {
                    res.status(400).send({
                        ok: false,
                        message: error
                    });
                }
            }
        });
});
router.delete('/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send({
            ok: true,
            message: 'User signup'
        });
    }, () => {
        res.status(400).send({
            ok: false
        });
    });
});

module.exports = router;