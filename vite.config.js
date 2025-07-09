import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5Lc4zpsu3IDUkc5OAwbzv_zYLXqvDH_Y",
  authDomain: "create-2025.firebaseapp.com",
  projectId: "create-2025",
  storageBucket: "create-2025.firebasestorage.app",
  messagingSenderId: "386106863721",
  appId: "1:386106863721:web:23e2177b35b7f4d309f2f8",
  measurementId: "G-KQ91W3GT1T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

