"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Arabic locale as default
    router.replace("/ar");
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#f9fafb"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#0ea5e9", marginBottom: "16px" }}>
          Redirecting to Rosokh...
        </h1>
        <p style={{ color: "#6b7280", fontSize: "18px" }}>
          إعادة توجيه إلى منصة رسوخ...
        </p>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "8px" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
