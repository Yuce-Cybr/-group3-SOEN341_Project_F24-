import express from 'express';
import cors from 'cors'; // Ensure correct import
import { createUser, loginUser } from './database/firebase.js'; 

const app = express();
const port = 3000;

// Configure CORS to allow requests from your frontend origin
app.use(cors({
  origin: '*', // Replace with your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.post('/user', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await createUser(email, password);
    const response = {
      accessToken: user.stsTokenManager.accessToken
    };
    res.status(201).send(response);
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser(email, password);
    const response = {
      accessToken: user.stsTokenManager.accessToken
    };
    res.status(200).send(response);
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(401).send({ error: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
