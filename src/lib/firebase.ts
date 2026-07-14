// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1GpvKArB-cQpCZbrCvEfFisyV40d4oik",
  authDomain: "notentool-d62dc.firebaseapp.com",
  projectId: "notentool-d62dc",
  storageBucket: "notentool-d62dc.firebasestorage.app",
  messagingSenderId: "1083935445136",
  appId: "1:1083935445136:web:4d822579ef231aad4bc815",
  measurementId: "G-5R9JB9MGSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);