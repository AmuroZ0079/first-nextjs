"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // โหลด users ทั้งหมด
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("โหลด users ผิดพลาด", error);
        setUsers([]);
      }
    }
    fetchUsers();
  }, []);

  // สร้าง user ใหม่
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      const newUser = await res.json();
      setUsers([...users, newUser]);
      setMessage("สร้างผู้ใช้สำเร็จ");
      setName("");
      setEmail("");
    } catch (err) {
      setMessage("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  // เริ่มแก้ไข
  function startEdit(user: User) {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  }

  // ยกเลิกการแก้ไข
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  }

  // บันทึกการแก้ไข
  async function handleUpdate(id: string) {
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
      setMessage("แก้ไขผู้ใช้สำเร็จ");
      cancelEdit();
    } catch (err) {
      setMessage("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  // ลบ user
  async function handleDelete(id: string) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      setUsers(users.filter((u) => u.id !== id));
      setMessage("ลบผู้ใช้สำเร็จ");
    } catch (err) {
      setMessage("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>จัดการผู้ใช้ (CRUD)</h1>

      {/* ฟอร์มสร้าง user ใหม่ */}
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>เพิ่มผู้ใช้ใหม่</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label>ชื่อ</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
          </button>
        </form>
      </section>

      {/* แสดง message */}
      {message && (
        <p style={{ marginTop: 12, padding: 8, backgroundColor: "#f0f0f0", borderRadius: 4, color: "#1a1a1a" }}>{message}</p>
      )}

      {/* แสดง list users */}
      <section style={{ marginTop: 32 }}>
        <h2>รายชื่อผู้ใช้ทั้งหมด</h2>
        <div style={{ marginTop: 16 }}>
          {users.length === 0 ? (
            <p>ยังไม่มีผู้ใช้</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Array.isArray(users) && users.map((user) => (
                <li
                  key={user.id}
                  style={{
                    padding: 16,
                    marginBottom: 8,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    backgroundColor: editingId === user.id ? "#f9f9f9" : "white",
                    color: "#1a1a1a"
                  }}
                >
                  {editingId === user.id ? (
                    // ฟอร์มแก้ไข
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                      />
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleUpdate(user.id)}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 4,
                            border: "none",
                            backgroundColor: "#10b981",
                            color: "white",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                            backgroundColor: "white",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    // แสดงข้อมูลปกติ
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{user.name}</strong> - {user.email}
                        <br />
                        <small style={{ color: "#666" }}>ID: {user.id}</small>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEdit(user)}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 4,
                            border: "1px solid #2563eb",
                            backgroundColor: "white",
                            color: "#2563eb",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 4,
                            border: "none",
                            backgroundColor: "#ef4444",
                            color: "white",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
