import express from 'express';
import auth from './database/firbase.js';
import { createUserWithEmailAndPassword } from "firebase/auth";

const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello world!')
})

app.post('/user', async (req, res) => {
    
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        res.status(201).send(`User registered: ${userCredential.user}`);
    } catch (error) {
        console.error("Error registering user:", error.message);
    }
})
  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})