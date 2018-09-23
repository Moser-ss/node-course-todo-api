const _ = require('lodash');
const { ObjectId } = require('mongodb');
const { Todo } = require('../models/todo');
const router = require('express').Router();

//TODOS ENDPOINTS
router.post('/', (req, res) => {
    let todo = new Todo({
        text: req.body.text
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
router.get('/', (req, res) => {
    Todo.find().then((todos) => {
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
router.get('/:id', (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            ok: false,
            message: 'ID is not valid'
        });
    }
    Todo.findById(todoId).then((todo) => {
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
router.delete('/:id', (req, res) => {
    const todoId = req.params.id;
    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            ok: false,
            message: 'ID is not valid'
        });
    }
    Todo.findByIdAndRemove(todoId).then((todo) => {
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
    }).catch((err) => {
        res.status(400).send({
            ok: false,
            message: 'Unable to delete data'
        });
    });
});
router.patch('/:id', (req, res) => {
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
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(todoId, {
        $set: body
    }, {
            new: true
        })
        .then((todo) => {
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