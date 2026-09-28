// src/pages/Programiz.jsx
import React, { useState } from "react";

export default function Programiz() {
  const [activeTab, setActiveTab] = useState("learn");

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg1)" }}>
      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: 0, 
        background: "var(--bg2)", 
        borderBottom: "1px solid var(--border)",
        padding: "0 16px",
        height: "48px",
        alignItems: "center",
      }}>
        <button 
          onClick={() => setActiveTab("learn")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: activeTab === "learn" ? "var(--accent2)" : "transparent",
            color: activeTab === "learn" ? "#fff" : "var(--text2)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            transition: "all .15s",
          }}
        >
          📚 Learn Programming
        </button>
        <button 
          onClick={() => setActiveTab("compiler")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: activeTab === "compiler" ? "var(--accent2)" : "transparent",
            color: activeTab === "compiler" ? "#fff" : "var(--text2)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            transition: "all .15s",
          }}
        >
          💻 Online Compiler
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "learn" && (
          <iframe 
            src="https://www.programiz.com/learn/cpp" 
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Programiz Learn"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
        {activeTab === "compiler" && (
          <iframe 
            src="https://www.programiz.com/c/online-compiler/" 
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Programiz Compiler"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
}
