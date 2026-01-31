import { S3Client } from "@aws-sdk/client-s3";

const DEFAULT_REGION = "ap-southeast-2";

export const S3_REGION =
  process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? DEFAULT_REGION;

/** สร้าง S3 client — บน Amplify ใช้ IAM role โดยอัตโนมัติ, บน Local ใช้ AWS credentials จาก env/CLI */
function createS3Client() {
  return new S3Client({ region: S3_REGION });
}

/** ใช้ใน API routes — ไม่แคช client เพื่อให้ Amplify ใช้ role credentials ใหม่ทุก request */
export function getS3Client() {
  return createS3Client();
}

/** ชื่อ S3 bucket ที่สร้างใน AWS (ตั้งใน env S3_BUCKET หรือใช้ค่าตั้งต้น) */
export const S3_BUCKET =
  process.env.S3_BUCKET ?? process.env.NEXT_PUBLIC_S3_BUCKET ?? "first-nextjs-uploads";
