// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVWzgevsy_bKpzHi3Evyf_9J3I-_DITpY",
  authDomain: "everlilys.firebaseapp.com",
  projectId: "everlilys",
  storageBucket: "everlilys.firebasestorage.app",
  messagingSenderId: "621436925111",
  appId: "1:621436925111:web:15ac65e02981c5fbc68932",
  measurementId: "G-Q5VXRPKGLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;