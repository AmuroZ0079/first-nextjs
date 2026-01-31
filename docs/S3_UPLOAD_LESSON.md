# บทเรียน: อัปโหลดรูปหรือคลิปไป S3

เตรียมบทเรียนสำหรับทำหน้าเว็บอัปโหลดไฟล์ (รูปภาพ / วิดีโอคลิป) ไปเก็บใน **AWS S3** แล้วมาลองทำกันในวันถัดไป

---

## 1. สิ่งที่จะได้ทำ

- **หน้าเว็บ** สำหรับอัปโหลดไฟล์ (รูป หรือ clip)
- ไฟล์ที่อัปโหลดจะถูกส่งไปเก็บใน **S3 bucket**
- ใช้ flow แบบ **Presigned URL** หรือ **API route รับไฟล์แล้วส่งต่อ S3** (จะเลือกในวันทำ)

---

## 2. สิ่งที่ต้องเตรียมใน AWS (ทำก่อนหรือทำพร้อมกันได้)

### 2.1 สร้าง S3 Bucket

1. เข้า **AWS Console** → ค้นหา **S3** → **Create bucket**
2. ตั้งชื่อ bucket (เช่น `first-nextjs-uploads` — ต้องไม่ซ้ำทั้งโลก)
3. เลือก **Region** (ให้ตรงกับแอป เช่น `ap-southeast-2`)
4. **Block Public Access:**  
   - ถ้าให้ดูรูป/คลิปผ่าน URL ได้: ปล่อย default ไว้ แล้วค่อยตั้ง **Bucket Policy** หรือ **Public read** สำหรับ object ที่อัปโหลด  
   - ถ้าไม่ให้ public: ปล่อย block ไว้ แล้วใช้ Presigned URL สำหรับดูไฟล์
5. กด **Create bucket**

### 2.2 ตั้งค่า CORS (ให้เว็บเรียกอัปโหลดได้)

1. เข้า bucket ที่สร้าง → แท็บ **Permissions**
2. เลื่อนไป **Cross-origin resource sharing (CORS)**
3. กด **Edit** แล้วใส่ (หรือเทียบเท่า):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://main.d2svr7u8yzz8jo.amplifyapp.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. แก้ `AllowedOrigins` ให้มีโดเมนของแอป (localhost + URL Amplify จริง)
5. **Save**

### 2.3 สิทธิ์ IAM (ให้แอปอัปโหลดได้)

**ถ้ารันบน Amplify (ใช้ IAM role):**

- ให้ **Compute role** ของ Amplify (เช่น `AmplifyFirstNextjsDynamoDBRole`) มีสิทธิ์ S3 ด้วย  
- ไปที่ IAM → Roles → role นั้น → **Add permissions** → **Attach policies**  
- ค้นหา **AmazonS3FullAccess** (หรือสร้าง policy จำกัดแค่ bucket นี้) แล้ว attach

**ถ้ารันในเครื่อง (ใช้ Access Key):**

- ใช้ user ที่มี policy S3 (เช่น `AmazonS3FullAccess` หรือ policy จำกัด bucket)

---

## 3. โครงสร้างที่อาจใช้ในโปรเจกต์

```
src/app/
├── upload/              ← หน้าใหม่สำหรับอัปโหลด
│   └── page.tsx         ← ฟอร์มเลือกไฟล์ (รูป/คลิป) + ปุ่มอัปโหลด
├── api/
│   └── upload/         ← API สำหรับอัปโหลด
│       └── route.ts    ← รับไฟล์แล้ว put ไป S3 หรือคืน Presigned URL
src/lib/
└── s3.ts                ← ตั้งค่า S3 client (ใช้ default credentials เหมือน DynamoDB)
```

---

## 4. Flow ที่จะเลือกทำ (พรุ่งนี้)

**แบบ A: อัปโหลดผ่าน API (ส่งไฟล์ไป API → API ส่งต่อ S3)**

- หน้า `/upload` ส่งไฟล์เป็น `multipart/form-data` ไป `POST /api/upload`
- API route รับไฟล์ แล้วใช้ SDK `PutObject` ใส่ S3
- ข้อดี: ควบคุมได้เต็มที่ (เปลี่ยนชื่อไฟล์, ตรวจประเภทไฟล์, จำกัดขนาด)

**แบบ B: ใช้ Presigned URL**

- หน้า `/upload` เรียก `POST /api/upload/presign` ส่งชื่อไฟล์/ประเภท
- API สร้าง Presigned URL แล้วคืนให้ frontend
- Frontend ใช้ URL นั้น `PUT` ไฟล์ขึ้น S3 โดยตรง
- ข้อดี: ไฟล์ไม่ผ่าน server ของเรา (ประหยัด bandwidth)

พรุ่งนี้จะเลือกทำแบบใดแบบหนึ่ง (หรือทำแบบ A ก่อนแล้วค่อยเพิ่มแบบ B)

---

## 5. สรุปสิ่งที่เตรียมไว้

| รายการ | สถานะ |
|--------|--------|
| S3 bucket (สร้างใน AWS) | เตรียมก่อนหรือทำพร้อมกัน |
| CORS ของ bucket | ตั้งหลังสร้าง bucket |
| IAM สิทธิ์ S3 (role หรือ user) | เตรียมก่อนหรือทำพร้อมกัน |
| หน้า `/upload` + API `/api/upload` | จะเขียนโค้ดพรุ่งนี้ |
| `src/lib/s3.ts` (S3 client) | จะเขียนพรุ่งนี้ |

---

## 6. สิ่งที่ต้องมีในเครื่อง / ในโปรเจกต์

- โปรเจกต์ Next.js เดิม (first_nextjs)
- AWS SDK สำหรับ S3: `@aws-sdk/client-s3` (จะติดตั้งพรุ่งนี้)
- ถ้ารันในเครื่อง: `.env` มี region หรือ credentials ที่ใช้ S3 ได้ (หรือใช้ IAM role เหมือน DynamoDB)

---

พรุ่งนี้มาเริ่มจากสร้าง bucket + CORS + IAM (ถ้ายังไม่มี) แล้วค่อยเขียนโค้ดหน้า upload กับ API กันครับ.
