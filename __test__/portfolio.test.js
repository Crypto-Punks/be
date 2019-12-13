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

  it('can get a portfolio', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(user => {
        return agent
          .post('/api/v1/portfolio')
          .send({ user })
          .then(() => {
            return agent
              .get('/api/v1/portfolio/')
              .expect(200)
              .then(result => {
                expect(result.body).toEqual({
                  watchList: [],
                  investedCoins: [{ _id: expect.any(String), name: 'USD', amount: 100000 }]
                });
              });
          });
      });
  });

  it('can update a portfolio', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(() => {
        return agent
          .post('/api/v1/portfolio');
      })
      .then(() => {
        return agent
          .put('/api/v1/portfolio')
          .send({ investedCoins: [{ name: 'USD', amount: 100000 }, { name: 'Bitcoin', amount: 1 }] })
          .then(res => {
            expect(res.body).toEqual({
              __v: 0,
              _id: expect.any(String),
              user: expect.any(String),
              watchList: [],
              investedCoins: [{ _id: expect.any(String), name: 'USD', amount: 100000 }, { _id: expect.any(String), name: 'Bitcoin', amount: 1 }]
            });
          });
      });
  });


});
