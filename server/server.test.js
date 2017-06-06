const expect = require('expect');
const request = require('supertest');

const {app} = require('./server');
const {Todo} = require('./models/todo');

const todos = [{text: 'Todo 1'},{text: 'Todo 2'}];

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
