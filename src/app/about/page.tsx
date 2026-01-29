"use client";

import { useState } from "react";

export default function AboutPage() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>About Page</h1>
      <p>นี่คือหน้าเกี่ยวกับผม สร้างด้วย Next.js และ React</p>

      <div style={{ marginTop: 20 }}>
        <p>คุณกดปุ่มไปแล้ว: {count} ครั้ง</p>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          กดเพิ่ม 1
        </button>
      </div>
    </main>
  );
}