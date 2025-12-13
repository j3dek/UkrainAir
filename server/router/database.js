const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Połączono z MongoDB!"))
    .catch(err => {
        console.error("Błąd połączenia:", err);
        process.exit(1);
    });

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
    },
    age: Number,
    password: {
        type: String,
        required: true,
        select: false
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
