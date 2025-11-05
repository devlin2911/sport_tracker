import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    setLogLevel
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Bật chế độ debug để theo dõi các hoạt động của Firebase trong console
setLogLevel('debug');

// Lấy cấu hình Firebase từ biến toàn cục (được cung cấp bởi môi trường Canvas)
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ chính
export const db = getFirestore(app);
export const auth = getAuth(app);

// Xử lý đăng nhập ban đầu (MANDATORY: Sử dụng Custom Token hoặc Anonymous)
const initializeAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        // Sử dụng custom token nếu có (được cung cấp tự động)
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
        } catch (error) {
            console.error("Lỗi khi đăng nhập bằng Custom Token:", error);
        }
    } else {
        // Đăng nhập ẩn danh nếu không có token (tránh lỗi)
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Lỗi khi đăng nhập ẩn danh:", error);
        }
    }
};

// Gọi hàm khởi tạo auth
initializeAuth();


// Chức năng Đăng nhập bằng Google
const provider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        // Đôi khi người dùng hủy popup đăng nhập
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Lỗi đăng nhập Google:", error);
        }
    }
};

// Chức năng Đăng xuất
export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
};

// Xuất các instance db và auth để sử dụng trong các component khác
// (Đã được định nghĩa là export const ở trên)