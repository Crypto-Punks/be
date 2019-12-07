require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');

describe('portfolio routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can post a portfolio', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(user => {
        return agent
          .post('/api/v1/portfolio')
          .send({ user })
          .then(res => {
            expect(res.body).toEqual({
              __v: 0,
              _id: expect.any(String),
              user: expect.any(String),
              watchList: [],
              investedCoins: [{ _id: expect.any(String), name: 'USD', amount: 10000 }]
            });
          });
      });
  });

  it('can get a portfolio', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(user => {
        return agent
          .post('/api/v1/portfolio')
          .send({ user })
          .then(res => {
            console.log(res.body._id);
            return agent
              .get('/api/v1/portfolio/')
              .expect(200)
              .then(result => {
                console.log(result.body);
                expect(result.body).toEqual({
                  __v: 0,
                  _id: expect.any(String),
                  user: expect.any(String),
                  watchList: [],
                  investedCoins: [{ _id: expect.any(String), name: 'USD', amount: 10000 }]
                });
              });
          });
      });
  });
});