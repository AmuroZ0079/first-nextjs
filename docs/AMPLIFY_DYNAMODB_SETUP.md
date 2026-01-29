# ตั้งค่า DynamoDB บน AWS Amplify (ใช้ IAM Role แทน Access Key)

ถ้าใส่ Environment variables / Secrets แล้วยังได้ `CredentialsProviderError` ให้ใช้ **IAM Role** แทน

---

## ขั้นตอนที่ 1: สร้าง IAM Role สำหรับ Amplify

1. ไปที่ **AWS Console** → ค้นหา **IAM** → **Roles** → **Create role**
2. **Trusted entity type:** เลือก **AWS service**
3. **Use case:** เลือก **Amplify** (หรือ **Lambda** ถ้าไม่มี Amplify)
   - ถ้าไม่มี Amplify: เลือก **Lambda** แล้วแก้ Trust policy ในขั้นถัดไป
4. กด **Next**
5. **Attach permissions:** ค้นหาและติ๊ก **AmazonDynamoDBFullAccess** (หรือสร้าง policy จำกัดแค่ table Users)
6. กด **Next**
7. **Role name:** เช่น `AmplifyFirstNextjsDynamoDBRole`
8. กด **Create role**

---

## ขั้นตอนที่ 2: ผูก Role กับแอป Amplify

1. ไปที่ **Amplify Console** → เลือกแอป **first-nextjs**
2. เมนูซ้าย **App settings** → **General**
3. หา **Service role** หรือ **Execution role** (อาจอยู่ด้านล่าง)
4. กด **Edit** → เลือก Role ที่สร้างไว้ (เช่น `AmplifyFirstNextjsDynamoDBRole`)
5. **Save**
6. ทำ **Redeploy** แอป (Hosting → Redeploy this version)

---

## ขั้นตอนที่ 3 (ถ้าใช้ Lambda)

ถ้าแอป Next.js บน Amplify รัน API ผ่าน Lambda และไม่มีตัวเลือก "Service role" ใน General:

- ไปที่ **App settings** → **Build settings** (หรือ **Hosting** → **Build settings**)
- หา **Service role** / **Backend** / **Compute** แล้วเลือก Role ที่มีสิทธิ์ DynamoDB

---

---

## Clear cache (ล้างแคชแล้ว Redeploy)

ใช้เมื่อแก้ Environment variables แล้วแต่แอปยังใช้ค่าเก่า หรืออยากให้ build ใหม่ทั้งหมด

### ขั้นตอน

1. ไปที่ **Amplify Console** → เลือกแอป **first-nextjs**
2. เมนูซ้ายคลิก **Hosting**
3. ในหน้า Hosting จะเห็นรายการ **Branches** (เช่น **main**)
4. คลิกที่ **main** (หรือ branch ที่ใช้ deploy)
5. ในหน้ารายละเอียด branch:
   - หาปุ่ม **Redeploy this version** หรือเมนู **Actions** (สามจุด)
   - ถ้ามี **Clear cache and redeploy** หรือ **Redeploy with cache cleared** → เลือกตัวนี้
   - ถ้าไม่มี: เลือก **Redeploy this version** แล้วในขั้นถัดไป (ถ้ามี) เลือก **Clear cache** หรือติ๊ก **Clear cache before deploy**
6. ยืนยัน **Redeploy** แล้วรอ build + deploy จบ
7. ลองเปิด `/users-client` อีกครั้ง

### ถ้าหา "Clear cache" ไม่เจอ

- บางเวอร์ชัน Amplify จะมีแค่ **Redeploy**
- ลอง **Redeploy this version** อย่างน้อย 1 ครั้งหลังแก้ Environment variables
- หรือไปที่ **Build settings** (Hosting → Build settings หรือ App settings → Build settings) ดูว่ามี **Clear cache** / **Invalidate cache** หรือไม่

---

## Compute role / Backend role (Role สำหรับรัน API)

บน Amplify บางที **Service role** ใน General ใช้กับขั้นตอน **build/deploy** เท่านั้น ไม่ได้ใช้กับ **Lambda/server ที่รัน Next.js API** ดังนั้นต้องหาตำแหน่งที่ตั้ง **role สำหรับรันแอป (Compute/Backend)** แยกต่างหาก

### ขั้นตอนที่ 1: หาตำแหน่งที่ตั้ง Compute / Backend role

1. ไปที่ **Amplify Console** → แอป **first-nextjs**
2. ตรวจตามลำดับนี้ (แล้วหยุดที่เมนูที่มี):

   **ก. App settings → General**
   - ดูด้านล่างว่ามี **Service role** หรือ **Execution role**
   - ถ้ามีและยังไม่ได้เลือก **AmplifyFirstNextjsDynamoDBRole** → เลือก role นี้ แล้ว **Save**

   **ข. App settings → Build settings**
   - เปิด **Build settings** (หรือ **Edit** ถ้ามี)
   - หาคำว่า **Service role**, **Backend**, **Compute**, **Execution role**, **Lambda execution role**
   - ถ้ามีช่องให้เลือก role → เลือก **AmplifyFirstNextjsDynamoDBRole** แล้ว Save

   **ค. Hosting → Build settings**
   - เมนูซ้าย **Hosting** → **Build settings**
   - หา **Service role** / **Compute role** / **Backend execution role**
   - ถ้ามี → เลือก **AmplifyFirstNextjsDynamoDBRole** แล้ว Save

   **ง. Hosting → เลือก branch (main) → รายละเอียด branch**
   - บางทีการตั้ง role จะอยู่ที่ระดับ branch
   - คลิก **main** → ดูว่ามี **Environment**, **Compute**, **Backend**, **Service role** หรือไม่

