// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIEH8b8zIZGJ5h_92y3rAN4S_x2cDevwI",
  authDomain: "tachopause-optimizer-24982.firebaseapp.com",
  projectId: "tachopause-optimizer-24982",
  storageBucket: "tachopause-optimizer-24982.appspot.com",
  messagingSenderId: "54230835154",
  appId: "1:54230835154:web:2f8319e59acc409f9e71f5"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
