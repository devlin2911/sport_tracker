"use client"; // CHUYỂN LAYOUT THÀNH CLIENT COMPONENT

import type { Metadata } from "next"; // Metadata chỉ được dùng ở Server Component, cần loại bỏ
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from 'react';

// Vì chúng ta chuyển sang Client Component, việc sử dụng font Geist vẫn ổn định hơn.
// Next.js sẽ tự động xử lý các biến CSS cho các font này.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Loại bỏ export const metadata vì RootLayout đã là "use client"
// export const metadata: Metadata = {...}; 

// Context Provider trống rỗng để khắc phục lỗi hydration do extension
function NoopProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NoopProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </NoopProvider>
  );
}
