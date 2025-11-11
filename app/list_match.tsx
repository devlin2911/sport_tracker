'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { User, onAuthStateChanged, signInWithPopup  } from 'firebase/auth';
import { db, auth, getAppId, signInWithGoogle, logOut } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';

// Match/Schedule
    interface Match {
        id: string; // ID từ Firestore (string)
        player1: string;
        player2: string;
        time: string;
        userId: string;
    }

export default function ListMatch() {
    
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [activeTab, setActiveTab] = useState<"table" | "schedule">("table");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Dữ liệu cho lịch thi đấu (Real-time từ Firestore)
    const [matches, setMatches] = useState<Match[]>([]);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [time, setTime] = useState("");
    const [loadingMatches, setLoadingMatches] = useState(false);

    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [editPlayer1, setEditPlayer1] = useState('');
    const [editPlayer2, setEditPlayer2] = useState('');
    const [editTime, setEditTime] = useState('');

    // Theo dõi trạng thái đăng nhập
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);  

    // Hàm utility để lấy path collection (Giả định private data)
    const getCollectionPath = (collectionName: string) => {
        const appId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';
        const userId = user?.uid || 'anonymous';
        return `artifacts/${appId}/users/${userId}/${collectionName}`;
    }

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

    // 3. Logic Data Modification (CRUD)
    // =================================================================
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
        <div className="bg-amber-100 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-4xl">

            {errorMessage && (
                <div className="mt-1 mb-3 text-red-600 font-semibold bg-red-100 px-4 py-2 rounded-xl flex justify-between items-center">
                    <span>⚠️ {errorMessage}</span>
                    <button
                    onClick={() => setErrorMessage(null)}
                    className="ml-4 text-red-600 font-bold"
                    >
                    ✖
                    </button>
                </div>
            )}

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
    )
}