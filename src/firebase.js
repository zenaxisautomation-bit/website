import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXHjlWszE7XCZn7AKdNae9nJCUtYNJy7g",
  authDomain: "website-9443e.firebaseapp.com",
  projectId: "website-9443e",
  storageBucket: "website-9443e.firebasestorage.app",
  messagingSenderId: "441924749894",
  appId: "1:441924749894:web:1cebbe1cea5b21c3399847"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
