// lib/firebase.ts
// File này chứa logic cấu hình Firebase, Auth và Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Các biến toàn cục được cung cấp bởi môi trường Canvas
// Chúng ta sẽ giả định các biến này tồn tại hoặc sử dụng giá trị mặc định cho an toàn
declare const __firebase_config: string | undefined;

// Phân tích cú pháp cấu hình Firebase
let firebaseConfig = {};
if (typeof __firebase_config !== 'undefined') {
    try {
        firebaseConfig = JSON.parse(__firebase_config);
    } catch (e) {
        console.error("Lỗi khi parse __firebase_config:", e);
    }
} else {
    // Cấu hình an toàn nếu không có biến môi trường (chỉ dùng cho mục đích phát triển cục bộ)
    console.warn("Sử dụng cấu hình Firebase mặc định. Vui lòng cung cấp __firebase_config.");
    firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
}


// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Hàm Đăng nhập bằng Google
const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        // Có thể là lỗi cửa sổ bật lên bị đóng hoặc bị chặn
        return null;
    }
};

// Hàm Đăng xuất
const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
};

export { db, auth, signInWithGoogle, logOut };