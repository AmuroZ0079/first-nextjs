"use client";

import { FormEvent, useState } from "react";

export default function UsersQueryPage() {
  const [query, setQuery] = useState("SELECT * FROM User LIMIT 10");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/raw-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        // แสดง error detail ที่ชัดเจนขึ้น
        const errorMsg = data.error ?? "เกิดข้อผิดพลาด";
        const errorDetail = data.detail ? `\nรายละเอียด: ${data.detail}` : "";
        const errorHint = data.hint ? `\nคำแนะนำ: ${data.hint}` : "";
        setError(`${errorMsg}${errorDetail}${errorHint}`);
        return;
      }

      setResult(data.result);
    } catch (err) {
      setError("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000 }}>
      <h1>ทดสอบ SQL Query</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        ⚠️ อนุญาตให้รัน SELECT query เท่านั้น (เพื่อความปลอดภัย)
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            SQL Query:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: 14,
              minHeight: 100,
            }}
            placeholder="SELECT * FROM User WHERE id > 1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
          }}
        >
          {loading ? "กำลังรัน..." : "รัน Query"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: 8,
            color: "#c00",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>ผลลัพธ์:</h2>
          <div
            style={{
              marginTop: 12,
              padding: 16,
              backgroundColor: "#f9f9f9",
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 14 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div style={{ marginTop: 32, padding: 16, backgroundColor: "#f0f9ff", borderRadius: 8 }}>
        <h3>ตัวอย่าง Query ที่ใช้ได้:</h3>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>
            <code>SELECT * FROM User</code> - ดึงข้อมูลทั้งหมด
          </li>
          <li>
            <code>SELECT * FROM User WHERE id = 1</code> - ดึง user ที่ id = 1
          </li>
          <li>
            <code>SELECT name, email FROM User</code> - ดึงแค่ name และ email
          </li>
          <li>
            <code>SELECT COUNT(*) as total FROM User</code> - นับจำนวน users
          </li>
          <li>
            <code>SELECT * FROM User ORDER BY createdAt DESC</code> - เรียงตามวันที่สร้าง
          </li>
        </ul>
      </div>
    </main>
  );
}
