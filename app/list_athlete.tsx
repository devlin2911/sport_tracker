'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CheckCircle, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { User, onAuthStateChanged, signInWithPopup  } from 'firebase/auth';
import { db, auth, getAppId, signInWithGoogle, logOut } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';

// Player/Athlete
interface Player {
    id: string; // ID từ Firestore (string)
    name: string;
    score: number;
    userId: string; // Để lọc dữ liệu theo người dùng
}

export default function ListAthlete() {

    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const [activeTab, setActiveTab] = useState<"athlete" | "match">("athlete");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [players, setPlayers] = useState<Player[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [playerScore, setPlayerScore] = useState<number | "">("");
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
    const [editPlayerName, setEditPlayerName] = useState('');
    const [editPlayerScore, setEditPlayerScore] = useState<number | ''>('');


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
        <div className=" mx-auto bg-amber-100 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-4xl">

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
                <span className="mr-2 text-3xl">🏅</span> Quản lý Vận động viên
            </h2>

            {!user ? (
                renderAuthGuard("thêm và quản lý vận động viên")
            ) : (
                <>
                {/* Input khu vực thêm vận động viên */}
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


                {loadingPlayers ? (
                    renderLoading()
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">STT</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên VĐV</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Điểm</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Hành động</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {players.map((p, index) => (
                            <tr key={p.id} className="text-center hover:bg-amber-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-left text-sm text-gray-700">
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
                            <td className="px-4 py-3 text-sm font-bold text-blue-600">
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
                            <td className="px-4 py-3 text-center text-sm space-x-2">
                                {editingPlayerId === p.id ? (
                                <button
                                    onClick={() => saveEditPlayer(p.id)}
                                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
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
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 disabled:opacity-50"
                                    disabled={editingPlayerId !== null}
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                )}
                                <button
                                onClick={() => deletePlayer(p.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
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

                {players.length === 0 && !loadingPlayers && (
                    <p className="text-center text-gray-500 mt-4 italic">
                    Chưa có vận động viên nào được đăng ký.
                    </p>
                )}
                </>
                
            )}

        </div>
    )
}

