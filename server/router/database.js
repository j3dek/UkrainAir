const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Połączono z MongoDB!"))
    .catch(err => console.error("Błąd połączenia:", err));

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    age: Number,
    password: String
});

const User = mongoose.model('User', UserSchema);

const user = new User({ name: 'Jan', email: 'jan@example.com', age: 25, password : 'Password123' });
user.save().then(() => console.log("Użytkownik zapisany!"));

module.exports = { User };
