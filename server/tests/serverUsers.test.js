const expect = require('expect');
const jwt = require('jsonwebtoken')
const request = require('supertest');
const {
    ObjectId
} = require('mongodb');

const {
    app
} = require('../server');
const {
    User
} = require('../models/user')
const {
    users,
    populateUsers
} = require('./seed/seed');
const JWT_SECRET = process.env.JWT_SECRET

beforeEach(populateUsers)
describe('Users routes tests',() => {
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
            }, JWT_SECRET).toString()

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

    });
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
                    expect(res.body.ok).toBe(true)
                    expect(res.body.user._id).toExist()
                    expect(res.body.user.email).toBe(email)
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
                        .catch((error) => done(error))
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
    });
    describe('POST /users/login', () => {
        it('should login user and return auth token', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    email: users[1].email,
                    password: users[1].password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true)
                    expect(res.headers['x-auth']).toExist()
                    expect(res.body.user._id).toExist()
                    expect(res.body.user.email).toBe(users[1].email)
                })
                .end((error, res) => {
                    if (error) {
                        return done(error)
                    }

                    User.findById(users[1]._id)
                        .then((user) => {
                            if (!user) {
                                return done('Missing User in DB')
                            }

                            expect(user.tokens[1]).toInclude({
                                access: 'auth',
                                token: res.headers['x-auth']
                            })
                            done()
                        })
                        .catch((error) => done(error))
                })
        })

        it('should return 400 if missing parameters', (done) => {
            request(app)
                .post('/users/login')
                .send({

                })
                .expect(400)
                .expect((res) => {
                    expect(res.body.ok).toBe(false)
                    expect(res.body.message).toBe('Missing email or password to login')
                })
                .end(done)
        })

        it('should return 401 if password is incorrect', (done) => {
            const testUser = users[1]
            request(app)
            .post('/users/login')
            .send({
                email: testUser.email,
                password: 'Banana'
            })
            .expect(401)
            .expect((res) => {
                expect(res.body.ok).toBe(false)
                expect(res.headers['x-auth']).toNotExist()
                expect(res.body.user).toNotExist()
                expect(res.body.user).toNotExist()
                expect(res.body.message).toBe('Invalid password')
            })
            .end((error, res) => {
                if (error) {
                    return done(error)
                }

                User.findById(testUser._id)
                    .then((user) => {
                        if (!user) {
                            return done('Missing User in DB')
                        }

                        expect(user.tokens.length).toBe(testUser.tokens.length)
                        done()
                    })
                    .catch((error) => done(error))
            })
        })

        it('should return 404 if user dont exist', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    email: 'test5user@example.com',
                    password: 'TestUserPassw'
                })
                .expect(404)
                .expect((res) => {
                    expect(res.body.ok).toBe(false)
                    expect(res.body.message).toBe('User not found')
                })
                .end(done)
        })
    });
    describe('DELETE /users/me/token', () => {
        it('should remove auth token on logout', (done) => {
            const userToken = users[0].tokens[0].token

            request(app)
                .delete('/users/me/token')
                .set('x-auth', userToken )
                .expect(200)
                .expect((res) => {
                    expect(res.body.ok).toBe(true)
                    expect(res.body.message).toEqual('User signup')
                })
                .end((error, res) => {
                    if (error) {
                        return done(error)
                    }
                    
                    User.findById(users[0]._id)
                        .then((user) => {
                            if (!user) {
                                return done('Missing User in DB')
                            }
                            expect(user.tokens.length).toEqual(0)
                            done()
                        })
                })
        })
    });
});