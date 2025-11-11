import React from "react";
import { ArrowLeft } from "lucide-react";

export default function CourtPriceList({ onBack }) {
  return (
    <div className="min-h-screen bg-green-700 text-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 cursor-pointer">
          <ArrowLeft size={20} />
          <span>Trở lại</span>
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4 text-center">Bảng giá sân Pickleball</h2>

      <table className="w-full bg-white text-black rounded-lg overflow-hidden">
        <thead className="bg-green-200 font-semibold">
          <tr>
            <th className="border p-2 text-center">Thứ</th>
            <th className="border p-2 text-center">Khung giờ</th>
            <th className="border p-2 text-center">Cố định</th>
            <th className="border p-2 text-center">Vãng lai</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2 text-center" rowSpan="2">T2 - T6</td>
            <td className="border p-2 text-center">6h - 17h</td>
            <td className="border p-2 text-center">100.000 ₫</td>
            <td className="border p-2 text-center">130.000 ₫</td>
          </tr>
          <tr>
            <td className="border p-2 text-center">17h - 22h</td>
            <td className="border p-2 text-center">120.000 ₫</td>
            <td className="border p-2 text-center">150.000 ₫</td>
          </tr>
          <tr>
            <td className="border p-2 text-center">T7 - CN</td>
            <td className="border p-2 text-center">6h - 22h</td>
            <td className="border p-2 text-center">140.000 ₫</td>
            <td className="border p-2 text-center">140.000 ₫</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
