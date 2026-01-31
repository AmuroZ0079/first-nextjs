import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, S3_BUCKET, S3_REGION } from "@/lib/s3";

const UPLOADS_PREFIX = "uploads/";
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const PRESIGN_EXPIRES_IN = 3600; // 1 ชม.

const MAX_SIZE_MB = 50;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
];

/** GET: list รูปจาก S3 (presigned URL สำหรับดูได้แม้ bucket private) */
export async function GET() {
  try {
    const client = getS3Client();
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: UPLOADS_PREFIX,
        MaxKeys: 100,
      })
    );
    const keys = (list.Contents ?? [])
      .map((c) => c.Key)
      .filter((key): key is string => !!key && isImageKey(key));

    const items = await Promise.all(
      keys.map(async (key) => {
        const url = await getSignedUrl(
          client,
          new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
          { expiresIn: PRESIGN_EXPIRES_IN }
        );
        return { key, url };
      })
    );

    return NextResponse.json(items);
  } catch (err) {
    console.error("List uploads error:", err);
    return NextResponse.json(
      { error: "โหลดรายการรูปไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

function isImageKey(key: string): boolean {
  const lower = key.toLowerCase();
  return IMAGE_EXTS.some((ext) => lower.endsWith(ext));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "ไม่ได้ส่งไฟล์หรือไฟล์ว่าง" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `ขนาดไฟล์เกิน ${MAX_SIZE_MB} MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "ประเภทไฟล์ไม่รองรับ (รองรับรูปภาพและวิดีโอเท่านั้น)" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({
      ok: true,
      key,
      url,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "อัปโหลดไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
