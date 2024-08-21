// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
//import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsx3LwfdMgWb5ltoq5DytCcoHWMiSft0A",
  authDomain: "flashcards-pr.firebaseapp.com",
  projectId: "flashcards-pr",
  storageBucket: "flashcards-pr.appspot.com",
  messagingSenderId: "779125397706",
  appId: "1:779125397706:web:4b1b4cfab6b56afab3bc33",
  measurementId: "G-VE3T8EKTVT"
};


// let app, db, auth;

// if (typeof window !== 'undefined') {
//   app = initializeApp(firebaseConfig);
//   db = getFirestore(app);
//   auth = getAuth(app);
// }

// export { db, auth };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db};
