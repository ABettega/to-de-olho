const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {type: String,  required: true},
  lastName: {type:String, required:true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  gender: {type: String, required: true},
  day: {type: Number, required: true},
  month: {type: String, required: true},
  year: {type: Number, required: true},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
