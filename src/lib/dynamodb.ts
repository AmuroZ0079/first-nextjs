import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? "ap-southeast-2";

const client = new DynamoDBClient({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const docClient = DynamoDBDocumentClient.from(client);

/** ชื่อ Table DynamoDB ที่สร้างใน AWS (ต้องตรงกับใน Console) */
export const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE ?? "Users";
