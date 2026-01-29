import { NextResponse } from "next/server";
// @ts-ignore
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ⚠️ หมายเหตุ: API นี้สร้างไว้สำหรับทดสอบเท่านั้น
// ในโปรเจกต์จริงไม่ควรเปิดให้รัน SQL โดยตรง (เสี่ยงต่อ SQL Injection)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query) {
      return NextResponse.json({ error: "กรุณาระบุ SQL query" }, { status: 400 });
    }

    // ตรวจสอบว่าเป็น SELECT query เท่านั้น (เพื่อความปลอดภัย)
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith("SELECT")) {
      return NextResponse.json(
        { error: "อนุญาตให้รัน SELECT query เท่านั้น" },
        { status: 400 }
      );
    }

    // รัน SQL query
    // ใช้ $queryRawUnsafe เพราะรับ query เป็น string
    const result = await prisma.$queryRawUnsafe(query);

    // แปลง BigInt เป็น number (เพราะ COUNT() return BigInt ใน SQLite)
    // และจัดการกับ result ที่เป็น array หรือ object
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return NextResponse.json({ result: serializedResult });
  } catch (error: any) {
    // แสดง error message ที่ชัดเจนขึ้น
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code || "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาด",
        detail: errorMessage,
        code: errorCode,
        hint: "ตรวจสอบ syntax ของ SQL query ให้ถูกต้อง",
      },
      { status: 500 }
    );
  }
}

// ตัวอย่างการใช้งาน:
// POST /api/users/raw-query
// Body: { "query": "SELECT * FROM User WHERE id > 1" }
