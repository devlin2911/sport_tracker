'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { db, auth, signInWithGoogle, logOut } from '../lib/firebase';
import ListAthlete from './list_athlete';
import ListMatch from './list_match';
import Booking from './Bookings/booking';
import SportEquip from "./sport_product/sport_equip";
import { useSearchParams, useRouter } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ==============================
  // State
  // ==============================
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState< 'home' | 'booking' | 'athlete' | 'match' | 'sport_equip' >('home');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ==============================
  // 1. Auth
  // ==============================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = useCallback((tab: 'home' | 'booking' | 'athlete' | 'match' | 'sport_equip' ) => {
    setActiveTab(tab);
    // Cập nhật URL một lần duy nhất khi người dùng click
    router.replace(`?tab=${tab}`); 
  }, [router]);

  const handleLogin = useCallback(async () => {
    try {
      setErrorMessage(null);
      const user = await signInWithGoogle();
      if (user) {
        console.log('✅ Đăng nhập thành công:', user.displayName || user.email);
      } else {
        setErrorMessage('Đăng nhập thất bại hoặc bị hủy.');
      }
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      setErrorMessage('Lỗi đăng nhập Google. Vui lòng thử lại!');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setErrorMessage(null);
      await logOut();
      console.log('🚪 Đã đăng xuất thành công!');
    } catch (error) {
      console.error('❌ Lỗi đăng xuất:', error);
      setErrorMessage('Lỗi đăng xuất. Vui lòng thử lại!');
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
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-9 h-9 rounded-full border border-gray-300 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="bg-green-400 text-black rounded-md p-1 text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
            {user.displayName || user.email || (user.isAnonymous ? 'Ẩn danh' : 'Người dùng')}
          </span>
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
        onClick={handleLogin}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full bg-white text-gray-800 hover:bg-gray-100 transition-colors shadow-lg"
      >
        <LogIn className="w-5 h-5 text-cyan-600" />
        <span className="font-bold">Đăng nhập Google</span>
      </button>
    );
  };

  // ==============================
  // 2. Đồng bộ tab với URL query
  // ==============================
  useEffect(() => {
    const tab = searchParams.get('tab') as 'home' | 'booking' | 'athlete' | 'match' | 'sport_equip' ;
    
    // Chỉ cập nhật state nếu giá trị trên URL khác với state hiện tại
    if (tab && activeTab !== tab) {
        setActiveTab(tab);
    } 
    // Nếu URL không có tab, nhưng state không phải là 'home', đặt lại state
    else if (!tab && activeTab !== 'home') {
        setActiveTab('home');
    }
  }, [searchParams]);

  // useEffect(() => {
  //   router.replace(`?tab=${activeTab}`);
  // }, [activeTab, router]);

  // ==============================
  // 3. Render
  // ==============================
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-amber-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-8xl flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 drop-shadow-md cursor-pointer"
            onClick={() => handleTabChange('home')}
        >
            🏓 Pickleball 
        </h1>
        {renderAuthStatus()}
      </div>

      {/* Tab Buttons */}
      <div className="flex space-x-3 mb-8">
        
        <button
          onClick={() => handleTabChange('home')}
          className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Trang chủ
        </button>

        <button
          onClick={() => handleTabChange('booking')}
          className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
            activeTab === 'booking'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Đặt sân
        </button>

        <button
          onClick={() => handleTabChange('athlete')}
          className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
            activeTab === 'athlete'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Bảng thi đấu
        </button>

        <button
          onClick={() => handleTabChange('match')}
          className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
            activeTab === 'match'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Giải đấu
        </button>
        <button
          onClick={() => handleTabChange('sport_equip')}
          className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
            activeTab === 'sport_equip'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
          }`}
        >
          Dụng cụ thể thao
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-full">
        {activeTab === 'home' && (
          <div className="p-6 text-center bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">Chào mừng đến Pickleball Club!</h2>
            <p>Đây là giao diện chính khi mở trang, bạn có thể chọn các tab để xem nội dung khác.</p>
          </div>
        )}
        {activeTab === 'booking' && <Booking/>}
        {activeTab === 'athlete' && <ListAthlete/>}
        {activeTab === 'match' && <ListMatch/>}
        {activeTab === 'sport_equip' && <SportEquip/>}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="mt-6 text-red-600 font-semibold bg-red-100 px-4 py-2 rounded-xl">
          ⚠️ {errorMessage}
        </p>
      )}
    </main>
  );
}
