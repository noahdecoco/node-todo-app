require('./config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

let app = express();

app.use(bodyParser.json());

// Create a todo
app.post('/todos', (req, res) => {

  let todo = new Todo({
    text: req.body.text,
    createdAt: Date.now()
  });

  todo.save().then((doc) => {

    res.send(doc);

  }).catch((err) => {

    res.status(400).send(err);

  });

});

// Get all todos
app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {

    res.send({todos});

  }).catch((err) => {

    res.status(400).send(err);

  });

});

// Get a specific todo
app.get('/todos/:id', (req, res) => {

  let id = req.params.id;

  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todo.findById(id).then((todo) => {

    if(!todo) return res.status(404).send();
    res.send({todo});

  }).catch((err) => {

    res.status(400).send();

  });

});

// Delete all todos
app.delete('/todos/', (req, res) => {

  Todo.remove({}).then((todos) => {

    if(!todos) return res.status(404).send();
    res.send({todos});

  }).catch((err) => {

    res.status(400).send();

  });

});

// Delete a specific todo
app.delete('/todos/:id', (req, res) => {

  let id = req.params.id;

  if(!ObjectID.isValid(id)) return res.status(404).send();

  Todo.findByIdAndRemove(id).then((todo) => {

    if(!todo) return res.status(404).send();
    res.send({todo});

  }).catch((err) => {

    res.status(400).send();

  });

});

// Update a todo
app.patch('/todos/:id', (req, res) => {

  let id = req.params.id;

  if(!ObjectID.isValid(id)) return res.status(404).send();

  let body = _.pick(req.body, ['text', 'completed']);

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = Date.now();
  } else {
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {

    if(!todo) return res.status(404).send();
    res.send(todo);

  }).catch((err) => {

    res.status(400).send(err);

  });

});

// Create a new user
app.post('/users', (req, res) => {

  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user.save().then((user) => {

    return user.generateAuthToken();

  }).then((token) => {

    res.header('x-auth', token).send(user);

  }).catch((err) => {

    res.status(400).send(err);

  });

});

// Get user
app.get('/users/me', authenticate, (req, res) => {

  res.send(req.user);

});

// Login user
app.post('/users/login', (req, res) => {

  let body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      console.log('fds');
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => {
    res.status(400).send();
  });

});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

module.exports = {app};
