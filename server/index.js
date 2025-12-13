const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT
const { addUser, getUsers, loginUser } = require('./controller/user');

// Włącz CORS dla wszystkich źródeł
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Hello World!');
})

app.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        // Validate required fields are present and are strings
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'All fields are required: name, email, and password' 
            });
        }

        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ 
                error: 'All fields must be strings' 
            });
        }

        // Validate fields are not empty strings
        if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({ 
                error: 'Fields cannot be empty' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }

        // Validate password length (minimum 6 characters, after trimming)
        if (password.trim().length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Pass only validated fields to addUser
        const userData = { name, email, password };
        if (age !== undefined) {
            userData.age = age;
        }
        
        const user = await addUser(userData);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json({
            message: 'Zalogowano pomyślnie!',
            token: result.token,
            user: result.user
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})