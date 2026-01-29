import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// อ่าน env ตอนเรียกใช้ (ไม่ใช่ตอนโหลดโมดูล) เพื่อให้ Amplify เห็น env ตอน runtime
function createClient() {
  const accessKeyId =
    process.env.DYNAMODB_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.DYNAMODB_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
  const region =
    process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? "ap-southeast-2";

  return new DynamoDBClient({
    region,
    credentials:
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
  });
}

let _docClient: DynamoDBDocumentClient | null = null;

/** ใช้ฟังก์ชันนี้ใน API routes เพื่อให้อ่าน process.env ตอน runtime (ช่วยกรณี Amplify) */
export function getDocClient() {
  if (!_docClient) {
    _docClient = DynamoDBDocumentClient.from(createClient());
  }
  return _docClient;
}

/** ชื่อ Table DynamoDB ที่สร้างใน AWS (ต้องตรงกับใน Console) */
export const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE ?? "Users";
