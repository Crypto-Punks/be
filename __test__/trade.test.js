require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');

describe('trade routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can post a trade', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(user => {
        return agent
          .post('/api/v1/trade')
          .send({
            user: user._id,
            exchange_rate: 1000,
            from_currency: 'USD',
            to_currency: 'bitcoin'
          })
          .then(res => {
            expect(res.body).toEqual({
              __v: 0,
              _id: expect.any(String),
              user: expect.any(String),
              timestamp: expect.any(String),
              exchange_rate: 1000,
              from_currency: 'USD',
              to_currency: 'bitcoin'
            });
          });
      });
  });

  it('can get all trades for a user', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(user => {
        return agent
          .post('/api/v1/trade')
          .send({
            user: user._id,
            exchange_rate: 1000,
            from_currency: 'USD',
            to_currency: 'bitcoin'
          })
          .then(() => {
            return agent
              .get('/api/v1/trade')
              .then(res => {
                expect(res.body).toEqual([{
                  __v: 0,
                  _id: expect.any(String),
                  user: expect.any(String),
                  timestamp: expect.any(String),
                  exchange_rate: 1000,
                  from_currency: 'USD',
                  to_currency: 'bitcoin'
                }]);
              });
          });
      });
  });
});