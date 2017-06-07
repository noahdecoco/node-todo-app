const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create a todo
app.post('/todos', (req, res) => {

  let todo = new Todo({
    text: req.body.text,
    createdAt: Date.now()
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });

});

// Get all todos
app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
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

  }).catch((err) => res.status(400).send(err));

});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = {app};
