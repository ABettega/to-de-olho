const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String },
  email: { type: String, unique: true },
  senha: String,
  segue: [{ type: Schema.Types.ObjectId, ref: 'Politico' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
