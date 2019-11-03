const _ = require('lodash');
const {
    ObjectId
} = require('mongodb');
const {
    Todo
} = require('../models/todo');
const {
    authenticate
} = require('../middleware/authenticate');
const { sendError }= require('../util');
const router = require('express').Router();

//TODOS ENDPOINTS
router.post('/', authenticate, (req, res) => {
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save().then((doc) => {
        res.status(201).send({
            ok: true,
            todo: doc
        });
    }, (error) => {
        sendError(res, 400, 'Fail to save todo', error)
    });
});
router.get('/', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({
            ok: true,
            todos
        });
    }, (error) => {
        sendError(res, 400, 'Fail to get todo', error)
    });
});
router.get('/:id', authenticate, (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return sendError(res, 400, 'ID is not valid')
    }
    Todo.findOne({
        _id: todoId,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return sendError(res, 404, 'Todo not found');
        }
        res.status(200).send({
            ok: true,
            message: 'Todo added',
            todo
        });
    }).catch((error) => {
        sendError(res, 400, 'Unable to get data', error )
    });
});
router.delete('/:id', authenticate, async (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return sendError(res, 400,'ID is not valid');
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: todoId,
            _creator: req.user._id
        });
        if (!todo) {
            return sendError(res, 404, 'Todo not found');
        }
        res.status(200).send({
            ok: true,
            message: 'Todo deleted',
            todo
        });
    } catch (error) {
        sendError(res, 400, 'Unable to delete data', error)
    }
});
router.patch('/:id', authenticate, (req, res) => {
    const todoId = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectId.isValid(todoId)) {
        return sendError(res,400,'ID is not valid' );
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({
        _id: todoId,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return sendError(res, 404, 'Todo not found');
        }
        res.send({
            ok: true,
            message: 'Todo updated',
            todo
        });
    }).catch((error) => {
        sendError(res, 400, 'Unable to update data', error);
    });
});

module.exports = router;