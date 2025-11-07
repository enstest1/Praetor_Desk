import { useEffect, useState } from "react";
import { isTauriAvailable } from "../utils/tauri-check";

export function TauriWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    isTauriAvailable().then((available) => {
      setShowWarning(!available);
    });
  }, []);

  if (!showWarning) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#ff6b6b",
        color: "white",
        padding: "12px",
        textAlign: "center",
        zIndex: 10000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <strong>⚠️ Tauri API Not Available</strong> - This app must run in the Tauri desktop window.
      <br />
      Please run <code style={{ background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "3px" }}>pnpm tauri dev</code> to launch the desktop app.
    </div>
  );
}


