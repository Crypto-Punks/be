require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');
const User = require('../lib/models/User');

describe('auth routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  beforeEach(() => {
    return User.init();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can sign up a new user', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({ username: 'test', password: 'abc' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          username: 'test'
        });
      });
  });

  it('wont allow duplicate users', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({ username: 'test', password: 'abc' })
      .then(() => {
        return request(app)
          .post('/api/v1/auth/signup')
          .send({ username: 'test', password: '1234' });
      })
      .then(res => { 
        expect(res.error.status).toEqual(500);
      });
  });

  it('can singin a user', async() => {
    await User.create({ username: 'test', password: 'abc' });
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ username: 'test', password: 'abc' });

    expect(res.body).toEqual({
      _id: expect.any(String),
      username: 'test'
    });
  });

  it('errors signin a user when a bad password is provided', async() => {
    await User.create({ username: 'test', password: 'abc' });
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ username: 'test', password: '123' });

    expect(res.status).toEqual(401);
    expect(res.body).toEqual({
      message: 'Invalid username or password',
      status: 401
    });
  });

  it('errors signin a user when a bad username is provided', async() => {
    await User.create({ username: 'test', password: 'abc' });
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ username: 'dog', password: 'abc' });

    expect(res.status).toEqual(401);
    expect(res.body).toEqual({
      message: 'Invalid username or password',
      status: 401
    });
  });
});
