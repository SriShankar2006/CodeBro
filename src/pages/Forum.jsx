import React from "react";

const FORUM_URL = "https://pdc1058.vercel.app/";

export default function Forum() {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - var(--nav-height))",
        minHeight: 640,
        overflow: "hidden",
        background: "var(--bg1)",
      }}
    >
      <iframe
        title="CodeBro Community Forum"
        src={FORUM_URL}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    </div>
  );
}
