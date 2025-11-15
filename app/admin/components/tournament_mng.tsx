"use client";

import { Plus } from "lucide-react";


export default function TournamentManager() {
return (
<div className="p-4 bg-white rounded-xl shadow">
<h2 className="text-xl font-bold mb-4">Quản lý giải đấu</h2>


<div className="bg-gray-50 p-4 rounded-xl mb-4">
<h3 className="font-semibold mb-2">Thêm bảng đấu</h3>
<input className="p-2 border rounded w-full" placeholder="Tên bảng" />
<button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center">
<Plus className="w-4 h-4 mr-2" /> Thêm bảng
</button>
</div>


<div className="bg-gray-50 p-4 rounded-xl mb-4">
<h3 className="font-semibold mb-2">Thêm vận động viên</h3>
<div className="grid grid-cols-2 gap-4">
<input className="p-2 border rounded" placeholder="Tên VĐV" />
<select className="p-2 border rounded">
<option>Bảng A</option>
</select>
</div>
<button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center">
<Plus className="w-4 h-4 mr-2" /> Thêm VĐV
</button>
</div>


<div className="bg-gray-50 p-4 rounded-xl">
<h3 className="font-semibold mb-2">Thêm lịch thi đấu</h3>
<div className="grid grid-cols-3 gap-4">
<select className="p-2 border rounded"><option>Người 1</option></select>
<select className="p-2 border rounded"><option>Người 2</option></select>
<input className="p-2 border rounded" type="datetime-local" />
</div>
<button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center">
<Plus className="w-4 h-4 mr-2" /> Thêm lịch đấu
</button>
</div>
</div>
);
}