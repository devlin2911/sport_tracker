"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../admin/components/sidebar";
import CourtManager from "../admin/components/courtManage";
import TournamentManager from "../admin/components/tournament_mng";
import ProductManager from "../admin/components/product_mng";

export default function AdminManagePage() {
  // ✅ Lấy tab từ localStorage khi khởi tạo
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeTab") || "court";
    }
    return "court";
  });

  // ✅ Lưu tab vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("activeTab", tab);
  }, [tab]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar tab={tab} setTab={setTab} />

      <div className="flex-1 p-6 text-black">
        {tab === "court" && <CourtManager />}
        {tab === "tournament" && <TournamentManager />}
        {tab === "product-sale" && <ProductManager type="sale" />}
        {tab === "product-rent" && <ProductManager type="rental" />}
      </div>
    </div>
  );
}
