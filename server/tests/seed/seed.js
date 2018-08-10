const jwt = require('jsonwebtoken');
const {
    ObjectId
} = require('mongodb');

const {
    Todo
} = require('../../models/todo');

const {
    User
} = require('../../models/user');
const userOneID = new ObjectId()
const userTwoID = new ObjectId()
const access = 'auth'
const userOneToken = jwt.sign({
    _id: userOneID,
    access
}, 'MacOSX').toString()

const users = [{
    _id: userOneID,
    email: 'test1@example.com',
    password: 'PassUser1',
    tokens: [{
        access,
        token: userOneToken
        }]
}, {
    _id: userTwoID,
    email: 'test2@example.com',
    password: 'PassUser2'
}]
const todos = [{
    _id: new ObjectId(),
    text: 'First test todo'
}, {
    _id: new ObjectId(),
    text: 'Second test todo'
}, {
    _id: new ObjectId(),
    text: 'Third test todo'
}, {
    _id: new ObjectId(),
    text: 'Forth test todo',
    completed: true,
    completedAt: 2018
}]


const populateTodos = (done) => {
    Todo.remove({}).then(() => {
            return Todo.insertMany(todos)
        })
        .then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        const promises = []
        users.forEach(user => {
            promises.push(new User(user).save())
        })

        return Promise.all(promises)
    }).then(()=> done());   
}

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}