const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../models/user');
const {Todo} = require('./../models/todo');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'userone@email.com',
    password: 'password123',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({access: 'auth', _id: userOneId}, 'abc123').toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'usertwo@email.com',
    password: 'password123',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({access: 'auth', _id: userTwoId}, 'abc123').toString()
      }
    ]
  }
];

const todos = [
  {
    _id: new ObjectID(),
    text: 'Todo 1',
    createdAt: Date.now(),
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: 'Todo 2',
    createdAt: Date.now(),
    _creator: userTwoId
  }
];

const populateUsers = (done) => {
  User.remove({}).then(() => {

    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);

  }).then(() => done());
};

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

module.exports = {users, populateUsers, todos, populateTodos};
