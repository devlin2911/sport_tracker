// lib/firebase.ts
// File cấu hình Firebase cho ứng dụng Next.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

// --- Cấu hình Firebase từ biến môi trường (an toàn & đúng chuẩn Next.js) ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// --- Đảm bảo không khởi tạo lại Firebase nhiều lần ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Khởi tạo các dịch vụ ---
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- Hàm đăng nhập bằng Google ---
const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Lỗi đăng nhập Google:", error);
    return null;
  }
};

// --- Hàm đăng xuất ---
const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
};

// --- (Tùy chọn) Nếu bạn cần getAppId, có thể thêm hàm này ---
export const getAppId = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id';
};

export const storage = getStorage(app);

// --- Xuất ra cho các file khác dùng ---
export { db, auth, signInWithGoogle, logOut };
