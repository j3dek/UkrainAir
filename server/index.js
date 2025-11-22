const express = require('express')
require('dotenv').config();
const app = express()
const port = process.env.PORT
const { User } = require('./router/database')
const { addUser, getUsers, loginUser } = require('./controller/user');


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

app.post('/register', async (req, res) => {
    try {
        const user = await addUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('help');
        const token  = await loginUser(email, password);
        res.status(200).json({ message: 'Zalogowano pomyślnie!', token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})