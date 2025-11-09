'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup  } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { LogIn, LogOut, CheckCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
// ĐÃ SỬA LỖI: Chuyển từ alias '@/lib/firebase' sang đường dẫn tương đối để đảm bảo biên dịch.
import { db, auth, getAppId, signInWithGoogle, logOut } from '../lib/firebase';
import { handleLogin, handleLogout } from "../app/authService";
import  ListAthlete  from "../app/list_athlete";
import  ListMatch  from "../app/list_match";


// --- Main Component ---

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [matches, setMatches] = useState<Match[]>([]);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [playerScore, setPlayerScore] = useState<number | "">("");
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    const [activeTab, setActiveTab] = useState<"table" | "schedule">("table");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    

    // =================================================================
    // 1. Logic Xác thực (Auth)
    // =================================================================

    // Theo dõi trạng thái đăng nhập
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);  

    // =================================================================
    // 2. Logic Firestore: Real-time Data Fetching (Players & Matches)
    // =================================================================
    
    // Hàm utility để lấy path collection (Giả định private data)
    const getCollectionPath = (collectionName: string) => {
        const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';
        const userId = user?.uid || 'anonymous';
        return `artifacts/${appId}/users/${userId}/${collectionName}`;
    }

    // =================================================================
    // 4. Render UI Components
    // =================================================================
    
    const handleLogin = useCallback(async () => {
        try {
          setErrorMessage(null);
          const user = await signInWithGoogle();
      
          if (user) {
            console.log("✅ Đăng nhập thành công:", user.displayName || user.email);
          } else {
            console.log("⚠️ Đăng nhập thất bại hoặc bị hủy.");
            setErrorMessage("Đăng nhập thất bại hoặc bị hủy.");
          }
        } catch (error) {
          console.error("❌ Lỗi đăng nhập:", error);
          setErrorMessage("Lỗi đăng nhập Google. Vui lòng thử lại!");
        }
      }, []);
      
      const handleLogout = useCallback(async () => {
        try {
          setErrorMessage(null);
          await logOut();
          setPlayers([]);  // Xóa dữ liệu local
          setMatches([]);  // Xóa dữ liệu local
          console.log("🚪 Đã đăng xuất thành công!");
        } catch (error) {
          console.error("❌ Lỗi đăng xuất:", error);
          setErrorMessage("Lỗi đăng xuất. Vui lòng thử lại!");
        }
      }, []);      
      

    const renderAuthStatus = () => {
        if (loadingAuth) {
            return (
                <button
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                    disabled
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải...</span>
                </button>
            );
        }

        if (user) {
            return (
                <div className="flex items-center space-x-3">
                    {/* Ảnh đại diện người dùng */}
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full border border-gray-300 shadow-sm"
                      referrerPolicy="no-referrer" // tránh bị lỗi chặn ảnh từ Google
                    />
                  ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center  text-white font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </div>
  )}

  {/* Tên hoặc email người dùng */}
  <span className="bg-green-400 text-black rounded-md p-1 text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
    {user.displayName || user.email || (user.isAnonymous ? "Ẩn danh" : "Người dùng")}
  </span>

  {/* Nút đăng xuất */}
  <button
    onClick={handleLogout}
    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
  >
    <LogOut className="w-4 h-4" />
    <span className="hidden sm:inline-block">Đăng xuất</span>
  </button>
                </div>
            );
        }

        return (
            <button
                // Gọi handleLogin đã import
                onClick={handleLogin} 
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-colors shadow-lg"
            >
                <LogIn className="w-5 h-5 text-cyan-600" />
                <span className="font-bold">Đăng nhập Google</span>
            </button>
        );
    };


    const renderAuthGuard = (message: string) => (
        <p className="p-6 text-center text-gray-700 bg-white/80 rounded-xl shadow-inner my-6">
            Xin mời <span className="font-bold text-cyan-600">Đăng nhập</span> để {message}.
        </p>
    );

    const renderLoading = () => (
        <div className="flex justify-center items-center p-8 my-6">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <p className="ml-3 text-gray-700 font-medium">Đang tải dữ liệu...</p>
        </div>
    );


    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-50 flex flex-col items-center py-8 px-4">
      {/* Thanh trên cùng */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 drop-shadow-md">
          🏓 Pickleball Club Manager
        </h1>
        {renderAuthStatus()}
      </div>

      {/* Thanh chuyển tab */}
      <div className="flex space-x-3 mb-8">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'table'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Bảng thi đấu
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-full font-semibold transition-all ${
            activeTab === 'schedule'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Lịch thi đấu
        </button>
      </div>

      {/* Hiển thị nội dung theo tab */}
      {activeTab === 'table' ? (
        <ListAthlete
          user={user}
          getCollectionPath={getCollectionPath}
          renderAuthGuard={renderAuthGuard}
          renderLoading={renderLoading}
        />
      ) : (
        <ListMatch
          user={user}
          getCollectionPath={getCollectionPath}
          renderAuthGuard={renderAuthGuard}
          renderLoading={renderLoading}
        />
      )}

      {errorMessage && (
        <p className="mt-6 text-red-600 font-semibold bg-red-100 px-4 py-2 rounded-xl">
          ⚠️ {errorMessage}
        </p>
      )}

      {user && (
        <>
          {activeTab === 'players' && <ListAthlete user={user} />}
          {activeTab === 'matches' && <ListMatch user={user} />}
        </>
      )}

    </main>
    )

}