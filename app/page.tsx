"use client";

import { useState } from "react";
// Import auth và db chưa được sử dụng. Nếu bạn chưa dùng Firebase, code này vẫn chạy được.
// Nếu bạn đã import, nhưng không thấy lỗi, thì có thể code Firebase của bạn đã được tối ưu cho client.

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
	// Thêm state để quản lý thông báo lỗi
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
		setErrorMessage(null); // Reset lỗi
		if (!playerName || !playerScore) {
			// THAY THẾ alert() bằng việc set state lỗi
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
		setErrorMessage(null); // Reset lỗi
		if (!player1 || !player2 || !time) {
			// THAY THẾ alert() bằng việc set state lỗi
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
		<main className="min-h-screen bg-cyan-700 flex flex-col items-center p-8">
			<h1 className="text-3xl font-bold mb-6 text-white">⚽ Quản lý giải đấu</h1>
			
			{/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
			{errorMessage && (
				<div className="bg-red-500 text-white p-3 rounded-lg mb-4 shadow-xl">
					⚠️ {errorMessage}
				</div>
			)}

			{/* Nút chuyển mục */}
			<div className="flex space-x-4 mb-8">
				<button
					onClick={() => { setActiveTab("table"); setErrorMessage(null); }}
					className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
						activeTab === "table"
							? "bg-blue-600 text-white"
							: "bg-emerald-400 text-black border border-gray-300 hover:bg-emerald-300"
					}`}
				>
					🏆 Bảng thi đấu
				</button>

				<button
					onClick={() => { setActiveTab("schedule"); setErrorMessage(null); }}
					className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
						activeTab === "schedule"
							? "bg-blue-600 text-white"
							: "bg-emerald-400 border text-black border-gray-300 hover:bg-emerald-300"
					}`}
				>
					⏰ Lịch thi đấu
				</button>
			</div>

			{/* Hiển thị nội dung tương ứng */}
			{activeTab === "table" ? (
				<div className="bg-amber-200 text-black p-6 rounded-2xl shadow-xl w-full max-w-lg">
					<h2 className="text-xl font-semibold mb-4">🏅 Bảng thi đấu</h2>
					<div className="flex space-x-2 mb-4">
						<input
							type="text"
							placeholder="Tên vận động viên"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
							className="flex-1 border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
						/>
						<input
							type="number"
							placeholder="Điểm"
							value={playerScore}
							onChange={(e) => setPlayerScore(e.target.value)}
							className="w-24 border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
						/>
						<button
							onClick={addPlayer}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Thêm
						</button>
					</div>

					<table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
						<thead className="bg-gray-700 text-white">
							<tr>
								<th className="border p-2">STT</th>
								<th className="border p-2 text-left">Tên vận động viên</th>
								<th className="border p-2">Điểm</th>
							</tr>
						</thead>
						<tbody>
							{players.map((p) => (
								<tr key={p.id} className="text-center even:bg-white odd:bg-gray-50">
									<td className="border p-2">{p.id}</td>
									<td className="border p-2 text-left font-medium">{p.name}</td>
									<td className="border p-2 font-bold">{p.score}</td>
								</tr>
							))}
						</tbody>
					</table>
					{players.length === 0 && <p className="text-center text-gray-500 mt-4">Chưa có vận động viên nào.</p>}
				</div>
			) : (
				<div className="bg-amber-200 text-black p-6 rounded-2xl shadow-xl w-full max-w-lg">
					<h2 className="text-xl font-semibold mb-4">📅 Lịch thi đấu</h2>
					<div className="flex flex-col space-y-2 mb-4">
						<input
							type="text"
							placeholder="Vận động viên 1"
							value={player1}
							onChange={(e) => setPlayer1(e.target.value)}
							className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
						/>
						<input
							type="text"
							placeholder="Vận động viên 2"
							value={player2}
							onChange={(e) => setPlayer2(e.target.value)}
							className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
						/>
						<input
							type="text"
							placeholder="Thời gian (VD: 14:30 - 5/11/2025)"
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className="border p-2 rounded focus:ring-blue-500 focus:border-blue-500"
						/>
						<button
							onClick={addMatch}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Thêm lịch
						</button>
					</div>

					<ul className="space-y-3">
						{matches.map((m) => (
							<li
								key={m.id}
								className="border border-gray-300 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
							>
								<p className="font-medium text-lg">
									{m.player1} 🆚 {m.player2}
								</p>
								<p className="text-sm text-gray-600 font-mono">🕒 {m.time}</p>
							</li>
						))}
					</ul>
					{matches.length === 0 && <p className="text-center text-gray-500 mt-4">Chưa có trận đấu nào trong lịch.</p>}
				</div>
			)}
		</main>
	);
}
