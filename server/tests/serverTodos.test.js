const expect = require('expect');
const request = require('supertest');
const { ObjectId } = require('mongodb');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const {
    todos,
    populateTodos,
} = require('./seed/seed');

const testDataSize = todos.length;
exports.testDataSize = testDataSize;

beforeEach(populateTodos)
describe('Todos routes tests',() => {
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
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todo.text).toBe(text);
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
                .send({})
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false);
                    expect(res.body.message.name).toBe('ValidationError');
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
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todos.length).toBe(testDataSize);
                })
                .end(done);
        });
    });
    describe('GET /todos:id', () => {
        it('shoudl get todo by id', (done) => {
            request(app)
                .get(`/todos/${todos[0]._id.toHexString()}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.todo.text).toBe(todos[0].text);
                })
                .end(done);
        });
        it('should return 404 if todo not found', (done) => {
            const testID = new ObjectId;
            request(app)
                .get(`/todos/${testID.toHexString()}`)
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
            const todoId = todos[1]._id.toHexString();
            request(app)
                .delete(`/todos/${todoId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    expect(res.body.message).toBe('Todo deleted');
                    expect(res.body.todo.text).toBe(todos[1].text);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    Todo.findById(todoId).then((todo) => {
                        expect(todo).toNotExist();
                    }).catch((err) => done(err));
                    Todo.find().then((todos) => {
                        expect(todos.length).toBe(testDataSize - 1);
                    }).catch((err) => done(err));
                    done();
                });
        });
        it('should return 404 if todo not found', (done) => {
            const testID = new ObjectId;
            request(app)
                .delete(`/todos/${testID.toHexString()}`)
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
                .send(updatedData)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    const todo = res.body.todo;
                    expect(todo.text).toBe(updatedData.text);
                    expect(todo.completed).toBeTruthy();
                    expect(todo.completedAt).toBeA('number');
                    expect(res.body.message).toBe('Todo updated');
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
                .send(updatedData)
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true);
                    const todo = res.body.todo;
                    expect(todo.text).toBe(updatedData.text);
                    expect(todo.completed).toBeFalsy();
                    expect(todo.completedAt).toNotExist();
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