"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <p style={{ padding: 24 }}>กำลังโหลดข้อมูล...</p>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>รายชื่อผู้ใช้จาก API</h1>
      <ul style={{ marginTop: 16 }}>
        {Array.isArray(users) && users.map((user) => (
          <li key={user.id} style={{ marginBottom: 8 }}>
            <strong>{user.name}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </main>
  );
}