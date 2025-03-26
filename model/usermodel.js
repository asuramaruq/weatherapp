const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {type: String, maxLength: 50, minLength: 2, require: true},
    password: {type: String, minLength: 2, require: true},
    isAdmin: {type: Boolean},
    deletedAt: {type: Date}
}, {timestamps: true});

const User = mongoose.model("Users", userSchema, 'users');

module.exports = User;