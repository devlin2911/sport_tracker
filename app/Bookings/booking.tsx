'use client';
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import CourtPriceList from "../Bookings/court_price";

export default function CourtBooking() {
  const [view, setView] = useState("booking"); // 'booking' hoặc 'price'
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // ✅ Lưu trạng thái đặt sân tạm thời (trước khi lưu thật vào Firestore)
  const [bookedCells, setBookedCells] = useState({});

  if (view === "price") {
    return <CourtPriceList onBack={() => setView("booking")} />;
  }

  // Danh sách sân
  const spaces = [
    { name: "Space 1", courts: ["Sân 1", "Sân 2"] },
    { name: "Space 2", courts: ["Sân 3", "Sân 4", "Sân 5"] },
    { name: "Space 3", courts: ["Sân 6", "Sân 7", "Sân 8"] },
  ];

  // Danh sách khung giờ
  const times = [
    "6:00","7:00","8:00","9:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00","17:00","18:00",
    "19:00","20:00","21:00","22:00"
  ];

  // Giả lập một vài sân bị khóa hoặc có sự kiện
  const lockedCells = {};
  const eventCells = {};

  // 🟢 Hàm click để toggle trạng thái đặt sân
  const handleCellClick = (court, time) => {
    const key = `${court}_${time}`;
    // Nếu sân bị khóa hoặc là sự kiện thì không được bấm
    if (lockedCells[key] || eventCells[key]) return;

    setBookedCells((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key]; // Bỏ đặt sân
      } else {
        updated[key] = true; // Đặt sân
      }
      return updated;
    });
  };

  // ✅ Hàm xác định màu nền của ô
  const getCellColor = (court, time) => {
    const key = `${court}_${time}`;
    if (lockedCells[key]) return "bg-gray-400 cursor-not-allowed"; // Xám
    if (eventCells[key]) return "bg-pink-300 cursor-not-allowed"; // Hồng
    if (bookedCells[key]) return "bg-red-500"; // Đỏ
    return "bg-white hover:bg-green-100"; // Trắng
  };

  return (
    <div className="min-h-screen bg-green-50 flex justify-center">
      <div className="min-w-[1400px] ">
        {/* Thanh tiêu đề */}
        <div className="bg-green-700 text-white flex-col px-4 py-3">
          <div className=" ">
            <h1 className="text-lg text-center font-semibold">Đặt lịch ngày trực quan</h1>
          </div>

          <div className="flex justify-between">
            <div className="flex justify-start gap-6 text-sm text-white my-4">
              <div className="flex items-center gap-2 ">
                <div className="w-4 h-4 rounded-sm border bg-white"></div> Trống
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-red-500 bg-red-500"></div> Đã đặt
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-gray-400 bg-gray-400"></div> Khóa
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-pink-300 bg-pink-300"></div> Sự kiện
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Chọn ngày */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white text-black text-sm px-2 py-1 rounded-lg shadow-md cursor-pointer"
              />

              {/* Xem bảng giá */}
              <button
                className="text-yellow-300 hover:underline cursor-pointer"
                onClick={() => setView("price")}
              >
                Xem sân & bảng giá
              </button>
            </div>
          </div>

        </div>

        {/* 🟡 Thanh chú thích màu */}
        

        {/* Bảng lịch sân */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className=" text-green-800 bg-green-200">
              <tr>
                {times.map((t) => (
                  <th key={t} className=" py-2 text-center">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spaces.map((space, i) => (
                <React.Fragment key={i}>
                  <tr className="bg-green-100 text-green-800 font-semibold">
                    <td colSpan={times.length + 1} className="border text-left px-2">
                      {space.name}
                    </td>
                  </tr>
                  {space.courts.map((court) => (
                    <tr key={court}>
                      <td className="border text-green-800 text-center bg-green-50 font-medium">
                        {court}
                      </td>
                      {times.map((time) => (
                        <td
                          key={time}
                          className={`border h-10 text-gray-400 text-center cursor-pointer transition-colors duration-200 ${getCellColor(
                            court,
                            time
                          )}`}
                          onClick={() => handleCellClick(court, time)}
                        ></td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nút Tiếp theo */}
        <div className="mt-6">
            <button className="w-full bg-yellow-500 text-white font-bold py-2 rounded-lg">
              TIẾP THEO
            </button>
        </div>
      </div>
    </div>
  );
}
