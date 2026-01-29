import { NextResponse } from "next/server";
import {
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDocClient, USERS_TABLE_NAME } from "@/lib/dynamodb";

// GET /api/users/[id] - ดึงข้อมูล user คนเดียว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const { Item } = await getDocClient().send(
      new GetCommand({
        TableName: USERS_TABLE_NAME,
        Key: { id },
      })
    );

    if (!Item) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json(Item);
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด", detail: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - แก้ไขข้อมูล user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
  }

  const body = await request.json();
  const { name, email } = body as { name?: string; email?: string };

  if (!name || !email) {
    return NextResponse.json(
      { error: "name และ email จำเป็นต้องมีค่า" },
      { status: 400 }
    );
  }

  try {
    const { Attributes } = await getDocClient().send(
      new UpdateCommand({
        TableName: USERS_TABLE_NAME,
        Key: { id },
        UpdateExpression: "SET #name = :name, #email = :email",
        ExpressionAttributeNames: {
          "#name": "name",
          "#email": "email",
        },
        ExpressionAttributeValues: {
          ":name": name,
          ":email": email,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    if (!Attributes) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json(Attributes);
  } catch (error) {
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขผู้ใช้ได้", detail: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - ลบ user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    await getDocClient().send(
      new DeleteCommand({
        TableName: USERS_TABLE_NAME,
        Key: { id },
      })
    );

    return NextResponse.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    return NextResponse.json(
      { error: "ไม่สามารถลบผู้ใช้ได้", detail: String(error) },
      { status: 500 }
    );
  }
}
