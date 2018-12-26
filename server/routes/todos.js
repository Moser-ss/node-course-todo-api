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
    }, (err) => {
        res.status(400).send({
            ok: false,
            message: err
        });
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
    }, (err) => {
        res.status(400).send({
            ok: false,
            message: err
        });
    });
});
router.get('/:id', authenticate, (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            ok: false,
            message: 'ID is not valid'
        });
    }
    Todo.findOne({
        _id: todoId,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send({
                ok: false,
                message: 'Todo not found'
            });
        }
        res.status(200).send({
            ok: true,
            message: 'Todo added',
            todo
        });
    }).catch((err) => {
        res.status(400).send({
            ok: false,
            message: 'Unable to get data'
        });
    });
});
router.delete('/:id', authenticate, async (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            ok: false,
            message: 'ID is not valid'
        });
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: todoId,
            _creator: req.user._id
        });
        if (!todo) {
            return res.status(404).send({
                ok: false,
                message: 'Todo not found'
            });
        }
        res.status(200).send({
            ok: true,
            message: 'Todo deleted',
            todo
        });
    } catch (error) {
        res.status(400).send({
            ok: false,
            message: 'Unable to delete data'
        });
    }
});
router.patch('/:id', authenticate, (req, res) => {
    const todoId = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            ok: false,
            message: 'ID is not valid'
        });
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
            return res.status(404).send({
                ok: false,
                message: 'Todo not found'
            });
        }
        res.send({
            ok: true,
            message: 'Todo updated',
            todo
        });
    }).catch((err) => {
        res.status(400).send({
            ok: false,
            message: 'Unable to update data'
        });
    });
});

module.exports = router;