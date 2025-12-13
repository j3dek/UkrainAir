const { User } = require('../router/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
require('dotenv').config();

// Shared email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const addUser = async (userData) => {
    try {
        // Input validation before processing
        if (!userData.email || !userData.password) {
            const error = new Error("Email i hasło są wymagane");
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        // Email format validation
        if (!EMAIL_REGEX.test(userData.email)) {
            const error = new Error("Nieprawidłowy format adresu email");
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        // Name validation
        if (!userData.name || userData.name.trim().length === 0) {
            const error = new Error("Imię jest wymagane");
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        const saltRounds = parseInt(process.env.saltRounds, 10);
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const user = new User({
            name: userData.name,
            email: userData.email,
            age: userData.age,
            password: hashedPassword
        });

        await user.save();
        console.log('Użytkownik zapisany!');
        return user; 
    } catch (err) {
        console.error('Błąd przy dodawaniu użytkownika:', err);
        throw err;
    }
};

const getUsers = async () => {
    try {
        const users = await User.find({}, '-password'); 
        console.log("dzialajj");
        return users;
    } catch (err) {
        throw err;
    }
};


const loginUser = async (email, password) => {
    // Input validation before database queries
    if (!email || !password) {
        const error = new Error("Email i hasło są wymagane");
        error.type = 'VALIDATION_ERROR';
        throw error;
    }

    // Basic email format validation
    if (!EMAIL_REGEX.test(email)) {
        const error = new Error("Nieprawidłowy format adresu email");
        error.type = 'VALIDATION_ERROR';
        throw error;
    }

    // Database query for authentication
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Nieprawidłowy email lub hasło");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Nieprawidłowy email lub hasło");
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' } 
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

module.exports = { addUser, getUsers, loginUser };
