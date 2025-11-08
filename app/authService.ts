// app/authService.ts
import { logOut } from "../lib/firebase";

export const handleLogin = async () => {
  try {
    await signInWithGoogle();
    console.log("Đăng nhập thành công!");
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
  }
};

export const handleLogout = async () => {
  try {
    await logOut();
    console.log("Đăng xuất thành công!");
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
  }
};

