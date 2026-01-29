import { NextResponse } from "next/server";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, USERS_TABLE_NAME } from "@/lib/dynamodb";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

// GET /api/users - ดึงรายการ users ทั้งหมดจาก DynamoDB
export async function GET() {
  try {
    const { Items } = await docClient.send(
      new ScanCommand({
        TableName: USERS_TABLE_NAME,
      })
    );

    const users = (Items ?? []) as UserItem[];
    users.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้", detail: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/users - สร้าง user ใหม่ใน DynamoDB
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body as { name?: string; email?: string };

  if (!name || !email) {
    return NextResponse.json(
      { error: "name และ email จำเป็นต้องมีค่า" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await docClient.send(
      new PutCommand({
        TableName: USERS_TABLE_NAME,
        Item: {
          id,
          name,
          email,
          createdAt,
        },
      })
    );

    return NextResponse.json(
      { id, name, email, createdAt },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "ไม่สามารถสร้างผู้ใช้ได้", detail: String(error) },
      { status: 500 }
    );
  }
}
