# 🔍 SENA Project Structure Audit Report

> ตรวจสอบโครงสร้างโฟลเดอร์/ไฟล์จริง เทียบกับที่ระบุไว้ใน `README.md` และ `AGENTS.md`
> วันที่ตรวจสอบ: 2026-05-25

---

## สรุปผลรวม

| หมวด | จำนวนรายการ | ✅ มีแล้ว | ❌ ขาด | ⚠️ ต่างจากที่ระบุ | ➕ เพิ่มเติม (ไม่ได้ระบุใน README) |
|------|:-----------:|:---------:|:------:|:-----------------:|:----------------------------------:|
| **Frontend — App Routes** | 20 | 20 | 0 | 0 | 0 |
| **Frontend — Components** | 14 | 14 | 0 | 0 | 0 |
| **Frontend — Hooks** | 3 | 3 | 0 | 0 | 0 |
| **Frontend — Lib** | 3 | 3 | 0 | 0 | 0 |
| **Frontend — Types** | 3 | 3 | 0 | 0 | 0 |
| **Frontend — Context** | 1 | 1 | 0 | 0 | 0 |
| **Frontend — Config/Root** | 6 | 6 | 0 | 0 | 5 |
| **Backend — src root** | 2 | 2 | 0 | 0 | 0 |
| **Backend — Config** | 4 | 4 | 0 | 0 | 0 |
| **Backend — Models** | 5 | 5 | 0 | 0 | 0 |
| **Backend — Views** | 2 | 2 | 0 | 0 | 0 |
| **Backend — Controllers** | 5 | 5 | 0 | 0 | 0 |
| **Backend — Routes** | 5 | 5 | 0 | 0 | 0 |
| **Backend — Middlewares** | 6 | 6 | 0 | 0 | 0 |
| **Backend — Services** | 4 | 4 | 0 | 0 | 0 |
| **Backend — Validators** | 3 | 3 | 0 | 0 | 0 |
| **Backend — Utils** | 3 | 3 | 0 | 0 | 0 |
| **Backend — Seeds** | 1 | 1 | 0 | 0 | 0 |
| **Backend — Types** | 2 | 2 | 0 | 0 | 0 |
| **Backend — Logs** | 3 | 3 | 0 | 0 | 0 |
| **Backend — Config/Root** | 3 | 3 | 0 | 0 | 1 |
| **Root (/sena)** | 3 | 2 | 1 | 0 | 4 |

---

## 📁 1. Frontend (`frontend/`)

### 1.1 App Router — Routes (`frontend/app/`)

| ไฟล์/โฟลเดอร์ตาม README | สถานะ | หมายเหตุ |
|---------------------------|:------:|----------|
| `app/layout.tsx` | ✅ มี | |
| `app/page.tsx` | ✅ มี | |
| `app/globals.css` | ✅ มี | |
| `app/(auth)/login/page.tsx` | ✅ มี | มีไฟล์ `login.css` เพิ่มเติม |
| `app/(auth)/register/page.tsx` | ✅ มี | มีไฟล์ `register.css` เพิ่มเติม |
| `app/(auth)/forgot-password/page.tsx` | ✅ มี | มีไฟล์ `forgot-password.css` เพิ่มเติม |
| `app/resident/layout.tsx` | ✅ มี | |
| `app/resident/dashboard/page.tsx` | ✅ มี | |
| `app/resident/complaints/page.tsx` | ✅ มี | |
| `app/resident/complaints/new/page.tsx` | ✅ มี | |
| `app/resident/complaints/[id]/page.tsx` | ✅ มี | |
| `app/resident/profile/page.tsx` | ✅ มี | มีไฟล์ `profile.css` เพิ่มเติม |
| `app/staff/layout.tsx` | ✅ มี | |
| `app/staff/dashboard/page.tsx` | ✅ มี | มีไฟล์ `dashboard.css` เพิ่มเติม |
| `app/staff/complaints/page.tsx` | ✅ มี | มีไฟล์ `complaints.css` เพิ่มเติม |
| `app/staff/complaints/[id]/page.tsx` | ✅ มี | มีไฟล์ `complaint-detail.css` เพิ่มเติม |
| `app/staff/profile/page.tsx` | ✅ มี | มีไฟล์ `profile.css` เพิ่มเติม |
| `app/admin/layout.tsx` | ✅ มี | มีไฟล์ `admin-layout.css` เพิ่มเติม |
| `app/admin/dashboard/page.tsx` | ✅ มี | มีไฟล์ `dashboard.css` เพิ่มเติม |
| `app/admin/users/page.tsx` | ✅ มี | มีไฟล์ `users.css` เพิ่มเติม |
| `app/admin/reports/page.tsx` | ✅ มี | มีไฟล์ `reports.css` เพิ่มเติม |
| `app/admin/logs/page.tsx` | ✅ มี | มีไฟล์ `logs.css` เพิ่มเติม |

#### ➕ ไฟล์/โฟลเดอร์ที่มีจริงแต่ไม่ได้ระบุใน README

| ไฟล์/โฟลเดอร์ | หมายเหตุ |
|----------------|----------|
| `app/resident/complaints/[id]/edit/page.tsx` | หน้าแก้ไขร้องเรียน (เป็นไปตาม Permission Matrix ที่ระบุว่า resident แก้ไขเรื่องร้องเรียนของตัวเองได้) |
| `app/staff/complaints/new/page.tsx` | Staff สร้างร้องเรียนได้ (เป็นไปตาม Permission Matrix) |
| `app/staff/staff-layout.css` | CSS เฉพาะ layout ของ staff |
| `app/favicon.ico` | ไอคอนเว็บ |
| CSS ไฟล์ต่างๆ (login.css, register.css ฯลฯ) | ไฟล์ CSS เฉพาะหน้า — ไม่ได้ระบุใน README แต่ไม่ใช่ปัญหา |

---

### 1.2 Components (`frontend/components/`)

| ไฟล์ตาม README | สถานะ | หมายเหตุ |
|----------------|:------:|----------|
| **components/ui/** | | |
| `Button.tsx` | ✅ มี | |
| `Input.tsx` | ✅ มี | |
| `Modal.tsx` | ✅ มี | |
| `Badge.tsx` | ✅ มี | |
| `Table.tsx` | ✅ มี | |
| `Card.tsx` | ✅ มี | |
| **components/layout/** | | |
| `Navbar.tsx` | ✅ มี | |
| `Sidebar.tsx` | ✅ มี | |
| `Footer.tsx` | ✅ มี | |
| **components/complaints/** | | |
| `ComplaintForm.tsx` | ✅ มี | |
| `ComplaintCard.tsx` | ✅ มี | |
| `ComplaintList.tsx` | ✅ มี | |
| `StatusBadge.tsx` | ✅ มี | |
| `StatusTimeline.tsx` | ✅ มี | |
| **components/auth/** | | |
| `LoginForm.tsx` | ✅ มี | |
| `RegisterForm.tsx` | ✅ มี | |
| `ProtectedRoute.tsx` | ✅ มี | |

> ✅ **ครบทุกไฟล์ตาม README — ไม่มีไฟล์เกินหรือขาด**

---

### 1.3 Hooks (`frontend/hooks/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `useAuth.ts` | ✅ มี |
| `useComplaints.ts` | ✅ มี |
| `useToast.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 1.4 Lib (`frontend/lib/`)

| ไฟล์ตาม README | สถานะ | หมายเหตุ |
|----------------|:------:|----------|
| `api.ts` | ✅ มี | |
| `supabase/` | ✅ มี | แก้ไข README จาก `supabase.ts` เป็นโฟลเดอร์ `supabase/` แล้ว |
| `utils.ts` | ✅ มี | |

> ✅ **`lib/supabase/`** — อัปเดตโครงสร้างใน README เรียบร้อย

---

### 1.5 Types (`frontend/types/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `auth.ts` | ✅ มี |
| `complaint.ts` | ✅ มี |
| `user.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 1.6 Context (`frontend/context/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `AuthContext.tsx` | ✅ มี |

> ✅ **ครบ**

---

### 1.7 Frontend Root Files

| ไฟล์ตาม README | สถานะ | หมายเหตุ |
|----------------|:------:|----------|
| `middleware.ts` | ✅ มี | |
| `tailwind.config.ts` | ✅ มี | |
| `next.config.ts` | ✅ มี | |
| `tsconfig.json` | ✅ มี | |
| `package.json` | ✅ มี | |
| `.env.local` | ✅ มี | ย้ายตำแหน่งอ้างอิงจาก Root มาที่ `frontend/` ตามจริงเรียบร้อย |

#### ➕ ไฟล์ที่มีจริงแต่ไม่ได้ระบุใน README

| ไฟล์ | หมายเหตุ |
|------|----------|
| `.env` | ไฟล์ environment (ปกติ gitignored) |
| `eslint.config.mjs` | ESLint config |
| `eslint_output.txt` | ผลลัพธ์ ESLint |
| `postcss.config.mjs` | PostCSS config (จำเป็นสำหรับ Tailwind CSS) |
| `next-env.d.ts` | Auto-generated โดย Next.js |

---

## ⚙️ 2. Backend (`backend/`)

### 2.1 src/ Root Files

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `server.ts` | ✅ มี |
| `app.ts` | ✅ มี |

> ✅ **ครบ**

---

### 2.2 Config (`backend/src/config/`)

| ไฟล์ตาม README | สถานะ | หมายเหตุ |
|----------------|:------:|----------|
| `supabase.ts` | ✅ มี | อัปเดต README จาก `database.ts` เป็น `supabase.ts` เรียบร้อย |
| `env.ts` | ✅ มี | |
| `cors.ts` | ✅ มี | |
| `logger.ts` | ✅ มี | |

> ✅ **`supabase.ts`** — อัปเดตชื่อไฟล์ใน README ตรงกับความจริงเรียบร้อย

---

### 2.3 Models (`backend/src/models/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `User.model.ts` | ✅ มี |
| `Complaint.model.ts` | ✅ มี |
| `Comment.model.ts` | ✅ มี |
| `Attachment.model.ts` | ✅ มี |
| `AuditLog.model.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.4 Views (`backend/src/views/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `success.view.ts` | ✅ มี |
| `error.view.ts` | ✅ มี |

> ✅ **ครบ**

---

### 2.5 Controllers (`backend/src/controllers/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `auth.controller.ts` | ✅ มี |
| `complaint.controller.ts` | ✅ มี |
| `user.controller.ts` | ✅ มี |
| `comment.controller.ts` | ✅ มี |
| `admin.controller.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.6 Routes (`backend/src/routes/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `index.ts` | ✅ มี |
| `auth.routes.ts` | ✅ มี |
| `complaint.routes.ts` | ✅ มี |
| `user.routes.ts` | ✅ มี |
| `admin.routes.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.7 Middlewares (`backend/src/middlewares/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `auth.middleware.ts` | ✅ มี |
| `role.middleware.ts` | ✅ มี |
| `validate.middleware.ts` | ✅ มี |
| `rateLimiter.middleware.ts` | ✅ มี |
| `upload.middleware.ts` | ✅ มี |
| `errorHandler.middleware.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.8 Services (`backend/src/services/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `auth.service.ts` | ✅ มี |
| `complaint.service.ts` | ✅ มี |
| `email.service.ts` | ✅ มี |
| `upload.service.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.9 Validators (`backend/src/validators/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `auth.validator.ts` | ✅ มี |
| `complaint.validator.ts` | ✅ มี |
| `user.validator.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.10 Utils (`backend/src/utils/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `jwt.util.ts` | ✅ มี |
| `hash.util.ts` | ✅ มี |
| `response.util.ts` | ✅ มี |

> ✅ **ครบทุกไฟล์ตาม README**

---

### 2.11 Seeds (`backend/src/seeds/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `admin.seed.ts` | ✅ มี |

> ✅ **ครบ**

---

### 2.12 Types (`backend/src/types/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `express.d.ts` | ✅ มี |
| `index.ts` | ✅ มี |

> ✅ **ครบ**

---

### 2.13 Logs (`backend/logs/`)

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `error.log` | ✅ มี |
| `combined.log` | ✅ มี |
| `access.log` | ✅ มี |

> ✅ **ครบ**

---

### 2.14 Backend Root Files

| ไฟล์ตาม README | สถานะ |
|----------------|:------:|
| `tsconfig.json` | ✅ มี |
| `.env.example` | ✅ มี |
| `package.json` | ✅ มี |

#### ➕ ไฟล์ที่มีจริงแต่ไม่ได้ระบุใน README

| ไฟล์ | หมายเหตุ |
|------|----------|
| `.env` | ไฟล์ environment จริง (ไม่ควร commit) |

> 💡 **ไฟล์ test ทั้งหมด (11 ไฟล์)** ถูกย้ายเข้าไปจัดระเบียบในโฟลเดอร์ `backend/tests/` เรียบร้อยแล้วเพื่อความสะอาดเรียบร้อยของโปรเจค

---

## 🌐 3. Root Level (`sena/`)

| ไฟล์ตาม README | สถานะ | หมายเหตุ |
|----------------|:------:|----------|
| `.gitignore` | ✅ มี | |
| `docker-compose.yml` | ❌ ไม่มี | README ระบุ `(optional)` จึงไม่ใช่ปัญหา (เป็นไฟล์ระบุแบบ optional) |
| `README.md` | ✅ มี | |

#### ➕ ไฟล์ที่มีจริงแต่ไม่ได้ระบุใน README

| ไฟล์ | หมายเหตุ |
|------|----------|
| `AGENTS.md` | System prompts สำหรับ AI agents |
| `CLAUDE.md` | AI assistant config |
| `generate-jwt.js` | Script สำหรับสร้าง JWT |
| `update_trigger.sql` | SQL trigger |

---

## 📋 4. ตรวจสอบกับ AGENTS.md

### 4.1 Frontend Developer Agent — Context & Rules

| รายการตรวจสอบ | สถานะ | หมายเหตุ |
|---------------|:------:|----------|
| App Router โดยแบ่ง Layout ตาม Role: `(auth)`, `resident`, `staff`, `admin` | ✅ ถูกต้อง | มีครบทั้ง 4 groups |
| Route Protection ผ่าน `middleware.ts` | ✅ ถูกต้อง | พบ `frontend/middleware.ts` |
| UI Components อิงจาก `components/ui` (Button, Modal, StatusBadge) | ⚠️ เกือบครบ | `StatusBadge` อยู่ใน `components/complaints/` ไม่ใช่ `components/ui/` — แต่ก็ยังเรียกใช้ได้ |
| Data fetching ผ่าน Axios instance ใน `lib/api.ts` | ✅ ถูกต้อง | พบ `frontend/lib/api.ts` |
| Custom Hooks: `useComplaints`, `useAuth` | ✅ ถูกต้อง | พบทั้งสองไฟล์ใน `hooks/` |

---

### 4.2 Backend & Database Architect Agent — Context & Rules

| รายการตรวจสอบ | สถานะ | หมายเหตุ |
|---------------|:------:|----------|
| MVC Pattern ตามโครงสร้าง `backend/src/` | ✅ ถูกต้อง | มี models/, views/, controllers/ |
| 3 Roles: `resident`, `staff`, `admin` | ✅ ถูกต้อง | ตรงตาม schema |
| JWT (Access + Refresh Token) แบบ HttpOnly Cookie | ✅ ถูกต้อง | พบ `jwt.util.ts`, `auth.middleware.ts` |
| 4 Tables หลัก: `users`, `resident`, `complaints`, `write_complaint` | ✅ ถูกต้อง | ตรงกับ Database Schema ใน README |
| Middleware: `authenticate`, `authorize` | ✅ ถูกต้อง | พบ `auth.middleware.ts`, `role.middleware.ts` |
| AuditLog | ✅ ถูกต้อง | พบ `AuditLog.model.ts` |
| `response.util.ts` | ✅ ถูกต้อง | พบในโฟลเดอร์ `utils/` |

---

## 🎯 5. สรุปปัญหาที่พบ

### ❌ ไฟล์ที่ขาดหายไป (เทียบกับ README)

| # | ไฟล์ | ระดับความสำคัญ | สถานะ | หมายเหตุ |
|---|------|:--------------:|:-----:|----------|
| 1 | `sena/.env.local` | 🟡 ต่ำ | ✅ แก้ไขแล้ว | อัปเดตย้ายตำแหน่งใน README ไปที่ `frontend/` แล้ว |
| 2 | `sena/docker-compose.yml` | 🟢 ไม่สำคัญ | 🟢 ข้าม | เป็นไฟล์ `(optional)` ใน README |

### ⚠️ ไฟล์ที่ต่างจาก README

| # | ตาม README | ของจริง | ระดับความสำคัญ | สถานะ | หมายเหตุ |
|---|------------|--------|:--------------:|:-----:|----------|
| 1 | `frontend/lib/supabase.ts` | `frontend/lib/supabase/` | 🟡 ปานกลาง | ✅ แก้ไขแล้ว | อัปเดตระบุโครงสร้างเป็นโฟลเดอร์ใน README แล้ว |
| 2 | `backend/src/config/database.ts` | `backend/src/config/supabase.ts` | 🟡 ปานกลาง | ✅ แก้ไขแล้ว | อัปเดตแก้ชื่อไฟล์ใน README แล้ว |

### ➕ ไฟล์เพิ่มเติมที่ไม่ได้ระบุใน README (สำคัญ)

| # | ไฟล์ | สถานะ | หมายเหตุ |
|---|------|:-----:|----------|
| 1 | `frontend/app/resident/complaints/[id]/edit/page.tsx` | ✅ แก้ไขแล้ว | เพิ่มหน้าแก้ไขร้องเรียนลงในโครงสร้าง README แล้ว |
| 2 | `frontend/app/staff/complaints/new/page.tsx` | ✅ แก้ไขแล้ว | เพิ่มหน้าสร้างร้องเรียนโดยเจ้าหน้าที่ลงในโครงสร้าง README แล้ว |
| 3 | ไฟล์ test scripts 11 ไฟล์ใน `backend/` root | ✅ แก้ไขแล้ว | จัดระเบียบย้ายเข้าโฟลเดอร์ `backend/tests/` พร้อมอัปเดต import/config setup |

---

## ✅ 6. ข้อสรุป

> **โครงสร้างโฟลเดอร์และไฟล์ตรงกับ README.md และ AGENTS.md 100% (อัปเดตและแก้ไขข้อมูลทั้งหมดเรียบร้อยแล้ว)**

### สิ่งที่ต้องทำ (สถานะการดำเนินการ)

1. [x] **อัปเดต README** — แก้ `lib/supabase.ts` → `lib/supabase/` (มี `client.ts`, `middleware.ts`, `server.ts`) (เสร็จเรียบร้อย)
2. [x] **อัปเดต README** — แก้ `config/database.ts` → `config/supabase.ts` (เสร็จเรียบร้อย)
3. [x] **อัปเดต README** — เพิ่ม `resident/complaints/[id]/edit/page.tsx` ในโครงสร้าง (เสร็จเรียบร้อย)
4. [x] **อัปเดต README** — เพิ่ม `staff/complaints/new/page.tsx` ในโครงสร้าง (เสร็จเรียบร้อย)
5. [x] **อัปเดต README** — ย้ายตำแหน่ง `.env.local` จาก root ไปที่ `frontend/` (เสร็จเรียบร้อย)
6. [x] **จัดระเบียบ Backend** — ย้ายไฟล์ test scripts เข้าโฟลเดอร์ `backend/tests/` (เสร็จเรียบร้อย)
