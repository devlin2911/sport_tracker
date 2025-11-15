"use client";

import { Plus } from "lucide-react";


export default function CourtManager() {
return (
    <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Quản lý đặt sân</h2>


        <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <h3 className="font-semibold mb-2">Tạo lịch đặt sân</h3>
            <div className="grid grid-cols-3 gap-4">
                <input className="p-2 border rounded" placeholder="Tên khách" />
                <input className="p-2 border rounded" type="datetime-local" />
                <select className="p-2 border rounded">
                <option>Sân 1</option>
                <option>Sân 2</option>
                </select>
            </div>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Tạo lịch
            </button>
        </div>


        <div className="space-y-3">
            <div className="p-4 border rounded-xl">Lịch mẫu...</div>
        </div>
    </div>
);
}