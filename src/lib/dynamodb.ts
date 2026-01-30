import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const DEFAULT_REGION = "ap-southeast-2";

// อ่าน env ตอนเรียกใช้ (ไม่ใช่ตอนโหลดโมดูล) เพื่อให้ Amplify เห็น env ตอน runtime
function createClient() {
  const region =
    process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? DEFAULT_REGION;

  // บน Amplify: ไม่ส่ง credentials เลย ให้ใช้ IAM role โดยอัตโนมัติ
  // บน Local: ใช้ AWS CLI credentials หรือ environment variables โดยอัตโนมัติ
  return new DynamoDBClient({
    region,
  });
}

/** ใช้ฟังก์ชันนี้ใน API routes — ไม่แคช client เพื่อให้ Amplify ใช้ role credentials ใหม่ทุก request */
export function getDocClient() {
  return DynamoDBDocumentClient.from(createClient());
}

/** ชื่อ Table DynamoDB ที่สร้างใน AWS (ต้องตรงกับใน Console) */
export const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE ?? "Users";
