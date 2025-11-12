'use client';
import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import CourtPriceList from "../Bookings/court_price";

const SPACE_COL_WIDTH = '60px';
const COURT_COL_WIDTH = '80px';
const TIME_SLOT_WIDTH = '80px';

export default function CourtBooking() {
  const [view, setView] = useState("booking");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [bookedCells, setBookedCells] = useState<Record<string, boolean>>({});

  // ✅ Dù view = "price" vẫn gọi hook này để giữ thứ tự
  const spaces = [
    { name: "Space 1", courts: ["Sân 1", "Sân 2"] },
    { name: "Space 2", courts: ["Sân 3", "Sân 4", "Sân 5"] },
    { name: "Space 3", courts: ["Sân 6", "Sân 7", "Sân 8"] },
  ];

  const initialTimes = [
    "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00"
  ];

  const slotTimes = initialTimes;

  const timeMarkers = useMemo(() => {
    const lastHour = initialTimes[initialTimes.length - 1];
    const [hour] = lastHour.split(':').map(Number);
    const nextHour = (hour + 1) % 24;
    const endMarker = `${nextHour.toString().padStart(2, '0')}:00`;
    return [...initialTimes, endMarker];
  }, [initialTimes]);

  // Giả lập một vài sân bị khóa hoặc có sự kiện 
  const lockedCells: Record<string, boolean> = {}; 
  const eventCells: Record<string, boolean> = {};

  const handleCellClick = (court: string, time: string) => {
    const key = `${court}_${time}`;
    if (lockedCells[key] || eventCells[key]) return;

    setBookedCells((prev) => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = true;
      return updated;
    });
  };

  const getCellColor = (court: string, time: string) => {
    const key = `${court}_${time}`;
    if (lockedCells[key]) return "bg-gray-400 cursor-not-allowed";
    if (eventCells[key]) return "bg-pink-300 cursor-not-allowed";
    if (bookedCells[key]) return "bg-red-500";
    return "bg-white hover:bg-green-100";
  };

  // ✅ JSX render
  return (
    <div className="min-h-screen bg-green-50 flex justify-center p-4">
      <div className="w-full max-w-[1920px] shadow-2xl rounded-xl overflow-hidden">
        {view === "price" ? (
          <CourtPriceList onBack={() => setView("booking")} />
        ) : (
          <>
            {/* Header */}
            <div className="bg-green-700 text-white px-4 py-3">
              <h1 className="text-xl text-center font-bold mb-2">
                Đặt Lịch Sân Trực Quan
              </h1>

              <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white my-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border bg-white"></div> Trống
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-red-500 bg-red-500"></div> Đã đặt
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-gray-400 bg-gray-400"></div> Khóa
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border-pink-300 bg-pink-300"></div> Sự kiện
                  </div>
                </div>

                {/* Ngày + nút xem bảng giá */}
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white text-black text-sm px-2 py-1 rounded-lg shadow-md cursor-pointer focus:ring-2 focus:ring-yellow-300"
                  />
                  <button
                    className="text-yellow-300 hover:text-yellow-100 font-medium cursor-pointer transition"
                    onClick={() => {
                      console.log("Chuyển sang giao diện bảng giá");
                      setView("price");
                    }}
                  >
                    Xem sân & bảng giá
                  </button>
                </div>
              </div>
            </div>

            {/* Bảng lịch sân */}
            <div className="overflow-x-auto overflow-y-hidden relative bg-white">
              <div className="inline-block min-w-full">
                {/* Header mốc giờ + góc nhọn */}
                <div className="flex bg-green-200 sticky top-0 z-10 border-b-2 border-green-700">
                  <div
                    className="flex-shrink-0 bg-green-200"
                    style={{ width: `calc(${SPACE_COL_WIDTH} + ${COURT_COL_WIDTH})` }}
                  >
                    <div className="h-10"></div>
                  </div>

                  <div
                    className="flex-grow relative h-10"
                    style={{ width: `${slotTimes.length * parseFloat(TIME_SLOT_WIDTH)}px` }}
                  >
                    {timeMarkers.map((time, index) => (
                      <div
                        key={time}
                        className="absolute top-0 h-full w-0"
                        style={{ left: `${index * parseFloat(TIME_SLOT_WIDTH)}px` }}
                      >
                        <span className="absolute top-0 -translate-x-1/2 text-green-800 text-xs font-semibold whitespace-nowrap pt-1">
                          {time}
                        </span>
                        {index < slotTimes.length && (
                          <div className="absolute top-[30px] left-0 transform -translate-x-1/2 w-0 h-0 border-t-[8px] border-l-[6px] border-r-[6px] border-solid border-t-orange-500 border-l-transparent border-r-transparent shadow-md"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nội dung bảng */}
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {spaces.map((space, spaceIndex) => (
                      <React.Fragment key={space.name}>
                        {space.courts.map((court, index) => (
                          <tr key={court}>
                            {index === 0 && (
                              <td
                                rowSpan={space.courts.length}
                                className="border-b border-r border-gray-300 text-green-800 text-center px-2 py-2 bg-green-200 font-extralight pt-2"
                                style={{ width: SPACE_COL_WIDTH }}
                              >
                                <div className="text-base">{space.name}</div>
                              </td>
                            )}
                            <td
                              className="border-b border-r border-gray-300 text-green-800 text-center bg-green-50 font-medium"
                              style={{ width: COURT_COL_WIDTH }}
                            >
                              {court}
                            </td>

                            {slotTimes.map((time) => (
                              <td
                                key={time}
                                className={`border-b border-r border-gray-300 h-10 text-center cursor-pointer transition duration-150 ease-in-out ${getCellColor(
                                  court,
                                  time
                                )}`}
                                style={{ width: TIME_SLOT_WIDTH }}
                                onClick={() => handleCellClick(court, time)}
                              />
                            ))}
                          </tr>
                        ))}
                        {spaceIndex !== spaces.length - 1 && (
                          <tr>
                            <td
                              colSpan={slotTimes.length + 2}
                              className="h-4 bg-gray-200 border-t border-b border-gray-400"
                            ></td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white border-t border-gray-200">
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-800 font-bold py-3 rounded-xl transition duration-200 text-lg shadow-lg">
                TIẾP THEO (Đã chọn: {Object.keys(bookedCells).length} ô)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
