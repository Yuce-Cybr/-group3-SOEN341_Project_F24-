// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "group3-9f431.firebaseapp.com",
  projectId: "group3-9f431",
  storageBucket: "group3-9f431.appspot.com",
  messagingSenderId: "521460048927",
  appId: "1:521460048927:web:a6b7c1f37366364d7fa12a",
  measurementId: "G-WD3Y6KP1YR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default { app, auth }