'use client';

import React from "react";
import { ArrowLeft, Clock, Calendar, DollarSign, Tag, Zap, Sun } from "lucide-react";

interface CourtPriceListProps {
    onBack: () => void; // onBack là một hàm không nhận đối số và không trả về gì
}

export default function CourtPriceList({ onBack }: CourtPriceListProps) {
    const priceData = [
        { period: "Giờ Cao Điểm (T2-T6)", time: "18:00 - 21:00", rate: "200.000 VNĐ/giờ", icon: Zap, color: "bg-red-100 text-red-700" },
        { period: "Ngày Thường (T2-T6)", time: "6:00 - 18:00 & 21:00 - 22:00", rate: "150.000 VNĐ/giờ", icon: Clock, color: "bg-blue-100 text-blue-700" },
        { period: "Cuối Tuần (T7 & CN)", time: "Cả Ngày", rate: "180.000 VNĐ/giờ", icon: Sun, color: "bg-yellow-100 text-yellow-700" },
        { period: "Thuê Dài Hạn", time: "Từ 3 tháng trở lên", rate: "Giảm 15% tổng hóa đơn", icon: Tag, color: "bg-green-100 text-green-700" },
    ];

    return (
        <div className="p-6 md:p-10 min-h-[500px] flex flex-col font-inter">
            {/* Header */}
            <div className="mb-8 border-b pb-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-gray-900 
                                font-semibold transition duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại Màn hình Đặt Sân
                </button>
                <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800">
                    Bảng Giá Thuê Sân
                </h2>
                <div className="w-1/4"></div> {/* Placeholder cho căn chỉnh */}
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {priceData.map((item, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-2xl shadow-xl border-t-4 border-b-4 ${item.color} flex flex-col justify-between transform hover:scale-[1.02] transition duration-300`}
                    >
                        <div className="flex items-center mb-4">
                            <item.icon className={`w-6 h-6 mr-3 ${item.color.replace(/bg-.*-100/, '').replace(/text-/, 'text-')} font-bold`} />
                            <h3 className="text-lg font-bold">
                                {item.period}
                            </h3>
                        </div>
                        <p className="text-sm mb-2 opacity-80 flex items-center">
                             <Clock className="w-4 h-4 mr-2 opacity-60" /> {item.time}
                        </p>
                        <p className="text-xl font-extrabold flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" /> {item.rate}
                        </p>
                    </div>
                ))}
            </div>

            {/* Detailed Table (Responsive) */}
            <div className="flex-grow overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                    <thead>
                        <tr className="bg-sky-500 text-white text-left text-sm uppercase tracking-wider">
                            <th className="p-4 rounded-tl-xl w-1/4">Phân Loại</th>
                            <th className="p-4 w-1/4">Khung Giờ</th>
                            <th className="p-4 w-1/4">Giá/Giờ</th>
                            <th className="p-4 rounded-tr-xl w-1/4">Ghi Chú</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b hover:bg-gray-50">
                            <td className="p-4 font-semibold">Giờ Cao Điểm</td>
                            <td className="p-4">18:00 - 21:00 (T2-T6)</td>
                            <td className="p-4 text-red-600 font-bold">200.000 VNĐ</td>
                            <td className="p-4">Giá cố định, áp dụng cả 3 sân (Sân 1, 2, 3)</td>
                        </tr>
                        <tr className="border-b bg-green-50 hover:bg-green-100">
                            <td className="p-4 font-semibold">Giờ Thường (Ngày)</td>
                            <td className="p-4">6:00 - 18:00 (T2-T6)</td>
                            <td className="p-4 text-blue-600 font-bold">150.000 VNĐ</td>
                            <td className="p-4">Giá thấp hơn để khuyến khích chơi ban ngày.</td>
                        </tr>
                         <tr className="border-b hover:bg-gray-50">
                            <td className="p-4 font-semibold">Giờ Thường (Tối Muộn)</td>
                            <td className="p-4">21:00 - 22:00 (T2-T6)</td>
                            <td className="p-4 text-blue-600 font-bold">150.000 VNĐ</td>
                            <td className="p-4">Sau 22:00 đóng cửa.</td>
                        </tr>
                         <tr className="border-b bg-green-50 hover:bg-green-100">
                            <td className="p-4 font-semibold">Cuối Tuần</td>
                            <td className="p-4">6:00 - 22:00 (T7 & CN)</td>
                            <td className="p-4 text-yellow-600 font-bold">180.000 VNĐ</td>
                            <td className="p-4">Giá đồng nhất cho cả ngày cuối tuần.</td>
                        </tr>
                         <tr className="hover:bg-gray-50">
                            <td className="p-4 font-semibold">Khách Thuê Cố Định</td>
                            <td className="p-4">Tối thiểu 3 tháng</td>
                            <td className="p-4 text-green-600 font-bold">Ưu đãi lớn</td>
                            <td className="p-4">Liên hệ quản lý để có giá tốt nhất.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer / Contact */}
            <div className="mt-8 text-center text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
                <p>⚠️ Giá trên là giá thuê sân cơ bản, chưa bao gồm các dịch vụ phụ trợ (như thuê vợt, nước uống).</p>
                <p className="mt-1">Để biết thêm chi tiết về thuê dài hạn, vui lòng liên hệ hotline: **0123456789**</p>
            </div>
        </div>
    );
}
