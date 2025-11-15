"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PageAdmin from "../admin/page";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <aside className="text-xl font-bold mb-4">Admin Dashboard</aside>
        <nav>
          <ul>
            <li className="mb-2">
              <button
                onClick={() => setTab("dashboard")}
                className={`block p-2 rounded w-full text-left ${
                  tab === "dashboard" ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                }`}
              >
                Quản lý tổng hợp
              </button>
            </li>
            <li className="mb-2">
              <Link href="/admin/users" className="block hover:bg-gray-700 p-2 rounded">
                Quản lý người dùng
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6">
        {tab === "dashboard" ? <PageAdmin /> : children}
      </main>
    </div>
  );
}
