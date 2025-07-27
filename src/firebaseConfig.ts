import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwGmNHxvSEqKcPFkz3NeiIg4FzCPpsu5w",
  authDomain: "cultrs-backend.firebaseapp.com",
  projectId: "cultrs-backend",
  storageBucket: "cultrs-backend.firebasestorage.app",
  messagingSenderId: "877519543512",
  appId: "1:877519543512:web:367eaecfdf70f27013cbad",
  measurementId: "G-8PTF75J3KD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };