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
        const user = await addUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        // Return 400 for validation errors, 500 for server errors
        const statusCode = err.type === 'VALIDATION_ERROR' ? 400 : 500;
        res.status(statusCode).json({ error: err.message });
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
        // Return 400 for validation errors, 401 for authentication failures
        const statusCode = err.type === 'VALIDATION_ERROR' ? 400 : 401;
        res.status(statusCode).json({ message: err.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})