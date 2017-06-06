const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./server');
const {Todo} = require('./models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'Todo 1'
  },{
    text: 'Todo 2'
  }];

  beforeEach((done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  });

  describe('POST /todos', () => {

    it('should create a new todo', (done) => {

      var text = 'todo text';

      request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) return console.log(err);

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });

    });

    it('should not create a new todo with invalid data', (done) => {

      request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return console.log(err);

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });

    });

  });

  describe('GET /todos', () => {

    it('should get a list of todos', (done) => {

      request(app)
      .get('/todos')
      .expect(200)
      .end((err, res) => {
        if(err) return console.log(err);

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          expect(todos).toBeA('array');
          done();
        }).catch((e) => done(e));
      });

    });

  });

  describe('GET /todos/:id', () => {

    var id = todos[0]._id.valueOf();
    var fakeId = new ObjectID().valueOf();

    it('should get get a specific todo doc', (done) => {
      request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .end((err, res) => {
        if(err) return console.log(err);

        expect(res.body.todo).toBeA('object');
        expect(res.body.todo.text).toBe(todos[0].text);
        done();
      });

    });

    it('should return 404 if not found', (done) => {

      request(app)
      .get(`/todos/${fakeId}`)
      .expect(404)
      .end((err, res) => {
        done();
      });

    });

    it('should return 404 for non objectIDs', (done) => {

      request(app)
      .get('/todos/123abc')
      .expect(404)
      .end((err, res) => {
        done();
      });

    });

  });
