import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LogIn, LogOut, CheckCircle, Plus, Trash2, Edit, Loader2, Users, User, Calendar, Table, Trophy } from 'lucide-react';

// --- I. FIREBASE SETUP & INITIALIZATION ---
// Chúng tôi phải định nghĩa các hàm và biến Firebase trong cùng một file để đảm bảo tính chạy được trong môi trường này.
import { initializeApp,  getApps, getApp, FirebaseApp, } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, addDoc, updateDoc, deleteDoc, collection, query, where, orderBy, setLogLevel } from 'firebase/firestore';
import { db, auth, getAppId, signInWithGoogle, logOut } from '../lib/firebase';


// ==============================
// 🔐 Tự động xác thực ban đầu
// ==============================
// setLogLevel("error");

// const tryAuth = async () => {
//   try {
//     if (typeof __initial_auth_token !== "undefined") {
//       await signInWithCustomToken(auth, __initial_auth_token);
//       console.log("Signed in with custom token");
//     } else {
//       await signInAnonymously(auth);
//       console.log("Signed in anonymously");
//     }
//   } catch (error) {
//     console.error("Initial authentication failed:", error);
//   }
// };

// tryAuth();

// Helper function để lấy path collection (Giả định private data)
const getCollectionPath = (collectionName: string, userId: string) => {
  return `${collectionName}_${userId}`;
};


// --- II. TYPESCRIPT INTERFACES ---

type TournamentCategory = "MenSingles" | "MenDoubles" | "WomenSingles" | "WomenDoubles" | "MixedDoubles";

// Bảng điểm/thống kê
interface TeamStats {
    name: string; // Tên VĐV 1 (Đơn) hoặc Tên Đội
    p2Name?: string; // Tên VĐV 2 (Đôi)
    wins: number; // T (Thắng)
    losses: number; // B (Bại)
    pointsFor: number; // PF (Điểm ghi được)
    pointsAgainst: number; // PA (Điểm bị thua)
    plusMinus: number; // +/- (PF - PA)
    isTeam: boolean;
}

// Lịch thi đấu
interface ScheduleMatch {
    id: string; // ID từ Firestore
    court: string; // Sân thi đấu
    time: string; // Thời gian
    teamA: string; // Tên VĐV/Đội A (VD: "Nam A & Nam B" hoặc "Nam A")
    teamB: string; // Tên VĐV/Đội B
    scoreA: number; // Tỉ số đội A (Tổng điểm/Game thắng)
    scoreB: number; // Tỉ số đội B (Tổng điểm/Game thắng)
    userId: string;
    category: TournamentCategory;
}

// --- III. CUSTOM HOOK FOR DATA MANAGEMENT ---

