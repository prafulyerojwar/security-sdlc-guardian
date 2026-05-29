"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BackNav from "./BackNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* sdlc-main class adds margin-left:240px on desktop via Sidebar's injected <style> */}
      <div className="sdlc-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: "1.25rem 1.5rem", overflowX: "hidden" }}>
          <BackNav />
          {children}
        </main>
      </div>
    </div>
  );
}
