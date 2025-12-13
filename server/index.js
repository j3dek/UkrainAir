const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT
const { addUser, getUsers, loginUser } = require('./controller/user');

// Configure CORS to allow only trusted origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const allowNoOrigin = process.env.ALLOW_NO_ORIGIN === 'true';

if (allowedOrigins.length === 0 && !allowNoOrigin) {
    console.warn('Warning: CORS_ORIGIN not set. For production, set CORS_ORIGIN to allowed origins.');
}

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin only if explicitly configured
    if (!origin && allowNoOrigin) return callback(null, true);
    if (!origin && allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));
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
        // Input validation
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Wszystkie pola (name, email, password) są wymagane' });
        }
        
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
        // Input validation
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email i hasło są wymagane' });
        }
        
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