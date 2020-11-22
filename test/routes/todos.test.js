const expect = require('expect');
const request = require('supertest');
const _ = require('lodash')
const { ObjectId } = require('mongodb');
const { app } = require('../../src/server');
const { Todo } = require('../../src/models/todo');
const {
    todos,
    populateTodos,
    users
} = require('../seed/seed');

const user1Todos = _.filter(todos,{'_creator':users[0]._id}).length
const testDataSize = todos.length

beforeEach(populateTodos)
describe('Todos routes tests',() => {
    describe('POST /todos', () => {
        it('should create a new todo', (done) => {
            let text = 'Test todo text';
            request(app)
                .post('/todos')
                .set('x-auth',users[0].tokens[0].token)
                .send({
                    text
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todo.text).toBe(text);
                    expect(res.body.todo._creator).toBe(`${users[0]._id}`)
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
        });
        it('should not create todo with invalid body data', (done) => {
            request(app)
                .post('/todos')
                .set('x-auth',users[0].tokens[0].token)
                .send({})
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.error.message).toBe('Todo validation failed: text: Path `text` is required.');
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.find()
                        .then((todos) => {
                            expect(todos.length).toBe(testDataSize);
                            done();
                        }).catch((err) => done(err));
                });
        });
    });

    describe('GET /todos', () => {
        it('should get all todos', (done) => {
            request(app)
                .get('/todos')
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todos.length).toBe(user1Todos);
                })
                .end(done);
        });
    });

    describe('GET /todos:id', () => {
        it('should get todo by id', (done) => {
            request(app)
                .get(`/todos/${todos[0]._id.toHexString()}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todo.text).toBe(todos[0].text);
                })
                .end(done);
        });
        it('should not get todo by id', (done) => {
            request(app)
                .get(`/todos/${todos[0]._id.toHexString()}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end(done);
        });
        it('should return 404 if todo not found', (done) => {
            const testID = new ObjectId;
            request(app)
                .get(`/todos/${testID.toHexString()}`)
                .set('x-auth',users[0].tokens[0].token)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end(done);
        });
        it('should return 400 for non-object ids', (done) => {
            request(app)
                .get('/todos/1245')
                .set('x-auth',users[0].tokens[0].token)
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('ID is not valid');
                })
                .end(done);
        });
    });

    describe('DELETE /todos:id', () => {
        it('should remove a todo', (done) => {
            const todoId = todos[2]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.message).toBe('Todo deleted');
                    expect(res.body.todo.text).toBe(todos[2].text);
                })
                .end(async (err, res) => {
                    if (err) {
                        return done(err);
                    }
                    try {
                        const [todo, todos ] = await Promise.all([
                            Todo.findById(todoId),
                            Todo.find()
                        ])
                        expect(todo).toBeFalsy()
                        expect(todos.length).toBe(testDataSize - 1);
                        done();
                    } catch (error) {
                        done(error)
                    }
                });
        });

        it('should not remove a todo', (done) => {
            const todoId = todos[0]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.findById(todoId).then((todo) => {
                        expect(todo).toBeTruthy();
                    }).catch((err) => done(err));
                    Todo.find().then((todos) => {
                        expect(todos.length).toBe(testDataSize);
                    }).catch((err) => done(err));
                    done();
                });
        });

        it('should return 404 if todo not found', (done) => {
            const testID = new ObjectId;
            request(app)
                .delete(`/todos/${testID.toHexString()}`)
                .set('x-auth',users[1].tokens[0].token)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end(done);
        });
        it('should return 400 if object id is invalid', (done) => {
            request(app)
                .delete('/todos/1245')
                .set('x-auth',users[1].tokens[0].token)
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('ID is not valid');
                })
                .end(done);
        });
    });
    describe('PATCH /todos:id', () => {
        it('should update the todo', (done) => {
            const todoId = todos[1]._id.toHexString();
            const updatedData = {
                text: 'New data from test',
                completed: true
            };
            request(app)
                .patch(`/todos/${todoId}`)
                .set('x-auth',users[0].tokens[0].token)
                .send(updatedData)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    const todo = res.body.todo;
                    expect(todo.text).toBe(updatedData.text);
                    expect(todo.completed).toBeTruthy();
                    expect(typeof todo.completedAt).toBe('number')
                    expect(res.body.message).toBe('Todo updated');
                })
                .end(done);
        });

        it('should not update the todo', (done) => {
            const todoId = todos[1]._id.toHexString();
            const updatedData = {
                text: 'New data from test',
                completed: true
            };
            request(app)
                .patch(`/todos/${todoId}`)
                .set('x-auth',users[1].tokens[0].token)
                .send(updatedData)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end(done);
        });

        it('should clear completedAt when todo is not completed', (done) => {
            const todoID = todos[3]._id.toHexString();
            const updatedData = {
                text: 'Data form test',
                completed: false
            };
            request(app)
                .patch(`/todos/${todoID}`)
                .set('x-auth',users[1].tokens[0].token)
                .send(updatedData)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    const todo = res.body.todo;
                    expect(todo.text).toBe(updatedData.text);
                    expect(todo.completed).toBeFalsy();
                    expect(todo.completedAt).toBeFalsy();
                    expect(res.body.message).toBe('Todo updated');
                })
                .end(done);
        });
        it('should return 404 if todo not found', (done) => {
            const testID = new ObjectId;
            const updatedData = {
                text: 'New data from test',
                completed: true
            };
            request(app)
                .patch(`/todos/${testID.toHexString()}`)
                .set('x-auth',users[1].tokens[0].token)
                .send(updatedData)
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('Todo not found');
                })
                .end(done);
        });
        it('should return 400 if object id is invalid', (done) => {
            const updatedData = {
                text: 'New data from test',
                completed: true
            };
            request(app)
                .patch('/todos/1245')
                .set('x-auth',users[1].tokens[0].token)
                .send(updatedData)
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message).toBe('ID is not valid');
                })
                .end(done);
        });
    });
});