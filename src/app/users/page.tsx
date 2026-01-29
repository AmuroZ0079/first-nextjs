// src/app/users/page.tsx
type User = {
    id: number;
    name: string;
    email: string;
  };
  
  const users: User[] = [
    { id: 1, name: "Alice", email: "alice@test.com" },
    { id: 2, name: "Bob", email: "bob@test.com" },
    { id: 3, name: "Charlie", email: "charlie@test.com" },
  ];
  
  export default function UsersPage() {
    return (
      <main style={{ padding: 24 }}>
        <h1>รายชื่อผู้ใช้ (mock data)</h1>
  
        <ul style={{ marginTop: 16 }}>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: 8 }}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      </main>
    );
  }