const useFirebaseData = (user: FirebaseUser | null, activeCategory: TournamentCategory) => {
    const [matches, setMatches] = useState<ScheduleMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) {
            setMatches([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const matchesCol = collection(db, getCollectionPath('scheduleMatches', user.uid));

        // Query: Lọc theo userId và Category, sắp xếp theo thời gian
        const q = query(
            matchesCol,
            where('userId', '==', user.uid),
            where('category', '==', activeCategory),
            orderBy('time', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const matchesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as ScheduleMatch));
            
            setMatches(matchesData);
            setLoading(false);
        }, (error) => {
            console.error("Lỗi khi fetch Matches:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, activeCategory]);

    return { matches, loading };
};


// --- IV. COMPONENT: STATS TABLE (BẢNG ĐIỂM SỐ) ---

interface StatsTableProps {
    matches: ScheduleMatch[];
    activeCategory: TournamentCategory;
}

const StatsTable: React.FC<StatsTableProps> = ({ matches, activeCategory }) => {
    
    // Hàm utility: Xác định TeamStats từ danh sách trận đấu
    const teamStats = useMemo(() => {
        const isDoubles = activeCategory.includes("Doubles") || activeCategory.includes("Mixed");
        const statsMap = new Map<string, TeamStats>(); // Key là tên VĐV/Đội
        
        const updateStats = (key: string, opponentScore: number, myScore: number, isWinner: boolean, p2Name?: string) => {
            let stats = statsMap.get(key) || { 
                name: key, 
                p2Name: p2Name,
                wins: 0, 
                losses: 0, 
                pointsFor: 0, 
                pointsAgainst: 0, 
                plusMinus: 0, 
                isTeam: isDoubles 
            };
            
            stats.wins += isWinner ? 1 : 0;
            stats.losses += isWinner ? 0 : 1;
            stats.pointsFor += myScore;
            stats.pointsAgainst += opponentScore;
            stats.plusMinus = stats.pointsFor - stats.pointsAgainst;
            
            statsMap.set(key, stats);
        };
        
        matches.forEach(m => {
            const teamAKey = m.teamA;
            const teamBKey = m.teamB;
            const scoreA = m.scoreA;
            const scoreB = m.scoreB;
            
            // Xử lý Team A
            updateStats(teamAKey, scoreB, scoreA, scoreA > scoreB);
            
            // Xử lý Team B
            updateStats(teamBKey, scoreA, scoreB, scoreB > scoreA);
        });
        
        // Chuyển Map thành Array và sắp xếp: Ưu tiên Thắng, sau đó là +/-
        const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins; // Sắp xếp giảm dần theo Thắng
            return b.plusMinus - a.plusMinus; // Sắp xếp giảm dần theo +/-
        });
        
        return sortedStats;
    }, [matches, activeCategory]);

    const isDoublesCategory = activeCategory.includes("Doubles") || activeCategory.includes("Mixed");

    return (
        <div className="overflow-x-auto shadow-xl rounded-xl bg-white p-4">
            <div className="flex items-center text-xl font-bold text-gray-800 mb-4">
                <Trophy className="w-6 h-6 mr-2 text-yellow-600" /> Bảng Thống Kê Điểm Số
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-cyan-50">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-xl">
                            {isDoublesCategory ? 'ĐỘI (VĐV 1 & VĐV 2)' : 'VẬN ĐỘNG VIÊN'}
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">T (Thắng)</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">B (Bại)</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">PF (Điểm Ghi)</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">PA (Điểm Thua)</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-xl">+/-</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {teamStats.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500 italic">
                                Chưa có dữ liệu điểm số nào trong thể loại này.
                            </td>
                        </tr>
                    ) : (
                        teamStats.map((stats, index) => (
                            <tr key={stats.name} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-100 transition-colors`}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {isDoublesCategory ? 
                                        <span className='font-bold text-cyan-700'>{stats.name}</span> : 
                                        stats.name
                                    }
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-green-600 font-bold">{stats.wins}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-red-600 font-bold">{stats.losses}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-700">{stats.pointsFor}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-700">{stats.pointsAgainst}</td>
                                <td className={`px-3 py-4 whitespace-nowrap text-center text-sm font-bold ${stats.plusMinus >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {stats.plusMinus > 0 ? `+${stats.plusMinus}` : stats.plusMinus}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- V. COMPONENT: SCHEDULE MANAGER (QUẢN LÝ LỊCH VÀ CRUD) ---

interface ScheduleManagerProps {
    user: FirebaseUser | null;
    activeCategory: TournamentCategory;
    matches: ScheduleMatch[];
    loadingMatches: boolean;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ user, activeCategory, matches, loadingMatches, setErrorMessage }) => {
    
    // State cho Form thêm mới
    const [newMatch, setNewMatch] = useState({
        court: "",
        time: "",
        teamA: "",
        teamB: "",
        scoreA: 0,
        scoreB: 0,
    });

    // State cho việc chỉnh sửa
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [editMatchData, setEditMatchData] = useState<Omit<ScheduleMatch, 'id' | 'userId' | 'category'>>({
        court: '', time: '', teamA: '', teamB: '', scoreA: 0, scoreB: 0
    });

    // Hàm CRUD - Add
    const addMatch = async () => {
        setErrorMessage(null);
        if (!user || !db) return setErrorMessage("Vui lòng đăng nhập để thêm lịch thi đấu!");
        const { court, time, teamA, teamB } = newMatch;
        if (!court.trim() || !time.trim() || !teamA.trim() || !teamB.trim()) {
            return setErrorMessage("Lịch thi đấu: Vui lòng nhập đầy đủ thông tin (Sân, Thời gian, Đội A, Đội B).");
        }

        try {
            const matchesCol = collection(db, getCollectionPath('scheduleMatches', user.uid));
            await addDoc(matchesCol, {
                ...newMatch,
                category: activeCategory,
                userId: user.uid,
                createdAt: new Date().toISOString(),
            });
            setNewMatch({ court: "", time: "", teamA: "", teamB: "", scoreA: 0, scoreB: 0 });
        } catch (e) {
            console.error("Lỗi khi thêm lịch thi đấu:", e);
            setErrorMessage("Lỗi: Không thể thêm lịch thi đấu vào Firestore.");
        }
    };
    
    // Hàm CRUD - Delete
    const deleteMatch = async (id: string) => {
        if (!user || !db) return;
        try {
            const matchDoc = doc(db, getCollectionPath('scheduleMatches', user.uid), id);
            await deleteDoc(matchDoc);
        } catch (e) {
            console.error("Lỗi khi xóa trận đấu:", e);
            setErrorMessage("Lỗi: Không thể xóa trận đấu.");
        }
    };

    // Hàm CRUD - Update (Save Edit)
    const saveEditMatch = async (id: string) => {
        setErrorMessage(null);
        if (!user || !db) return;
        const { court, time, teamA, teamB } = editMatchData;
        if (!court.trim() || !time.trim() || !teamA.trim() || !teamB.trim()) {
            return setErrorMessage("Chỉnh sửa: Vui lòng nhập đầy đủ thông tin trận đấu!");
        }
        try {
            const matchDoc = doc(db, getCollectionPath('scheduleMatches', user.uid), id);
            await updateDoc(matchDoc, {
                ...editMatchData,
                time: time.trim(),
                court: court.trim(),
                teamA: teamA.trim(),
                teamB: teamB.trim(),
            });
            setEditingMatchId(null);
        } catch (e) {
            console.error("Lỗi khi cập nhật trận đấu:", e);
            setErrorMessage("Lỗi: Không thể cập nhật trận đấu.");
        }
    };
    
    // Bắt đầu chỉnh sửa
    const startEdit = (match: ScheduleMatch) => {
        setEditingMatchId(match.id);
        setEditMatchData({
            court: match.court,
            time: match.time,
            teamA: match.teamA,
            teamB: match.teamB,
            scoreA: match.scoreA,
            scoreB: match.scoreB,
        });
    };

    const renderLoading = () => (
        <div className="flex justify-center items-center p-8 my-6">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <p className="ml-3 text-gray-700 font-medium">Đang tải lịch thi đấu...</p>
        </div>
    );

    // return (
    //     <div className="space-y-6">
    //         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
    //             <Calendar className="w-6 h-6 mr-2 text-indigo-600" /> Lên Lịch Trận Đấu
    //         </h2>
            
    //         {/* INPUT FORM */}
    //         <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
    //             <p className="text-sm text-gray-500 mb-3 italic">Thêm trận đấu mới cho thể loại: <span className='font-bold'>{activeCategory}</span></p>
    //             <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
    //                 <input
    //                     type="text"
    //                     placeholder="Sân (VD: Sân 1)"
    //                     value={newMatch.court}
    //                     onChange={(e) => setNewMatch({...newMatch, court: e.target.value})}
    //                     className="col-span-2 md:col-span-1 border-2 border-amber-300 p-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
    //                     disabled={loadingMatches}
    //                 />
    //                 <input
    //                     type="text"
    //                     placeholder="Thời gian (VD: 14:30 - 5/11)"
    //                     value={newMatch.time}
    //                     onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
    //                     className="col-span-3 md:col-span-1 border-2 border-amber-300 p-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
    //                     disabled={loadingMatches}
    //                 />
    //                 <input
    //                     type="text"
    //                     placeholder="Đội A (VD: Nam A & Nam B)"
    //                     value={newMatch.teamA}
    //                     onChange={(e) => setNewMatch({...newMatch, teamA: e.target.value})}
    //                     className="col-span-3 md:col-span-1 border-2 border-amber-300 p-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
    //                     disabled={loadingMatches}
    //                 />
    //                 <input
    //                     type="text"
    //                     placeholder="Đội B"
    //                     value={newMatch.teamB}
    //                     onChange={(e) => setNewMatch({...newMatch, teamB: e.target.value})}
    //                     className="col-span-3 md:col-span-1 border-2 border-amber-300 p-2 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
    //                     disabled={loadingMatches}
    //                 />
    //                 <button
    //                     onClick={addMatch}
    //                     className="col-span-2 md:col-span-1 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.01] shadow-md disabled:opacity-50 flex items-center justify-center"
    //                     disabled={loadingMatches}
    //                 >
    //                     <Plus className="w-5 h-5 inline mr-1" /> Lên Lịch
    //                 </button>
    //             </div>
    //             <p className='text-xs text-gray-400 mt-2'>*Để nhập tỉ số, vui lòng chỉnh sửa trận đấu sau khi thêm.</p>
    //         </div>
            
    //         {/* MATCH LIST / TABLE */}
    //         <div className="overflow-x-auto shadow-xl rounded-xl bg-white">
    //             {loadingMatches ? renderLoading() : (
    //                 <table className="min-w-full divide-y divide-gray-200">
    //                     <thead className="bg-amber-100">
    //                         <tr>
    //                             <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SÂN</th>
    //                             <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">THỜI GIAN</th>
    //                             <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-1/3">ĐỘI A</th>
    //                             <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-20">TỈ SỐ</th>
    //                             <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-1/3">ĐỘI B</th>
    //                             <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">HÀNH ĐỘNG</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody className="bg-white divide-y divide-gray-100">
    //                         {matches.length === 0 ? (
    //                             <tr>
    //                                 <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 italic">
    //                                     Chưa có lịch thi đấu nào cho thể loại này.
    //                                 </td>
    //                             </tr>
    //                         ) : (
    //                             matches.map((m) => {
    //                                 const isEditing = editingMatchId === m.id;
    //                                 return (
    //                                     <tr key={m.id} className="hover:bg-gray-50 transition-colors">
    //                                         {/* SÂN và THỜI GIAN */}
    //                                         <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
    //                                             {isEditing ? (
    //                                                 <input
    //                                                     type="text"
    //                                                     value={editMatchData.court}
    //                                                     onChange={(e) => setEditMatchData({...editMatchData, court: e.target.value})}
    //                                                     className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
    //                                                     placeholder="Sân"
    //                                                 />
    //                                             ) : m.court}
    //                                         </td>
    //                                         <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
    //                                             {isEditing ? (
    //                                                 <input
    //                                                     type="text"
    //                                                     value={editMatchData.time}
    //                                                     onChange={(e) => setEditMatchData({...editMatchData, time: e.target.value})}
    //                                                     className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
    //                                                     placeholder="Thời gian"
    //                                                 />
    //                                             ) : m.time}
    //                                         </td>
                                            
    //                                         {/* ĐỘI A */}
    //                                         <td className="px-3 py-3 text-sm font-semibold text-cyan-700">
    //                                             {isEditing ? (
    //                                                 <input
    //                                                     type="text"
    //                                                     value={editMatchData.teamA}
    //                                                     onChange={(e) => setEditMatchData({...editMatchData, teamA: e.target.value})}
    //                                                     className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
    //                                                     placeholder="Đội A"
    //                                                 />
    //                                             ) : m.teamA}
    //                                         </td>
                                            
    //                                         {/* TỈ SỐ */}
    //                                         <td className="px-3 py-3 text-center whitespace-nowrap text-lg font-extrabold">
    //                                             <div className='flex items-center justify-center space-x-1'>
    //                                                 {isEditing ? (
    //                                                     <>
    //                                                         <input
    //                                                             type="number"
    //                                                             value={editMatchData.scoreA}
    //                                                             onChange={(e) => setEditMatchData({...editMatchData, scoreA: parseInt(e.target.value) || 0})}
    //                                                             className="border border-gray-300 rounded-md px-1 py-1 text-base w-10 text-center"
    //                                                             min="0"
    //                                                         />
    //                                                         <span className='text-red-500'>-</span>
    //                                                         <input
    //                                                             type="number"
    //                                                             value={editMatchData.scoreB}
    //                                                             onChange={(e) => setEditMatchData({...editMatchData, scoreB: parseInt(e.target.value) || 0})}
    //                                                             className="border border-gray-300 rounded-md px-1 py-1 text-base w-10 text-center"
    //                                                             min="0"
    //                                                         />
    //                                                     </>
    //                                                 ) : (
    //                                                     <span className='text-indigo-600'>{m.scoreA} <span className='text-red-500'>-</span> {m.scoreB}</span>
    //                                                 )}
    //                                             </div>
    //                                         </td>

    //                                         {/* ĐỘI B */}
    //                                         <td className="px-3 py-3 text-sm font-semibold text-cyan-700">
    //                                             {isEditing ? (
    //                                                 <input
    //                                                     type="text"
    //                                                     value={editMatchData.teamB}
    //                                                     onChange={(e) => setEditMatchData({...editMatchData, teamB: e.target.value})}
    //                                                     className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full"
    //                                                     placeholder="Đội B"
    //                                                 />
    //                                             ) : m.teamB}
    //                                         </td>
                                            
    //                                         {/* HÀNH ĐỘNG */}
    //                                         <td className="px-3 py-3 whitespace-nowrap text-center">
    //                                             <div className="flex space-x-2 justify-center">
    //                                                 {isEditing ? (
    //                                                     <button
    //                                                         onClick={() => saveEditMatch(m.id)}
    //                                                         className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition"
    //                                                         aria-label="Lưu"
    //                                                     >
    //                                                         <CheckCircle className="w-5 h-5" />
    //                                                     </button>
    //                                                 ) : (
    //                                                     <button
    //                                                         onClick={() => startEdit(m)}
    //                                                         className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition disabled:opacity-50"
    //                                                         aria-label="Sửa"
    //                                                         disabled={editingMatchId !== null}
    //                                                     >
    //                                                         <Edit className="w-5 h-5" />
    //                                                     </button>
    //                                                 )}
    //                                                 <button
    //                                                     onClick={() => deleteMatch(m.id)}
    //                                                     className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition"
    //                                                     aria-label="Xóa"
    //                                                     disabled={editingMatchId !== null}
    //                                                 >
    //                                                     <Trash2 className="w-5 h-5" />
    //                                                 </button>
    //                                             </div>
    //                                         </td>
    //                                     </tr>
    //                                 );
    //                             })
    //                         )}
    //                     </tbody>
    //                 </table>
    //             )}
    //         </div>
    //     </div>
    // );
};


// --- VI. MAIN COMPONENT: TOURNAMENT MANAGER ---

export default function TournamentManager() {
    // 1. Auth State
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    
    // 2. Tournament State
    const [activeTab, setActiveTab] = useState<TournamentCategory>("MenSingles");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 3. Auth Listener (Tương tự code gốc của bạn)
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);
    
    // 4. Data Listener (Sử dụng custom hook)
    const { matches, loading: loadingMatches } = useFirebaseData(user, activeTab);


    // Utility Renders
    const renderAuthGuard = (message: string) => (
        <p className="p-6 text-center text-gray-700 bg-white/80 rounded-xl shadow-inner my-6">
            Xin mời <button onClick={signInWithGoogle} className="font-bold text-cyan-600 hover:text-cyan-800 underline">Đăng nhập bằng Google</button> để {message}.
        </p>
    );
    
    const categories: { key: TournamentCategory, label: string, icon: React.ReactNode }[] = [
        { key: "MenSingles", label: "Đơn Nam", icon: <User className='w-4 h-4' /> },
        { key: "MenDoubles", label: "Đôi Nam", icon: <Users className='w-4 h-4' /> },
        { key: "WomenSingles", label: "Đơn Nữ", icon: <User className='w-4 h-4' /> },
        { key: "WomenDoubles", label: "Đôi Nữ", icon: <Users className='w-4 h-4' /> },
        { key: "MixedDoubles", label: "Đôi Nam Nữ", icon: <Users className='w-4 h-4' /> },
    ];
    
    if (loadingAuth) return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="ml-3 text-gray-700 font-medium">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
    );


    return (
        <div className="mx-auto bg-gray-50 text-black p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-7xl min-h-screen">
            <header className='flex justify-between items-center mb-6 border-b pb-4'>
                <h1 className="text-3xl font-extrabold text-indigo-800 flex items-center">
                    <Trophy className="w-8 h-8 mr-2 text-yellow-500" /> QUẢN LÝ GIẢI ĐẤU PICKLEBALL
                </h1>
                
            </header>
            
            {errorMessage && (
                <div className="mt-1 mb-6 text-red-700 font-semibold bg-red-100 px-6 py-3 rounded-xl flex justify-between items-center border border-red-300">
                    <span>⚠️ {errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="ml-4 text-red-600 font-bold">✖</button>
                </div>
            )}

            {/* KHU VỰC CHUYỂN TAB (CATEGORIES) */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-2 border-b-2 border-gray-200">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveTab(cat.key)}
                            className={`flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-t-lg
                                ${activeTab === cat.key ? 
                                    'text-indigo-700 border-b-4 border-indigo-500 bg-indigo-50 shadow-inner' : 
                                    'text-gray-600 hover:text-indigo-500'
                                }
                            `}
                        >
                            {cat.icon} <span className="ml-2 whitespace-nowrap">{cat.label}</span>
                        </button>
                    ))}
                </div>
                <h2 className="text-xl mt-4 font-bold text-gray-700">Thể loại hiện tại: <span className='text-indigo-600'>{categories.find(c => c.key === activeTab)?.label}</span></h2>
            </div>


            {/* NỘI DUNG CHÍNH */}
            {!user ? renderAuthGuard("quản lý giải đấu và lưu dữ liệu") : (
                <div className='space-y-10'>
                    {/* BẢNG THỐNG KÊ ĐIỂM SỐ */}
                    <StatsTable matches={matches} activeCategory={activeTab} />

                    {/* LỊCH THI ĐẤU (INPUT + LIST) */}
                    <ScheduleManager 
                        user={user} 
                        activeCategory={activeTab} 
                        matches={matches} 
                        loadingMatches={loadingMatches} 
                        setErrorMessage={setErrorMessage} 
                    />
                </div>
            )}

        </div>
    );
}