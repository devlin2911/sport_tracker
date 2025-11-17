"use client";

import { Calendar, Users, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type SidebarProps = {
  tab: string;
  setTab: (value: string) => void;
};

export default function Sidebar({ tab, setTab }: SidebarProps) {
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const handleClickProduct = () => {
    setShowProductDropdown((prev) => !prev);
    setTab("product");
  };

  const handleSelectProductTab = (next: "product-sale" | "product-rent") => {
    setTab(next);
    setShowProductDropdown(true);
  };

  const handleClickOtherTab = (next: string) => {
    setTab(next);
    setShowProductDropdown(false);
  };

  return (
    <div className="w-64 bg-white shadow-xl p-4 border-r">
      <h2 className="text-xl text-black font-bold mb-6">Admin Panel</h2>
      <div className="space-y-2">
        {/* Đặt sân */}
        <button
          onClick={() => handleClickOtherTab("court")}
          className={`w-full px-4 py-2 rounded-xl flex items-center ${
            tab === "court" ? "bg-indigo-600 text-white" : "bg-blue-300 text-black hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-5 h-5 mr-2" /> Đặt sân
        </button>

        {/* Giải đấu */}
        <button
          onClick={() => handleClickOtherTab("tournament")}
          className={`w-full px-4 py-2 rounded-xl flex items-center ${
            tab === "tournament" ? "bg-indigo-600 text-white" : "bg-blue-300 text-black hover:bg-gray-200"
          }`}
        >
          <Users className="w-5 h-5 mr-2" /> Giải đấu
        </button>

        {/* Sản phẩm + dropdown */}
        <div>
          <button
            onClick={handleClickProduct}
            className={`w-full px-4 py-2 rounded-xl flex items-center justify-between ${
              tab === "product" || tab.startsWith("product")
                ? "bg-indigo-600 text-white"
                : "bg-blue-300 text-black hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center">
              <Package className="w-5 h-5 mr-2" /> Sản phẩm
            </span>
            {showProductDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showProductDropdown && (
            <div className="ml-6 mt-2 space-y-2">
              <button
                onClick={() => handleSelectProductTab("product-sale")}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  tab === "product-sale"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                Sản phẩm bán
              </button>
              <button
                onClick={() => handleSelectProductTab("product-rent")}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  tab === "product-rent"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                Sản phẩm cho thuê
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
