import mongodb from 'mongodb';
const { MongoClient, ServerApiVersion } = mongodb; 
import dotenv from 'dotenv';

let mongoClient = undefined;


export async function connectDB(){
    const uri = process.env.MONGO_CONNECTION_STRING;

    mongoClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
    
    await mongoClient.connect();


console.log('Connected to MongoDB Atlas');
}

export async function getUsers() {
  try {
    
    const db = mongoClient.db('app'); // Replace with your database name
    const collection = db.collection('users'); // Replace with your collection name

    // Example: Query documents in the collection
    const docs = await collection.find({}).toArray();
    console.log('Documents:', docs);
  } catch (error) {
  } finally {
  }
}

export async function createUserInDB(email, role){
    const db = mongoClient.db('app'); // Replace with your database name
    const collection = db.collection('users');

    const newUser = {
        email,
        role
      };
  
      const result = await collection.insertOne(newUser);
      console.log('User created:', result.insertedId); 
}

connectDB();

getUsers();