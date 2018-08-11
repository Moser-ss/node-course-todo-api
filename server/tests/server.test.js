const expect = require('expect');
const jwt = require('jsonwebtoken')
const request = require('supertest');
const {
    ObjectId
} = require('mongodb');

const {
    app
} = require('./../server');
const {
    Todo
} = require('./../models/todo');
const {
    User
} = require('../models/user')
const {
    todos,
    populateTodos,
    users,
    populateUsers
} = require('./seed/seed');

const testDataSize = todos.length;

beforeEach(populateUsers)

beforeEach(populateTodos)

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                expect(res.body.todo.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({
                        text
                    })
                    .then((todos) => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    }).catch((err) => done(err));
            });
    })

    it('should not create todo with invalid body data', (done) => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message.name).toBe('ValidationError')
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(testDataSize)
                        done()
                    }).catch((err) => done(err))
            })
    })
})

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                expect(res.body.todos.length).toBe(testDataSize);
            })
            .end(done)
    })
})

describe('GET /todos:id', () => {
    it('shoudl get todo by id', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const testID = new ObjectId
        request(app)
            .get(`/todos/${testID.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Todo not found');
            })
            .end(done);

    });

    it('should return 400 for non-object ids', (done) => {
        request(app)
            .get('/todos/1245')
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('ID is not valid');
            })
            .end(done);
    });
});

describe('DELETE /todos:id', () => {
    it('should remove a todo', (done) => {
        const todoId = todos[1]._id.toHexString()

        request(app)
            .delete(`/todos/${todoId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                expect(res.body.message).toBe('Todo deleted');
                expect(res.body.todo.text).toBe(todos[1].text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.findById(todoId).then((todo) => {
                    expect(todo).toNotExist();
                }).catch((err) => done(err))

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(testDataSize - 1);
                }).catch((err) => done(err))
                done()
            })

    });

    it('should return 404 if todo not found', (done) => {
        const testID = new ObjectId
        request(app)
            .delete(`/todos/${testID.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Todo not found');
            })
            .end(done);
    });

    it('should return 400 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/1245')
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('ID is not valid');
            })
            .end(done);
    })
})

describe('PATCH /todos:id', () => {
    it('should update the todo', (done) => {
        const todoId = todos[1]._id.toHexString();
        const updatedData = {
            text: 'New data from test',
            completed: true
        }

        request(app)
            .patch(`/todos/${todoId}`)
            .send(updatedData)
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                const todo = res.body.todo;
                expect(todo.text).toBe(updatedData.text);
                expect(todo.completed).toBeTruthy();
                expect(todo.completedAt).toBeA('number')
                expect(res.body.message).toBe('Todo updated');
            })
            .end(done);

    });

    it('should clear completedAt when todo is not completed', (done) => {
        const todoID = todos[3]._id.toHexString()
        const updatedData = {
            text: 'Data form test',
            completed: false
        }

        request(app)
            .patch(`/todos/${todoID}`)
            .send(updatedData)
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                const todo = res.body.todo;
                expect(todo.text).toBe(updatedData.text);
                expect(todo.completed).toBeFalsy();
                expect(todo.completedAt).toNotExist();
                expect(res.body.message).toBe('Todo updated');
            })
            .end(done);

    });

    it('should return 404 if todo not found', (done) => {
        const testID = new ObjectId
        const updatedData = {
            text: 'New data from test',
            completed: true
        }
        request(app)
            .patch(`/todos/${testID.toHexString()}`)
            .send(updatedData)
            .expect(404)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Todo not found');
            })
            .end(done);
    });

    it('should return 400 if object id is invalid', (done) => {
        const updatedData = {
            text: 'New data from test',
            completed: true
        }

        request(app)
            .patch('/todos/1245')
            .send(updatedData)
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('ID is not valid');
            })
            .end(done);
    })
});

describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
        const userToken = users[0].tokens[0].token

        request(app)
            .get('/users/me')
            .set('x-auth', userToken)
            .expect(200)
            .expect((res) => {
                expect(res.body.ok).toBe(true)
                expect(res.body.user._id).toEqual(users[0]._id.toHexString())
                expect(res.body.user.email).toEqual(users[0].email)
            })
            .end(done)
    })

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Authentication failed : jwt must be provided')
            })
            .end(done)
    })

    it('should return 401 if malformed token', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', 'banana')
            .expect(401)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Authentication failed : jwt malformed')
            })
            .end(done)
    })

    it('should return 401 if invalid token', (done) => {
        let userToken = users[0].tokens[0].token
        userToken = userToken.substring(5)
        request(app)
            .get('/users/me')
            .set('x-auth', userToken)
            .expect(401)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Authentication failed : invalid token')
            })
            .end(done)
    })

    it('should return 404 if the token is valid and dont have user', (done) => {
        const userTestID = new ObjectId()
        const userToken = jwt.sign({
            _id: userTestID,
            access: 'auth'
        }, 'MacOSX').toString()

        request(app)
            .get('/users/me')
            .set('x-auth', userToken)
            .expect(404)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('User not found')
            })
            .end(done)
    })

})

describe('POST /users', () => {

    it('should create a user', (done) => {
        const email = 'test4@example.com'
        const password = 'PassUserTest4'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(201)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist()
                expect(res.body._id).toExist()
                expect(res.body.email).toBe(email)
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({
                        email
                    })
                    .then((user) => {
                        expect(user).toExist()
                        expect(user.password).toNotBe(password)
                        done();
                    })
            })

    })

    it('should return validation errors if request contains invalid password', (done) => {
        const email = 'test1@examplecom'
        const password = 'TestUser5!'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Error while trying save user');
                expect(res.body.error).toExist()
            })
            .end(done)
    })

    it('should return validation errors if request contains invalid email', (done) => {
        const email = 'test6@example.com'
        const password = 'toto'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Error while trying save user');
                expect(res.body.error).toExist()
            })
            .end(done)
    })

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: users[0].password
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.body.message).toBe('Error while trying save user');
                expect(res.body.error).toExist()
            })
            .end(done)
    })
})