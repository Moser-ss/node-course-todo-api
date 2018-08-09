require('./config/config.js');
const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {
    ObjectId
} = require('mongodb');

const {
    mongoose
} = require('./db/mongoose');
const {
    User
} = require('./models/user');
const {
    Todo
} = require('./models/todo');

const {authenticate} = require('./middleware/authenticate.js');

const app = express()
const port = process.env.PORT

app.use(bodyParser.json());

//TODOS ENDPOINTS
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.status(201).send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos
        });
    }, (err) => {
        res.status(400).send(err)
    })
})

app.get('/todos/:id', (req, res) => {
    const todoId = req.params.id;

    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            error: 'ID is not valid'
        })
    }

    Todo.findById(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send({
                error: 'Todo not found'
            })
        }
        res.status(200).send({
            message: 'Todo added',
            todo
        })
    }).catch((err) => {
        res.status(400).send({
            erro: 'Unable to get data'
        })
    });

});

app.delete('/todos/:id', (req, res) => {
    const todoId = req.params.id

    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            error: 'ID is not valid'
        })
    }

    Todo.findByIdAndRemove(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send({
                error: 'Todo not found'
            })
        }
        res.status(200).send({
            message: 'Todo deleted',
            todo
        });
    }).catch((err) => {
        res.status(400).send({
            error: 'Unable to delete data'
        })
    });

});

app.patch('/todos/:id', (req, res) => {
    const todoId = req.params.id
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send({
            error: 'ID is not valid'
        })
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
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
                    error: 'Todo not found'
                })
            }

            res.send({
                message: 'Todo updated',
                todo
            });

        }).catch((err) => {
            res.status(400).send({
                error: 'Unable to update data'
            })
        });
})

//USERS ENDPOINTS

app.post('/users',(req,res) => {
    let body = _.pick(req.body,['email', 'password']);
    let user = new User(body)

    user.save().then(() => {
        return user.generateAuthToken()
    }).then((token) => {
        res.header('x-auth', token).send(user)
    }).catch((error) => {
        console.error(error);
        
        res.status(400).send({
            message: 'Error while trying save user',
            error
        })
    });
})

app.get('/users/me', authenticate, (req, res) => {
    
    res.send(req.user)
})
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

module.exports = {
    app
}