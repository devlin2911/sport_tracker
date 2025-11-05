'use client';

// Các imports từ Firebase
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged, 
    User, 
    signInWithCustomToken,
    // CẦN CÓ CÁC HÀM NÀY CHO ĐĂNG NHẬP GOOGLE
    GoogleAuthProvider, 
    signInWithPopup,
    signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Biến toàn cục từ môi trường Canvas/Vercel
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;
declare const __app_id: string | undefined;

// --- Cấu hình Firebase ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { /* Cấu hình dự phòng */ };

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- Hàm tiện ích ---

// Hàm lấy App ID (đã sửa lỗi biên dịch)
export const getAppId = (): string => {
    if (typeof window !== 'undefined') {
        // Ép kiểu để truy cập biến toàn cục trong runtime
        return (window as any).__app_id || 'default-app-id'; 
    }
    return 'default-app-id';
};

// --- Hàm xác thực ---

// Khởi tạo Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Hàm Đăng nhập bằng Google
export const signInWithGoogle = async () => {
    try {
        // SỬ DỤNG signInWithPopup ĐỂ MỞ CỬA SỔ ĐĂNG NHẬP
        await signInWithPopup(auth, googleProvider);
        console.log("Đăng nhập Google thành công!");
    } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        // Lỗi thường gặp nhất là 'auth/popup-closed-by-user' hoặc 'auth/cancelled-popup-request'
        // Bạn có thể xử lý lỗi ở đây, ví dụ: hiển thị thông báo.
        if ((error as any).code === 'auth/popup-closed-by-user') {
            console.log("Người dùng đã đóng cửa sổ đăng nhập.");
        }
    }
};

// Hàm Đăng xuất
export const handleLogout = async () => {
    try {
        await signOut(auth);
        console.log("Đã đăng xuất.");
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
}