import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Amplify ไม่อนุญาต env ที่ขึ้นต้นด้วย "AWS" จึงใช้ DYNAMODB_* บน Amplify และ AWS_* ในเครื่อง
const accessKeyId =
  process.env.DYNAMODB_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.DYNAMODB_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
const region =
  process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? "ap-southeast-2";

const client = new DynamoDBClient({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client);

/** ชื่อ Table DynamoDB ที่สร้างใน AWS (ต้องตรงกับใน Console) */
export const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE ?? "Users";
