"use client";

import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto text-foreground">
          <div className="p-6 md:p-8 flex-1">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}