3. หลังแก้ role ใดก็ตาม → ทำ **Redeploy** แอปทุกครั้ง

### ขั้นตอนที่ 2: ถ้าไม่มีตัวเลือก "Compute role" เลย

- บางแผน Amplify (เช่น Gen 1 แบบเดิม) อาจไม่มีเมนู Compute/Backend role แยก
- ในกรณีนี้ให้ใช้ **Environment variables** แทน:
  1. **Hosting** → **Environment variables**
  2. ใส่ **DYNAMODB_ACCESS_KEY_ID**, **DYNAMODB_SECRET_ACCESS_KEY**, **DYNAMODB_REGION**
  3. **Save** แล้วทำ **Clear cache and redeploy** (หรือ Redeploy อย่างน้อย 1 ครั้ง)

---

---

## Error: "The security token included in the request is invalid"

ถ้าได้ error นี้แทน "Could not load credentials" แปลว่าแอปได้ credentials แล้ว แต่ token ถูกปฏิเสธ

### สาเหตุที่พบบ่อย

1. **ยังมี Access Key ใน Amplify (Env/Secrets)** แต่ key นั้นถูกลบหรือ deactivate ใน IAM แล้ว  
   → แอปส่ง key เก่าที่ไม่ใช้ได้ → DynamoDB คืน "invalid token"

2. **Compute role ตั้งแล้วแต่ยังไม่ propagate**  
   → รอ 2–5 นาที แล้ว Redeploy อีกครั้ง

### วิธีแก้

**ขั้นที่ 1: ลบ Access Key ออกจาก Amplify (ใช้แค่ Role)**

1. **Amplify** → **Hosting** → **Environment variables**  
   - ลบ **DYNAMODB_ACCESS_KEY_ID**, **DYNAMODB_SECRET_ACCESS_KEY**, **DYNAMODB_REGION** (ถ้ามี)  
   - หรือลบ **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY**, **AWS_REGION** (ถ้ามี)  
   - **Save**

2. **Amplify** → **Hosting** → **Secrets**  
   - ลบ **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY**, **AWS_REGION** (ถ้ามี)  
   - **Save**

**ขั้นที่ 2: ตรวจว่า Compute role ถูกต้อง**

1. **Amplify** → **App settings** → **IAM roles**
2. ตรวจว่า **Service role** และ **Compute role** เป็น **AmplifyFirstNextjsDynamoDBRole**
3. ถ้ายังไม่ใช่ → กด **Edit** แล้วเลือก role นี้ทั้งสองที่

ท**ขั้นที่ 3: Redeploy (สำคัญ — ต้องทำหลังลบ key ทุกครั้ง)**

1. **Hosting** → เลือก branch **main**
2. กด **Redeploy this version** (หรือ **Clear cache and redeploy**)
3. รอ build + deploy จบ (2–5 นาที) — อย่าข้ามขั้นนี้
4. ลองเปิด `/users-client` อีกครั้ง

**หมายเหตุ:** โค้ดเราไม่แคช DynamoDB client แล้ว เพื่อให้ Amplify ใช้ role credentials ใหม่ทุก request (ลดโอกาสใช้ token เก่าที่ invalid)

---

## สรุป

- **Clear cache:** Hosting → เลือก branch → **Clear cache and redeploy** (หรือ Redeploy) หลังแก้ env
- **Compute role:** **App settings** → **IAM roles** → ตั้ง **Service role** และ **Compute role** เป็น **AmplifyFirstNextjsDynamoDBRole**
- **Invalid token:** ลบ Access Key/Secrets ออกจาก Amplify ให้เหลือแค่ Role แล้ว **ต้อง Redeploy** (และโค้ดเราไม่แคช client แล้ว)

### ถ้าลบ key แล้ว + ใช้ role แล้ว ยังได้ "invalid token"

1. **ต้อง Redeploy หลังลบ key** — แอปที่รันอยู่ยังเป็น deployment เก่าที่อาจมี env เก่า ต้อง Redeploy เพื่อให้รันแบบไม่มี key และใช้ role
2. **ตรวจ Trust relationship ของ role** — ไปที่ IAM → Roles → AmplifyFirstNextjsDynamoDBRole → แท็บ **Trust relationships** → ตรวจว่า principal ที่ assume role ได้รวมถึงบริการที่รัน Next.js API (เช่น `amplify.amazonaws.com` หรือ `lambda.amazonaws.com`) ถ้าไม่มี ให้แก้ policy ให้บริการที่รัน API assume role ได้
3. **Push โค้ดล่าสุด** — โค้ดเราไม่แคช client แล้ว (ใช้ credentials ใหม่ทุก request) แล้ว push ขึ้น Git แล้วให้ Amplify build ใหม่
