const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    username: {
        type: Number,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

UserSchema.plugin(uniqueValidator);
UserSchema.plugin(autoIncrement.plugin, { model: "User", field: 'username',
    startAt: 100000,
    incrementBy: 1
});

const User = module.exports = mongoose.model('User', UserSchema);

// Find the user by ID
module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getAllUser = function (callback) {
    console.log("called");
    User.find(callback);
}

// Find the user by Its username
module.exports.getUserByUsername = function (username, callback) {
    const query = {
        username: username
    }
    User.findOne(query, callback);
}

// to Register the user
module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

// Compare Password
module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}
