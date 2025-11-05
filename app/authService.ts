import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export const handleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    console.log("✅ Đăng nhập thành công!");
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
  }
};

export const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("👋 Đăng xuất thành công!");
  } catch (error) {
    console.error("❌ Lỗi đăng xuất:", error);
  }
};
