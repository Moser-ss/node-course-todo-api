const _ = require('lodash');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/authenticate');
const {sendError } = require('../util')
const router = require('express').Router();

//USERS ENDPOINTS
router.post('/', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).header('x-auth', token).send({
            ok: true,
            user
        });    
    } catch (error) {
        sendError(res, 400, 'Error while trying save user', error)
    }
});
router.get('/me', authenticate, (req, res) => {
    res.send({
        ok: true,
        user: req.user
    });
});
router.post('/login', async (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    if (_.isUndefined(body.email) || _.isUndefined(body.password)) {
        return sendError(res, 400, 'Missing email or password to login' )
    }
    try {
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.header('x-auth', token).send({
            ok: true,
            message: 'login successfully ',
            user
        });
    } catch (error) {
        if (error === 'User not found') {
            sendError(res, 404, error)
        }
        else {
            if (error === 'Invalid password') {
                sendError(res, 401, error)
            }
            else {
                sendError(res, 400, error)
            }
        }
    }
});

router.delete('/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token)
        res.status(200).send({
            ok: true,
            message: 'User signup'
        });
    } catch (error) {
        sendError(res, 400, 'Fail to remove User', error)
    }
});

module.exports = router;