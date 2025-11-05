'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { LogIn, LogOut, CheckCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
// ĐÃ SỬA LỖI: Chuyển từ alias '@/lib/firebase' sang đường dẫn tương đối để đảm bảo biên dịch.
import { db, auth, getAppId, signInWithGoogle, handleLogout, logOut } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth'; 

// --- Interfaces (Cập nhật để khớp với Firestore) ---

// Player/Athlete
interface Player {
    id: string; // ID từ Firestore (string)
    name: string;
    score: number;
    userId: string; // Để lọc dữ liệu theo người dùng
}

// Match/Schedule
interface Match {
    id: string; // ID từ Firestore (string)
    player1: string;
    player2: string;
    time: string;
    userId: string;
}

// --- Main Component ---

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [activeTab, setActiveTab] = useState<"table" | "schedule">("table");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Dữ liệu cho bảng thi đấu (Real-time từ Firestore)
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [playerScore, setPlayerScore] = useState<number | "">("");
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    // Dữ liệu cho lịch thi đấu (Real-time từ Firestore)
    const [matches, setMatches] = useState<Match[]>([]);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [time, setTime] = useState("");
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // State chỉnh sửa
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editPlayerName, setEditPlayerName] = useState('');
    const [editPlayerScore, setEditPlayerScore] = useState<number | ''>('');

    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [editPlayer1, setEditPlayer1] = useState('');
    const [editPlayer2, setEditPlayer2] = useState('');
    const [editTime, setEditTime] = useState('');


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

    const handleLogin = useCallback(async () => {
        setErrorMessage(null);
        await signInWithGoogle();
    }, []);

    const handleLogout = useCallback(async () => {
        setErrorMessage(null);
        await logOut();
        // Xóa các state dữ liệu khi đăng xuất
        setPlayers([]);
        setMatches([]);
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

    // Lắng nghe dữ liệu Players
    useEffect(() => {
        if (!user) {
            setPlayers([]);
            return;
        }

        setLoadingPlayers(true);
        const playersCol = collection(db, getCollectionPath('players'));

        // Query: Lọc theo userId và sắp xếp theo score
        const q = query(
            playersCol,
            where('userId', '==', user.uid),
            orderBy('score', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const playersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Player));
            
            setPlayers(playersData);
            setLoadingPlayers(false);
        }, (error) => {
            console.error("Lỗi khi fetch Players:", error);
            setLoadingPlayers(false);
            setErrorMessage("Lỗi: Không thể tải danh sách vận động viên.");
        });

        // Dependencies: [user] - chỉ chạy lại khi trạng thái user thay đổi
        return () => unsubscribe();
    }, [user]);

    // Lắng nghe dữ liệu Matches
    useEffect(() => {
        if (!user) {
            setMatches([]);
            return;
        }

        setLoadingMatches(true);
        const matchesCol = collection(db, getCollectionPath('matches'));

        // Query: Lọc theo userId và sắp xếp theo time
        const q = query(
            matchesCol,
            where('userId', '==', user.uid),
            orderBy('time', 'asc') // Sắp xếp theo thời gian (giả định time là string có thể sắp xếp)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const matchesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Match));
            
            setMatches(matchesData);
            setLoadingMatches(false);
        }, (error) => {
            console.error("Lỗi khi fetch Matches:", error);
            setLoadingMatches(false);
            setErrorMessage("Lỗi: Không thể tải lịch thi đấu.");
        });

        // Dependencies: [user] - chỉ chạy lại khi trạng thái user thay đổi
        return () => unsubscribe();
    }, [user]);

    // =================================================================
    // 3. Logic Data Modification (CRUD)
    // =================================================================

    const addPlayer = async () => {
        setErrorMessage(null);
        if (!user) return setErrorMessage("Vui lòng đăng nhập để thêm vận động viên!");
        if (!playerName.trim() || playerScore === '') {
            return setErrorMessage("Bảng thi đấu: Vui lòng nhập đầy đủ Tên và Điểm!");
        }

        try {
            const playersCol = collection(db, getCollectionPath('players'));
            await addDoc(playersCol, {
                name: playerName.trim(),
                score: Number(playerScore),
                userId: user.uid,
                createdAt: new Date().toISOString(),
            });
            setPlayerName("");
            setPlayerScore("");
        } catch (e) {
            console.error("Lỗi khi thêm vận động viên:", e);
            setErrorMessage("Lỗi: Không thể thêm vận động viên vào Firestore.");
        }
    };

    const deletePlayer = async (id: string) => {
        if (!user) return;
        try {
            const playerDoc = doc(db, getCollectionPath('players'), id);
            await deleteDoc(playerDoc);
        } catch (e) {
            console.error("Lỗi khi xóa vận động viên:", e);
            setErrorMessage("Lỗi: Không thể xóa vận động viên.");
        }
    };

    const saveEditPlayer = async (id: string) => {
        setErrorMessage(null);
        if (!user) return;
        if (!editPlayerName.trim() || editPlayerScore === '') {
            return setErrorMessage("Chỉnh sửa: Vui lòng nhập đầy đủ Tên và Điểm!");
        }
        try {
            const playerDoc = doc(db, getCollectionPath('players'), id);
            await updateDoc(playerDoc, {
                name: editPlayerName.trim(),
                score: Number(editPlayerScore),
            });
            setEditingPlayerId(null);
        } catch (e) {
            console.error("Lỗi khi cập nhật vận động viên:", e);
            setErrorMessage("Lỗi: Không thể cập nhật vận động viên.");
        }
    };


    const addMatch = async () => {
        setErrorMessage(null);
        if (!user) return setErrorMessage("Vui lòng đăng nhập để thêm lịch thi đấu!");
        if (!player1.trim() || !player2.trim() || !time.trim()) {
            return setErrorMessage("Lịch thi đấu: Vui lòng nhập đầy đủ thông tin trận đấu!");
        }

        try {
            const matchesCol = collection(db, getCollectionPath('matches'));
            await addDoc(matchesCol, {
                player1: player1.trim(),
                player2: player2.trim(),
                time: time.trim(),
                userId: user.uid,
                createdAt: new Date().toISOString(),
            });
            setPlayer1("");
            setPlayer2("");
            setTime("");
        } catch (e) {
            console.error("Lỗi khi thêm lịch thi đấu:", e);
            setErrorMessage("Lỗi: Không thể thêm lịch thi đấu vào Firestore.");
        }
    };
    
    const deleteMatch = async (id: string) => {
        if (!user) return;
        try {
            const matchDoc = doc(db, getCollectionPath('matches'), id);
            await deleteDoc(matchDoc);
        } catch (e) {
            console.error("Lỗi khi xóa trận đấu:", e);
            setErrorMessage("Lỗi: Không thể xóa trận đấu.");
        }
    };

    const saveEditMatch = async (id: string) => {
        setErrorMessage(null);
        if (!user) return;
        if (!editPlayer1.trim() || !editPlayer2.trim() || !editTime.trim()) {
            return setErrorMessage("Chỉnh sửa: Vui lòng nhập đầy đủ thông tin trận đấu!");
        }
        try {
            const matchDoc = doc(db, getCollectionPath('matches'), id);
            await updateDoc(matchDoc, {
                player1: editPlayer1.trim(),
                player2: editPlayer2.trim(),
                time: editTime.trim(),
            });
            setEditingMatchId(null);
        } catch (e) {
            console.error("Lỗi khi cập nhật trận đấu:", e);
            setErrorMessage("Lỗi: Không thể cập nhật trận đấu.");
        }
    };


    // =================================================================
    // 4. Render UI Components
    // =================================================================
    
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
                    <span className="text-white text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
                        {/* user.displayName/user.email có thể null/undefined nếu user mới */}
                        {user.displayName || user.email || (user.isAnonymous ? 'Ẩn danh' : 'Người dùng')}
                    </span>
                    <button
                        // Gọi handleLogout đã import
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

    // --- RENDER MAIN ---

    return (
        <main className="min-h-screen bg-cyan-700 flex flex-col items-center p-4 sm:p-8 font-inter">
            
            <header className="w-full max-w-4xl flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    ⚽ Quản lý Giải đấu
                </h1>
                {renderAuthStatus()}
            </header>

            {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
            {errorMessage && (
                <div 
                    onClick={() => setErrorMessage(null)}
                    className="bg-red-500 text-white p-3 rounded-xl mb-4 shadow-xl w-full max-w-lg cursor-pointer flex justify-between items-center"
                >
                    <span className="font-medium">⚠️ {errorMessage}</span>
                    <span className="text-sm opacity-70">X</span>
                </div>
            )}

            {/* Nút chuyển mục */}
            <div className="flex space-x-2 sm:space-x-4 mb-6 w-full max-w-lg">
                <button
                    onClick={() => { setActiveTab("table"); setErrorMessage(null); }}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md ${
                        activeTab === "table"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 border-b-4 border-blue-700"
                            : "bg-emerald-400 text-black hover:bg-emerald-300 border-b-2 border-emerald-500"
                    }`}
                >
                    🏆 Bảng thi đấu
                </button>

                <button
                    onClick={() => { setActiveTab("schedule"); setErrorMessage(null); }}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md ${
                        activeTab === "schedule"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 border-b-4 border-blue-700"
                            : "bg-emerald-400 text-black hover:bg-emerald-300 border-b-2 border-emerald-500"
                    }`}
                >
                    ⏰ Lịch thi đấu
                </button>
            </div>

            {/* Hiển thị nội dung tương ứng */}
            {activeTab === "table" ? (
                // TABLE TAB
                <div className="bg-amber-100 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-4xl">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="mr-2 text-3xl">🏅</span> Quản lý Vận động viên
                    </h2>

                    {!user ? renderAuthGuard("thêm và quản lý vận động viên") : (
                        <>
                            {/* KHU VỰC INPUT (RESPONSIVE) */}
                            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-6">
                                <input
                                    type="text"
                                    placeholder="Tên vận động viên"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    className="flex-1 border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-shadow"
                                    disabled={loadingPlayers}
                                />
                                <input
                                    type="number"
                                    placeholder="Điểm"
                                    value={playerScore}
                                    onChange={(e) => setPlayerScore(Number(e.target.value))}
                                    className="w-full sm:w-28 border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-shadow text-right"
                                    disabled={loadingPlayers}
                                />
                                <button
                                    onClick={addPlayer}
                                    className="bg-green-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-50"
                                    disabled={loadingPlayers}
                                >
                                    <Plus className="w-5 h-5 inline mr-1" /> Thêm
                                </button>
                            </div>

                            {loadingPlayers ? renderLoading() : (
                                // BẢNG (Kèm cuộn ngang cho mobile)
                                <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-700 text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">STT</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên Vận động viên</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Điểm</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {players.map((p, index) => (
                                                <tr key={p.id} className="text-center hover:bg-amber-50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-left font-medium text-gray-700">
                                                        {editingPlayerId === p.id ? (
                                                            <input
                                                                type="text"
                                                                value={editPlayerName}
                                                                onChange={(e) => setEditPlayerName(e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        ) : (
                                                            p.name
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">
                                                        {editingPlayerId === p.id ? (
                                                            <input
                                                                type="number"
                                                                value={editPlayerScore}
                                                                onChange={(e) => setEditPlayerScore(Number(e.target.value))}
                                                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-right focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        ) : (
                                                            p.score
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                                        {editingPlayerId === p.id ? (
                                                            <button
                                                                onClick={() => saveEditPlayer(p.id)}
                                                                className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-100"
                                                                aria-label="Lưu"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingPlayerId(p.id);
                                                                    setEditPlayerName(p.name);
                                                                    setEditPlayerScore(p.score);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100 disabled:opacity-50"
                                                                aria-label="Sửa"
                                                                disabled={editingPlayerId !== null}
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deletePlayer(p.id)}
                                                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                                                            aria-label="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {players.length === 0 && !loadingPlayers && <p className="text-center text-gray-500 mt-4 italic">Chưa có vận động viên nào được đăng kí.</p>}
                        </>
                    )}
                </div>
            ) : (
                // SCHEDULE TAB
                <div className="bg-amber-100 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-4xl">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <span className="mr-2 text-3xl">📅</span> Lên Lịch thi đấu
                    </h2>
                    
                    {!user ? renderAuthGuard("thêm và quản lý lịch thi đấu") : (
                        <>
                            {/* KHU VỰC INPUT LỊCH (RESPONSIVE) */}
                            <div className="flex flex-col space-y-3 mb-6">
                                <input
                                    type="text"
                                    placeholder="Vận động viên 1"
                                    value={player1}
                                    onChange={(e) => setPlayer1(e.target.value)}
                                    className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                                    disabled={loadingMatches}
                                />
                                <input
                                    type="text"
                                    placeholder="Vận động viên 2"
                                    value={player2}
                                    onChange={(e) => setPlayer2(e.target.value)}
                                    className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                                    disabled={loadingMatches}
                                />
                                <input
                                    type="text"
                                    placeholder="Thời gian (VD: 14:30 - 5/11/2025)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                                    disabled={loadingMatches}
                                />
                                <button
                                    onClick={addMatch}
                                    className="bg-green-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-50"
                                    disabled={loadingMatches}
                                >
                                    <Plus className="w-5 h-5 inline mr-1" /> Lên lịch trận đấu
                                </button>
                            </div>

                            {loadingMatches ? renderLoading() : (
                                // DANH SÁCH LỊCH THI ĐẤU
                                <ul className="space-y-3">
                                    {matches.map((m) => (
                                        <li
                                            key={m.id}
                                            className="border border-amber-300 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                                        >
                                            {editingMatchId === m.id ? (
                                                <div className="w-full flex flex-col space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editPlayer1}
                                                        onChange={(e) => setEditPlayer1(e.target.value)}
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                                                        placeholder="VĐV 1"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editPlayer2}
                                                        onChange={(e) => setEditPlayer2(e.target.value)}
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                                                        placeholder="VĐV 2"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editTime}
                                                        onChange={(e) => setEditTime(e.target.value)}
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                                                        placeholder="Thời gian"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mb-1 sm:mb-0 flex-1">
                                                    <p className="font-bold text-xl text-gray-800">
                                                        {m.player1} <span className="text-red-500 mx-1">🆚</span> {m.player2}
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-300 inline-block mt-1">
                                                        🕒 {m.time}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex space-x-2 mt-2 sm:mt-0">
                                                {editingMatchId === m.id ? (
                                                    <button
                                                        onClick={() => saveEditMatch(m.id)}
                                                        className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-100"
                                                        aria-label="Lưu"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingMatchId(m.id);
                                                            setEditPlayer1(m.player1);
                                                            setEditPlayer2(m.player2);
                                                            setEditTime(m.time);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-100 disabled:opacity-50"
                                                        aria-label="Sửa"
                                                        disabled={editingMatchId !== null}
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteMatch(m.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                                                    aria-label="Xóa"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {matches.length === 0 && !loadingMatches && <p className="text-center text-gray-500 mt-4 italic">Chưa có trận đấu nào trong lịch.</p>}
                        </>
                    )}
                </div>
            )}

            {user && (
                <div className="mt-8 p-3 bg-cyan-900/50 text-white text-xs rounded-lg shadow-inner max-w-lg w-full text-center break-words">
                    User ID: <span className="font-mono text-amber-300">{user.uid}</span>
                </div>
            )}
        </main>
    );
}