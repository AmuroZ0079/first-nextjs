// ตัวอย่าง: วิธีรัน SQL Query โดยตรงด้วย Prisma

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ตัวอย่าง 1: SELECT query
async function exampleSelect() {
  // รัน SQL โดยตรง
  const users = await prisma.$queryRaw`
    SELECT * FROM User WHERE name LIKE '%Alice%'
  `;

  // หรือใช้แบบ parameterized (ปลอดภัยกว่า)
  const users2 = await prisma.$queryRaw`
    SELECT * FROM User WHERE id > ${5}
  `;

  return users;
}

// ตัวอย่าง 2: INSERT query
async function exampleInsert() {
  await prisma.$executeRaw`
    INSERT INTO User (name, email) 
    VALUES ('Test User', 'test@example.com')
  `;
}

// ตัวอย่าง 3: UPDATE query
async function exampleUpdate() {
  await prisma.$executeRaw`
    UPDATE User 
    SET name = 'Updated Name' 
    WHERE id = ${1}
  `;
}

// ตัวอย่าง 4: DELETE query
async function exampleDelete() {
  await prisma.$executeRaw`
    DELETE FROM User WHERE id = ${1}
  `;
}

// ตัวอย่าง 5: Complex query (JOIN, GROUP BY, etc.)
async function exampleComplex() {
  const result = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_users,
      DATE(createdAt) as date
    FROM User
    GROUP BY DATE(createdAt)
    ORDER BY date DESC
  `;

  return result;
}

// ⚠️ หมายเหตุ:
// - $queryRaw ใช้สำหรับ SELECT (คืนข้อมูล)
// - $executeRaw ใช้สำหรับ INSERT, UPDATE, DELETE (ไม่คืนข้อมูล)
// - ใช้ template literals (backticks) เพื่อป้องกัน SQL Injection
// - ถ้าต้องการใช้ตัวแปร ให้ใส่ใน ${} แบบนี้: WHERE id = ${userId}
