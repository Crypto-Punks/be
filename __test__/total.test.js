require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');

describe('total routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can post a total', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(() => {
        return agent
          .post('/api/v1/total')
          .send({
            totals: [{ name: 'USD', amount: 5000 }, { name: 'Bitcoin', amount: 1 }]
          })
          .then(res => {
            expect(res.body).toEqual({
              totals: [
                {
                  name: 'USD',
                  amount: 5000
                },
                {
                  name: 'Bitcoin',
                  amount: 1
                }
              ],
              user: expect.any(String),
              __v: 0,
              timestamp: expect.any(String),
              _id: expect.any(String)
            });
          });
      });
  });

  it('can get all totals for a user', () => {
    const agent = request.agent(app);
    return agent
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'abc1' })
      .then(() => {
        return agent
          .post('/api/v1/total')
          .send({
            totals: [{ name: 'USD', amount: 5000 }, { name: 'Bitcoin', amount: 1 }]
          })
          .then(() => {
            return agent
              .get('/api/v1/total')
              .then(res => {
                expect(res.body).toEqual([{
                  totals: [
                    {
                      name: 'USD',
                      amount: 5000
                    },
                    {
                      name: 'Bitcoin',
                      amount: 1
                    }
                  ],
                  user: expect.any(String),
                  __v: 0,
                  timestamp: expect.any(String),
                  _id: expect.any(String)
                }]);
              });
          });
      });
  });
});