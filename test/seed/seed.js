const jwt = require('jsonwebtoken');
const {
    ObjectId
} = require('mongodb');

const {
    Todo
} = require('../../src/models/todo');

const {
    User
} = require('../../src/models/user')
const JWT_SECRET = process.env.JWT_SECRET;
const userOneID = new ObjectId()
const userTwoID = new ObjectId()
const access = 'auth'

const userOneToken = jwt.sign({
    _id: userOneID,
    access
}, JWT_SECRET).toString()

const userTwoToken = jwt.sign({
    _id: userTwoID,
    access
}, JWT_SECRET).toString()

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
    password: 'PassUser2',
    tokens: [{
        access,
        token: userTwoToken
        }]
}]
const todos = [{
    _id: new ObjectId(),
    text: 'First test todo',
    _creator: userOneID
}, {
    _id: new ObjectId(),
    text: 'Second test todo',
    _creator: userOneID
}, {
    _id: new ObjectId(),
    text: 'Third test todo',
    _creator: userTwoID
}, {
    _id: new ObjectId(),
    text: 'Forth test todo',
    completed: true,
    completedAt: 2018,
    _creator: userTwoID
}]


const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
            return Todo.insertMany(todos)
        })
        .then(() => done());
}

const populateUsers = (done) => {
    User.deleteMany({}).then(() => {
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