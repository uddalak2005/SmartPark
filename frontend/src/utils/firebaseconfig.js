// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAihk3TCZlF850DARDcm7_NGElolvRRyCA",
  authDomain: "smartpark-a1374.firebaseapp.com",
  projectId: "smartpark-a1374",
  storageBucket: "smartpark-a1374.firebasestorage.app",
  messagingSenderId: "737814718073",
  appId: "1:737814718073:web:677efd9a947959563156a8",
  measurementId: "G-471BZSRP85"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };