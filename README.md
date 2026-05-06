# 🏢 SENA - ระบบรับร้องเรียนนิติบุคคล

ระบบรับร้องเรียนและติดตามสถานะสำหรับนิติบุคคล พัฒนาด้วย Next.js + Express.js + Supabase

---

## 📋 สารบัญ

- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจค](#project-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Logging](#logging)
- [การติดตั้ง](#installation)

---

## 🛠 Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | React, Next.js, Tailwind CSS      |
| Backend    | Node.js, Express.js               |
| Database   | Supabase (PostgreSQL)             |
| Auth       | JWT (Access + Refresh Token)       |
| Logging    | Winston + Morgan                   |
| Validation | Zod                               |
| Language   | TypeScript                         |

---

## 📁 Project Structure

```
sena/
├── frontend/                        # Next.js Frontend (App Router)
│   ├── app/
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing / Redirect page
│   │   ├── globals.css              # Tailwind + global styles
│   │   │
│   │   ├── (auth)/                  # กลุ่ม Auth (ไม่มี Sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # หน้า Login (ทุก role ใช้ร่วมกัน)
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # หน้าสมัครสมาชิก (สำหรับลูกบ้านเท่านั้น)
│   │   │   └── forgot-password/
│   │   │       └── page.tsx         # ลืมรหัสผ่าน (ทุก role ใช้ร่วมกัน)
│   │   │
│   │   ├── resident/                # กลุ่มลูกบ้าน (Layout เฉพาะลูกบ้าน)
│   │   │   ├── layout.tsx           # Sidebar/Navbar สำหรับลูกบ้าน
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # สรุปข้อมูลของตัวเอง
│   │   │   ├── complaints/
│   │   │   │   ├── page.tsx         # รายการร้องเรียนของตัวเอง
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # ฟอร์มสร้างร้องเรียนใหม่
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # รายละเอียดร้องเรียน + ติดตามสถานะ
│   │   │   └── profile/
│   │   │       └── page.tsx         # จัดการข้อมูลส่วนตัว
│   │   │
│   │   ├── staff/                   # กลุ่มนิติบุคคล (Layout เฉพาะนิติ)
│   │   │   ├── layout.tsx           # Sidebar/Navbar สำหรับนิติ (เมนูเยอะกว่า)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # ภาพรวมงานที่ต้องทำทั้งหมด
│   │   │   ├── complaints/
│   │   │   │   ├── page.tsx         # จัดการร้องเรียนทั้งหมด (เปลี่ยนสถานะ, มอบหมาย)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # หน้าจัดการรายละเอียด (มีปุ่มอัปเดตสถานะ)
│   │   │   └── profile/
│   │   │       └── page.tsx         # โปรไฟล์เจ้าหน้าที่
│   │   │
│   │   └── admin/                   # กลุ่มแอดมิน (Layout เฉพาะแอดมิน)
│   │       ├── layout.tsx           # Sidebar/Navbar สำหรับแอดมิน (เมนูตั้งค่าระบบ)
│   │       ├── dashboard/
│   │       │   └── page.tsx         # ภาพรวมทั้งระบบ
│   │       ├── users/
│   │       │   └── page.tsx         # จัดการผู้ใช้งาน (เพิ่ม/ลดสิทธิ์นิติ)
│   │       ├── reports/
│   │       │   └── page.tsx         # ดูรายงานสรุป
│   │       └── logs/
│   │           └── page.tsx         # ดู Audit Logs
│   │
│   ├── components/                  # Reusable UI Components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Card.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── complaints/
│   │   │   ├── ComplaintForm.tsx
│   │   │   ├── ComplaintCard.tsx
│   │   │   ├── ComplaintList.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── StatusTimeline.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── ProtectedRoute.tsx
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useComplaints.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                         # Utilities & Config
│   │   ├── api.ts                   # Axios instance + interceptors
│   │   ├── supabase.ts              # Supabase client
│   │   └── utils.ts                 # Helper functions
│   │
│   ├── types/                       # TypeScript Types
│   │   ├── auth.ts
│   │   ├── complaint.ts
│   │   └── user.ts
│   │
│   ├── context/                     # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── middleware.ts                # Next.js middleware (เช็ค Role ตาม Path)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                         # Express.js Backend (MVC Pattern)
│   ├── src/
│   │   ├── server.ts                # Entry point
│   │   ├── app.ts                   # Express app setup
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts          # Supabase connection
│   │   │   ├── env.ts               # Environment variables (dotenv)
│   │   │   ├── cors.ts              # CORS configuration
│   │   │   └── logger.ts            # Winston logger config
│   │   │
│   │   ├── models/                  # Model Layer (Supabase queries)
│   │   │   ├── User.model.ts
│   │   │   ├── Complaint.model.ts
│   │   │   ├── Comment.model.ts
│   │   │   ├── Attachment.model.ts
│   │   │   └── AuditLog.model.ts
│   │   │
│   │   ├── views/                   # View Layer (Response formatters)
│   │   │   ├── success.view.ts
│   │   │   └── error.view.ts
│   │   │
│   │   ├── controllers/             # Controller Layer
│   │   │   ├── auth.controller.ts
│   │   │   ├── complaint.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── routes/                  # Express Routes
│   │   │   ├── index.ts             # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── complaint.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── middlewares/             # Middleware
│   │   │   ├── auth.middleware.ts        # JWT verify
│   │   │   ├── role.middleware.ts        # Role-based access
│   │   │   ├── validate.middleware.ts    # Zod validation
│   │   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   │   ├── upload.middleware.ts      # File upload (multer)
│   │   │   └── errorHandler.middleware.ts# Global error handler
│   │   │
│   │   ├── services/                # Business Logic
│   │   │   ├── auth.service.ts
│   │   │   ├── complaint.service.ts
│   │   │   ├── email.service.ts     # Email notifications
│   │   │   └── upload.service.ts    # File upload to Supabase Storage
│   │   │
│   │   ├── validators/              # Zod Schemas
│   │   │   ├── auth.validator.ts
│   │   │   ├── complaint.validator.ts
│   │   │   └── user.validator.ts
│   │   │
│   │   ├── utils/                   # Utilities
│   │   │   ├── jwt.util.ts          # JWT sign/verify helpers
│   │   │   ├── hash.util.ts         # bcrypt helpers
│   │   │   └── response.util.ts     # Standard response format
│   │   │
│   │   ├── seeds/                   # Database Seeding
│   │   │   └── admin.seed.ts        # สร้าง Admin account เริ่มต้น
│   │   │
│   │   └── types/                   # Shared Types
│   │       ├── express.d.ts         # Express type extensions
│   │       └── index.ts
│   │
│   ├── logs/                        # Log files (gitignored)
│   │   ├── error.log
│   │   ├── combined.log
│   │   └── access.log
│   │
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── .env.local                       # Frontend env
├── docker-compose.yml               # (optional) Docker setup
└── README.md
```

### 📌 หมายเหตุเรื่องการสร้างบัญชีผู้ใช้แต่ละ Role

| Role       | วิธีสร้างบัญชี                                            |
| ---------- | -------------------------------------------------------- |
| `resident` | สมัครสมาชิกผ่านหน้า `/register` ได้ด้วยตัวเอง               |
| `staff`    | **ไม่มีหน้าสมัคร** — Admin เพิ่มผ่าน Admin Panel หรือ Manual Insert ใน Database |
| `admin`    | **ไม่มีหน้าสมัคร** — สร้างผ่าน Database Seeding (`npm run seed`) หรือ Manual Insert ใน Database |

> ⚠️ **สำคัญ**: หน้า `/register` เปิดให้เฉพาะลูกบ้าน (resident) เท่านั้น
> บัญชี staff และ admin ต้องถูกสร้างจากฝั่ง backend โดยตรง เพื่อความปลอดภัย

### 🔀 Middleware Route Protection

`middleware.ts` ทำหน้าที่ตรวจสอบ Role ของผู้ใช้ตาม Path ที่เข้าถึง:

```
Path /resident/*  →  ต้องเป็น role: resident เท่านั้น
Path /staff/*     →  ต้องเป็น role: staff เท่านั้น
Path /admin/*     →  ต้องเป็น role: admin เท่านั้น
Path /(auth)/*      →  ทุก role (หรือยังไม่ login) เข้าถึงได้
```

---

## 🗄 Database Schema (Supabase / PostgreSQL)

### ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users      │       │   complaints      │       │   comments    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (uuid) PK │◄──┐   │ id (uuid) PK      │◄──┐   │ id (uuid) PK │
│ email         │   │   │ title              │   │   │ complaint_id │──► complaints
│ password_hash │   ├──►│ user_id (FK)       │   ├──►│ user_id (FK) │──► users
│ full_name     │   │   │ category           │   │   │ message      │
│ phone         │   │   │ description        │   │   │ created_at   │
│ role          │   │   │ status             │   │   └──────────────┘
│ avatar_url    │   │   │ priority           │   │
│ is_active     │   │   │ assigned_to (FK)───┘   │   ┌──────────────┐
│ created_at    │   │   │ resolved_at        │   │   │ attachments  │
│ updated_at    │   │   │ created_at         │   │   ├──────────────┤
└──────────────┘   │   │ updated_at         │   │   │ id (uuid) PK │
                   │   └──────────────────┘   │   │ complaint_id │──► complaints
                   │                           │   │ file_url     │
                   │   ┌──────────────────┐   │   │ file_name    │
                   │   │   audit_logs      │   │   │ file_type    │
                   │   ├──────────────────┤   │   │ uploaded_at  │
                   │   │ id (uuid) PK      │   │   └──────────────┘
                   └──►│ user_id (FK)       │   │
                       │ action             │   │
                       │ entity             │   │
                       │ entity_id          │   │
                       │ details (jsonb)    │   │
                       │ ip_address         │   │
                       │ created_at         │   │
                       └──────────────────┘
```

### Tables

```sql
-- 1. Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('resident','staff','admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Complaints
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','resolved','rejected','closed')),
  priority VARCHAR(10) DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','urgent')),
  assigned_to UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Comments
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Attachments
CREATE TABLE attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Audit Logs
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
```

---

## 🔐 Authentication & Authorization

### Flow Diagram

```
┌────────┐     POST /auth/login      ┌─────────┐     Verify       ┌──────────┐
│ Client │ ──────────────────────────►│ Express │ ───────────────► │ Supabase │
│        │◄────────────────────────── │ Server  │ ◄─────────────── │    DB    │
│        │  { accessToken,            └─────────┘   User Data      └──────────┘
│        │    refreshToken }
│        │
│        │     GET /complaints
│        │     Authorization: Bearer <token>
│        │ ──────────────────────────►┌─────────┐
│        │                            │  JWT    │ ── verify ──► Decode payload
│        │◄────────────────────────── │Middleware│               { id, role, exp }
│        │     200 OK / 401           └─────────┘
└────────┘
```

### JWT Strategy

| Token         | Expiry | Storage              |
| ------------- | ------ | -------------------- |
| Access Token  | 15 min | Memory / Cookie      |
| Refresh Token | 7 days | HttpOnly Secure Cookie |

### Role-Based Access Control (RBAC)

#### Role Definitions

| Role       | ระดับ | คำอธิบาย                                          |
| ---------- | ----- | ------------------------------------------------ |
| `resident` | 1     | ลูกบ้าน/ผู้พักอาศัย — ผู้ส่งเรื่องร้องเรียน             |
| `staff`    | 2     | เจ้าหน้าที่นิติบุคคล — ผู้รับผิดชอบดำเนินการตามเรื่องร้องเรียน |
| `admin`    | 3     | ผู้ดูแลระบบ — จัดการผู้ใช้, ดูรายงาน, ควบคุมทุกส่วนของระบบ  |

#### Permission Matrix

| Feature                          | `resident` | `staff` | `admin` |
| -------------------------------- | :--------: | :-----: | :-----: |
| **Complaints**                   |            |         |         |
| สร้างเรื่องร้องเรียนใหม่            |     ✅     |   ✅    |   ✅    |
| ดูเรื่องร้องเรียนของตัวเอง          |     ✅     |   ✅    |   ✅    |
| ดูเรื่องร้องเรียนทั้งหมด            |     ❌     |   ✅    |   ✅    |
| แก้ไขเรื่องร้องเรียนของตัวเอง       |     ✅     |   ❌    |   ✅    |
| ลบเรื่องร้องเรียน                   |     ❌     |   ❌    |   ✅    |
| **Status Management**            |            |         |         |
| เปลี่ยนสถานะ (pending → in_progress) |   ❌     |   ✅    |   ✅    |
| เปลี่ยนสถานะ (in_progress → resolved)|   ❌     |   ✅    |   ✅    |
| เปลี่ยนสถานะ (→ rejected)           |     ❌     |   ✅    |   ✅    |
| เปลี่ยนสถานะ (→ closed)             |     ❌     |   ❌    |   ✅    |
| มอบหมายงานให้ staff                |     ❌     |   ❌    |   ✅    |
| **Comments**                     |            |         |         |
| เพิ่มความคิดเห็น                    |     ✅     |   ✅    |   ✅    |
| ดูความคิดเห็น                      |     ✅     |   ✅    |   ✅    |
| ลบความคิดเห็น (ของตัวเอง)           |     ✅     |   ✅    |   ✅    |
| ลบความคิดเห็น (ของคนอื่น)           |     ❌     |   ❌    |   ✅    |
| **Admin Panel**                  |            |         |         |
| เข้าถึง Admin Dashboard            |     ❌     |   ❌    |   ✅    |
| จัดการผู้ใช้ (CRUD)                 |     ❌     |   ❌    |   ✅    |
| ดูรายงานสรุป                       |     ❌     |   ✅    |   ✅    |
| ดู Audit Logs                     |     ❌     |   ❌    |   ✅    |
| เปลี่ยน role ผู้ใช้                  |     ❌     |   ❌    |   ✅    |
| ปิดการใช้งานผู้ใช้ (is_active)       |     ❌     |   ❌    |   ✅    |

#### Page Access Matrix

| Page / Route                         | `resident` | `staff` | `admin` |
| ------------------------------------ | :--------: | :-----: | :-----: |
| **Auth Group**                       |            |         |         |
| `/login`                             |     ✅     |   ✅    |   ✅    |
| `/register`                          |     ✅     |   ❌    |   ❌    |
| `/forgot-password`                   |     ✅     |   ✅    |   ✅    |
| **Resident Group** `/resident/*`     |            |         |         |
| `/dashboard`                         |     ✅     |   ❌    |   ❌    |
| `/complaints`                        |     ✅     |   ❌    |   ❌    |
| `/complaints/new`                    |     ✅     |   ❌    |   ❌    |
| `/complaints/:id`                    |     ✅     |   ❌    |   ❌    |
| `/profile`                           |     ✅     |   ❌    |   ❌    |
| **Staff Group** `/staff/*`           |            |         |         |
| `/dashboard`                         |     ❌     |   ✅    |   ❌    |
| `/complaints`                        |     ❌     |   ✅    |   ❌    |
| `/complaints/:id`                    |     ❌     |   ✅    |   ❌    |
| `/profile`                           |     ❌     |   ✅    |   ❌    |
| **Admin Group** `/admin/*`           |            |         |         |
| `/dashboard`                         |     ❌     |   ❌    |   ✅    |
| `/users`                             |     ❌     |   ❌    |   ✅    |
| `/reports`                           |     ❌     |   ❌    |   ✅    |
| `/logs`                              |     ❌     |   ❌    |   ✅    |

#### Status Transition Rules

```
ใครสามารถเปลี่ยนสถานะอะไรได้บ้าง:

resident:  ไม่สามารถเปลี่ยนสถานะได้ (ดูอย่างเดียว)

staff:     pending ──────► in_progress   (รับเรื่อง)
           in_progress ──► resolved      (แก้ไขเสร็จ)
           pending ──────► rejected      (ปฏิเสธเรื่อง)
           in_progress ──► pending       (ส่งกลับรอข้อมูลเพิ่ม)

admin:     ทำได้ทุกอย่างที่ staff ทำได้ +
           resolved ─────► closed        (ยืนยันปิดเรื่อง)
           แก้ไขสถานะใดก็ได้ (override)
```

### Auth Middleware Example

```typescript
// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded as { id: string; role: string };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

### Role Middleware Example

```typescript
// backend/src/middlewares/role.middleware.ts
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint               | Description          | Auth |
| ------ | ---------------------- | -------------------- | ---- |
| POST   | `/api/auth/register`   | สมัครสมาชิก           | ❌   |
| POST   | `/api/auth/login`      | เข้าสู่ระบบ           | ❌   |
| POST   | `/api/auth/refresh`    | Refresh token        | ❌   |
| POST   | `/api/auth/logout`     | ออกจากระบบ           | ✅   |

### Complaints

| Method | Endpoint                        | Description             | Auth   |
| ------ | ------------------------------- | ----------------------- | ------ |
| GET    | `/api/complaints`               | ดูรายการร้องเรียน         | ✅     |
| GET    | `/api/complaints/:id`           | ดูรายละเอียด             | ✅     |
| POST   | `/api/complaints`               | สร้างร้องเรียนใหม่        | ✅     |
| PATCH  | `/api/complaints/:id`           | อัปเดตร้องเรียน          | ✅     |
| PATCH  | `/api/complaints/:id/status`    | เปลี่ยนสถานะ            | Staff+ |
| DELETE | `/api/complaints/:id`           | ลบร้องเรียน             | Admin  |

### Comments

| Method | Endpoint                              | Description       | Auth |
| ------ | ------------------------------------- | ----------------- | ---- |
| GET    | `/api/complaints/:id/comments`        | ดูความคิดเห็น      | ✅   |
| POST   | `/api/complaints/:id/comments`        | เพิ่มความคิดเห็น    | ✅   |

### Admin

| Method | Endpoint              | Description       | Auth  |
| ------ | --------------------- | ----------------- | ----- |
| GET    | `/api/admin/users`    | ดูผู้ใช้ทั้งหมด     | Admin |
| PATCH  | `/api/admin/users/:id`| แก้ไขผู้ใช้         | Admin |
| GET    | `/api/admin/reports`  | ดูรายงานสรุป       | Admin |
| GET    | `/api/admin/logs`     | ดู Audit Logs     | Admin |

---

## 🛡 Security

| Feature                | Implementation                              |
| ---------------------- | ------------------------------------------- |
| Password Hashing       | bcrypt (salt rounds: 12)                    |
| JWT                    | Access + Refresh Token, HttpOnly Cookie     |
| Rate Limiting          | express-rate-limit (100 req/15min)          |
| CORS                   | Whitelist allowed origins                   |
| Helmet                 | HTTP security headers                       |
| Input Validation       | Zod schema validation                       |
| SQL Injection          | Parameterized queries via Supabase client   |
| XSS Protection         | React auto-escape + DOMPurify               |
| CSRF                   | SameSite cookie + CSRF token                |
| File Upload            | Type/size validation, Supabase Storage      |
| Row Level Security     | Supabase RLS policies per table             |
| HTTPS                  | Enforced in production                      |
| Environment Variables  | dotenv, never commit secrets                |

---

## 📝 Logging

### Winston Configuration

```typescript
// backend/src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Log Levels

| Level   | Usage                                     |
| ------- | ----------------------------------------- |
| `error` | System errors, unhandled exceptions        |
| `warn`  | Auth failures, invalid requests            |
| `info`  | Login/logout, CRUD operations, status changes |
| `debug` | Development-only detailed logs             |

### Morgan (HTTP Access Logs)

```typescript
import morgan from 'morgan';
app.use(morgan('combined', { stream: accessLogStream }));
```

### Audit Log (Database)

ทุกการเปลี่ยนแปลงสำคัญจะถูกบันทึกลง `audit_logs` table:

```json
{
  "user_id": "uuid",
  "action": "UPDATE_STATUS",
  "entity": "complaint",
  "entity_id": "uuid",
  "details": { "from": "pending", "to": "in_progress" },
  "ip_address": "192.168.1.1"
}
```

---

## 📱 Responsive Design

- **Mobile First** approach ด้วย Tailwind CSS breakpoints
- Breakpoints: `sm:640px` / `md:768px` / `lg:1024px` / `xl:1280px`
- Sidebar จะ collapse เป็น hamburger menu บน mobile
- Table จะแปลงเป็น card view บนหน้าจอเล็ก
- Touch-friendly UI elements (min tap target 44px)

---

## 🚀 การติดตั้ง (Installation)

### Prerequisites

- Node.js >= 18
- npm >= 9
- Supabase account

### 1. Clone & Install

```bash
git clone <repository-url>
cd sena

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# backend/.env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev        # http://localhost:3000

# Terminal 2 - Backend
cd backend && npm run dev         # http://localhost:5000
```

---

## 📊 Complaint Status Flow

```
 ┌─────────┐    Staff รับเรื่อง    ┌─────────────┐    แก้ไขเสร็จ    ┌──────────┐
 │ Pending  │ ─────────────────► │ In Progress  │ ──────────────► │ Resolved │
 └─────────┘                     └─────────────┘                  └──────────┘
      │                                │                               │
      │  ไม่ตรงเงื่อนไข                  │  ต้องการข้อมูลเพิ่ม               │  ยืนยันปิดเรื่อง
      ▼                                ▼                               ▼
 ┌──────────┐                    ┌─────────────┐                 ┌────────┐
 │ Rejected │                    │   Pending   │                 │ Closed │
 └──────────┘                    └─────────────┘                 └────────┘
```

---

## 👥 ทีมพัฒนา

- **Project**: SENA Complaint Management System
- **Version**: 1.0.0
- **License**: MIT
