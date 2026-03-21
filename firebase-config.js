import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaXWdAkWm52xjIGYVdfb29pp4-X64yglQ",
  authDomain: "funduk-shop.firebaseapp.com",
  projectId: "funduk-shop",
  storageBucket: "funduk-shop.firebasestorage.app",
  messagingSenderId: "542778533302",
  appId: "1:542778533302:web:0d7829a22f03a5f8ee0d17"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
