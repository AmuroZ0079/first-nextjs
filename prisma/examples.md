# ตัวอย่างการใช้งาน Prisma Query ต่าง ๆ

## 1. การค้นหา (Find)

### ดึงทั้งหมด
```typescript
const users = await prisma.user.findMany();
```

### ดึงทั้งหมดพร้อมเงื่อนไข
```typescript
// หา users ที่ email มี "@gmail.com"
const users = await prisma.user.findMany({
  where: {
    email: {
      contains: "@gmail.com"
    }
  }
});
```

### ดึงคนเดียว (ตาม unique field)
```typescript
// หาตาม id
const user = await prisma.user.findUnique({
  where: { id: 1 }
});

// หาตาม email (เพราะ email เป็น @unique)
const user = await prisma.user.findUnique({
  where: { email: "alice@test.com" }
});
```

### ดึงคนเดียว (ตาม field ธรรมดา)
```typescript
// หา user คนแรกที่ name = "Alice"
const user = await prisma.user.findFirst({
  where: { name: "Alice" }
});
```

## 2. การเรียงลำดับ (Order By)

```typescript
// เรียงตาม name จาก A-Z
const users = await prisma.user.findMany({
  orderBy: { name: "asc" }
});

// เรียงตาม createdAt จากใหม่ไปเก่า
const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" }
});
```

## 3. การจำกัดจำนวน (Take/Skip)

```typescript
// ดึงแค่ 5 คนแรก
const users = await prisma.user.findMany({
  take: 5
});

// ดึง 5 คน ข้าม 10 คนแรก (สำหรับ pagination)
const users = await prisma.user.findMany({
  skip: 10,
  take: 5
});
```

## 4. การเลือกเฉพาะ field ที่ต้องการ (Select)

```typescript
// ดึงแค่ name และ email (ไม่ดึง id, createdAt)
const users = await prisma.user.findMany({
  select: {
    name: true,
    email: true
  }
});
```

## 5. การนับจำนวน (Count)

```typescript
// นับจำนวน users ทั้งหมด
const count = await prisma.user.count();

// นับจำนวน users ที่ email มี "@gmail.com"
const count = await prisma.user.count({
  where: {
    email: {
      contains: "@gmail.com"
    }
  }
});
```

## 6. การสร้างหลาย records พร้อมกัน (createMany)

```typescript
await prisma.user.createMany({
  data: [
    { name: "Alice", email: "alice@test.com" },
    { name: "Bob", email: "bob@test.com" },
    { name: "Charlie", email: "charlie@test.com" }
  ],
  skipDuplicates: true  // ข้ามถ้า email ซ้ำ
});
```

## 7. การอัปเดตหลาย records พร้อมกัน (updateMany)

```typescript
// อัปเดต name ของทุกคนที่ email มี "@gmail.com"
await prisma.user.updateMany({
  where: {
    email: {
      contains: "@gmail.com"
    }
  },
  data: {
    name: "Updated Name"
  }
});
```

## 8. การลบหลาย records พร้อมกัน (deleteMany)

```typescript
// ลบทุกคนที่ email มี "@test.com"
await prisma.user.deleteMany({
  where: {
    email: {
      contains: "@test.com"
    }
  }
});
```

## 9. เงื่อนไขที่ใช้บ่อย (Where Conditions)

```typescript
// เท่ากับ
where: { name: "Alice" }

// ไม่เท่ากับ
where: { name: { not: "Alice" } }

// มีค่า (NOT NULL)
where: { name: { not: null } }

// มากกว่า / น้อยกว่า
where: { id: { gt: 10 } }  // id > 10
where: { id: { gte: 10 } } // id >= 10
where: { id: { lt: 100 } }  // id < 100
where: { id: { lte: 100 } } // id <= 100

// มีอยู่ใน array
where: { id: { in: [1, 2, 3] } }

// ไม่มีอยู่ใน array
where: { id: { notIn: [1, 2, 3] } }

// เริ่มต้นด้วย / สิ้นสุดด้วย / มีคำว่า
where: { email: { startsWith: "admin@" } }
where: { email: { endsWith: "@gmail.com" } }
where: { email: { contains: "test" } }

// หลายเงื่อนไข (AND)
where: {
  name: "Alice",
  email: { contains: "@gmail.com" }
}

// หลายเงื่อนไข (OR)
where: {
  OR: [
    { name: "Alice" },
    { email: { contains: "@gmail.com" } }
  ]
}
```

## 10. การจัดการ Error

```typescript
try {
  const user = await prisma.user.create({
    data: { name: "Alice", email: "alice@test.com" }
  });
} catch (error) {
  // ถ้า email ซ้ำ (unique constraint)
  if (error.code === "P2002") {
    console.log("Email นี้มีอยู่แล้ว");
  }
  // ถ้าไม่พบ record (สำหรับ update/delete)
  if (error.code === "P2025") {
    console.log("ไม่พบข้อมูล");
  }
}
```
