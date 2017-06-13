const _ = require('lodash');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email.'
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    tokens: [{
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
    }]
});

UserSchema.pre('save', function(next) {

  var user = this;

  if(user.isModified('password')) {
      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(user.password, salt, (err, hash) => {
          user.password = hash;
          next();
        });
      });
  } else {
    next();
  }

});

UserSchema.methods.toJSON = function() {

  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);

};

UserSchema.methods.generateAuthToken = function () {

  var user = this;
  var access = 'auth';
  var token = jwt.sign({access, _id: user._id.toHexString()}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });

};

UserSchema.statics.findByToken = function(token) {

  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

UserSchema.statics.findByCredentials = function(email, password) {

  var User = this;

  return User.findOne({email}).then((user) => {

    if(!user) return Promise.reject();

    return new Promise((resolve, reject) => {

      bcryptjs.compare(password, user.password).then((res) => {

        if(res) {
          resolve(user);
        } else {
          reject();
        }

      });

    });

  });

};

UserSchema.methods.removeToken = function(token) {

  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });

};

var User = mongoose.model('User', UserSchema);

module.exports = {User};
