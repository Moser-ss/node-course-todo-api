const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {
    app
} = require('./../server');
const {
    Todo
} = require('./../models/todo');

const todos = [{
    _id: new ObjectId(),
    text: 'First test todo'
}, {
    _id: new ObjectId(),
    text: 'Second test todo'
}, {
    _id: new ObjectId(),
    text: 'Third test todo'
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    })
    .then(() => done());
})

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
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text})
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
                expect(res.body.name).toBe('ValidationError')
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(3)
                        done()
                    }).catch((err) => done(err))
            })
    })
})

describe('GET /todos',() => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(3);
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
                 expect(res.body.error).toBe('Todo not found');
            })
            .end(done);
    
    });

    it('should return 400 for non-object ids', (done) => {
        request(app)
            .get('/todos/1245')
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('ID is not valid');
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
                expect(res.body.message).toBe('Todo deleted');
                expect(res.body.todo.text).toBe(todos[1].text)
            })
            .end((err, res) => {
                if(err){
                    return done(err)        
                }

                Todo.findById(todoId).then((todo) => {
                    expect(todo).toBeNull();
                }).catch((err) => done(err))

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
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
                expect(res.body.error).toBe('Todo not found');
            })
            .end(done);
    });

    it('should return 400 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/1245')
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('ID is not valid');
            })
            .end(done);
    })
})