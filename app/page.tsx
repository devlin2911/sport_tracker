"use client";

import { useState } from "react";
// Import auth và db (giả định bạn sẽ sử dụng sau)
// Đây là Client Component nên việc import này là hợp lệ.
import { db, auth } from "@/lib/firebase";

interface Player {
    id: number;
    name: string;
    score: number;
}

interface Match {
    id: number;
    player1: string;
    player2: string;
    time: string;
}

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<"table" | "schedule">("table");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Dữ liệu cho bảng thi đấu
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerName, setPlayerName] = useState("");
    const [playerScore, setPlayerScore] = useState("");

    // Dữ liệu cho lịch thi đấu
    const [matches, setMatches] = useState<Match[]>([]);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [time, setTime] = useState("");

    const addPlayer = () => {
        setErrorMessage(null);
        if (!playerName || !playerScore) {
            return setErrorMessage("Bảng thi đấu: Vui lòng nhập đầy đủ Tên và Điểm!");
        }
        const newPlayer: Player = {
            id: players.length + 1,
            name: playerName,
            score: parseInt(playerScore),
        };
        setPlayers([...players, newPlayer]);
        setPlayerName("");
        setPlayerScore("");
    };

    const addMatch = () => {
        setErrorMessage(null);
        if (!player1 || !player2 || !time) {
            return setErrorMessage("Lịch thi đấu: Vui lòng nhập đầy đủ thông tin trận đấu!");
        }
        const newMatch: Match = {
            id: matches.length + 1,
            player1,
            player2,
            time,
        };
        setMatches([...matches, newMatch]);
        setPlayer1("");
        setPlayer2("");
        setTime("");
    };

    return (
        <main className="min-h-screen bg-cyan-700 flex flex-col items-center p-4 sm:p-8">
            <h1 className="text-3xl font-extrabold mb-6 text-white text-center">
                ⚽ Quản lý Giải đấu
            </h1>
            
            {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
            {errorMessage && (
                <div className="bg-red-500 text-white p-3 rounded-xl mb-4 shadow-xl w-full max-w-sm sm:max-w-md">
                    ⚠️ {errorMessage}
                </div>
            )}

            {/* Nút chuyển mục */}
            <div className="flex space-x-2 sm:space-x-4 mb-6">
                <button
                    onClick={() => { setActiveTab("table"); setErrorMessage(null); }}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 ${
                        activeTab === "table"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                            : "bg-emerald-400 text-black border border-gray-300 hover:bg-emerald-300"
                    }`}
                >
                    🏆 Bảng thi đấu
                </button>

                <button
                    onClick={() => { setActiveTab("schedule"); setErrorMessage(null); }}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 ${
                        activeTab === "schedule"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                            : "bg-emerald-400 border text-black border-gray-300 hover:bg-emerald-300"
                    }`}
                >
                    ⏰ Lịch thi đấu
                </button>
            </div>

            {/* Hiển thị nội dung tương ứng */}
            {activeTab === "table" ? (
                // TABLE TAB
                <div className="bg-amber-200 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-2xl">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        🏅 Quản lý Vận động viên
                    </h2>
                    
                    {/* KHU VỰC INPUT (RESPONSIVE) */}
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-6">
                        <input
                            type="text"
                            placeholder="Tên vận động viên"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="flex-1 border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-shadow"
                        />
                        <input
                            type="number"
                            placeholder="Điểm"
                            value={playerScore}
                            onChange={(e) => setPlayerScore(e.target.value)}
                            // Tăng chiều rộng trên mobile (w-28)
                            className="w-full sm:w-28 border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner transition-shadow"
                        />
                        <button
                            onClick={addPlayer}
                            className="bg-green-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-md"
                        >
                            ➕ Thêm
                        </button>
                    </div>

                    {/* BẢNG (Kèm cuộn ngang cho mobile) */}
                    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-700 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên Vận động viên</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Điểm</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {players.map((p) => (
                                    <tr key={p.id} className="text-center hover:bg-amber-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-left font-medium text-gray-700">{p.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {players.length === 0 && <p className="text-center text-gray-500 mt-4 italic">Chưa có vận động viên nào được đăng kí.</p>}
                </div>
            ) : (
                // SCHEDULE TAB
                <div className="bg-amber-200 text-black p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-lg md:max-w-2xl">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        📅 Lên Lịch thi đấu
                    </h2>
                    
                    {/* KHU VỰC INPUT LỊCH (RESPONSIVE) */}
                    <div className="flex flex-col space-y-3 mb-6">
                        <input
                            type="text"
                            placeholder="Vận động viên 1"
                            value={player1}
                            onChange={(e) => setPlayer1(e.target.value)}
                            className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        />
                        <input
                            type="text"
                            placeholder="Vận động viên 2"
                            value={player2}
                            onChange={(e) => setPlayer2(e.target.value)}
                            className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        />
                        <input
                            type="text"
                            placeholder="Thời gian (VD: 14:30 - 5/11/2025)"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="border-2 border-amber-300 p-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                        />
                        <button
                            onClick={addMatch}
                            className="bg-green-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-md"
                        >
                            🗓️ Lên lịch trận đấu
                        </button>
                    </div>

                    {/* DANH SÁCH LỊCH THI ĐẤU */}
                    <ul className="space-y-3">
                        {matches.map((m) => (
                            <li
                                key={m.id}
                                className="border border-amber-300 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                            >
                                <div className="mb-1 sm:mb-0">
                                    <p className="font-bold text-xl text-gray-800">
                                        {m.player1} <span className="text-red-500 mx-1">🆚</span> {m.player2}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                                    🕒 {m.time}
                                </p>
                            </li>
                        ))}
                    </ul>
                    {matches.length === 0 && <p className="text-center text-gray-500 mt-4 italic">Chưa có trận đấu nào trong lịch.</p>}
                </div>
            )}
        </main>
    );
}