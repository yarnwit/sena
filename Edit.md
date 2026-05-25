# 📋 Edit.md — รายการสิ่งที่ต้องแก้ไข

> **วันที่วิเคราะห์:** 25 พ.ค. 2569  
> **หัวข้อหลัก:** เมื่อแอดมิน/นิติกดอนุมัติ (resolved) หรือไม่อนุมัติ (rejected) → ลูกบ้านต้องเห็นผลและสถานะ  
> **อ้างอิง:** `README.md`, `AGENTS.md`

---

## 📖 อ้างอิง Spec จาก README.md

### Status Flow ตาม README.md (บรรทัด 654–666)

```
Pending ──► In Progress ──► Resolved ──► Closed
  │               │
  │ (rejected)    │ (ส่งกลับ)
  ▼               ▼
Rejected        Pending
```

> ⚠️ **หมายเหตุ:** ใน README.md **ไม่มีสถานะ `approved`** — สถานะที่ใช้แทน "อนุมัติ" คือ `resolved` (แก้ไขเสร็จ)
> แต่ใน Frontend ปัจจุบันมี statusConfig สำหรับ `approved` อยู่แล้วทั้งฝั่ง resident และ staff → **เป็นสิ่งที่เพิ่มนอกเหนือ spec**

### Status Transition Rules ตาม README.md (บรรทัด 414–429)

| Role       | Transition ที่ทำได้ |
|-----------|---------------------|
| `resident` | ❌ ไม่สามารถเปลี่ยนสถานะได้ (ดูอย่างเดียว) |
| `staff`    | `pending → in_progress`, `in_progress → resolved`, `pending → rejected`, `in_progress → pending` |
| `admin`    | ทำได้ทุกอย่างที่ staff ทำ + `resolved → closed` + override ทุกสถานะ |

### Permission Matrix ตาม README.md (บรรทัด 360–387)

| Feature | resident | staff | admin |
|---------|:--------:|:-----:|:-----:|
| ดูเรื่องร้องเรียนของตัวเอง | ✅ | ✅ | ✅ |
| เปลี่ยนสถานะ (→ rejected) | ❌ | ✅ | ✅ |
| เปลี่ยนสถานะ (→ closed) | ❌ | ❌ | ✅ |

### DB Schema ตาม README.md (บรรทัด 296–311)

- `complaints` table มี field `petition VARCHAR(255)` → ใช้เก็บ **ความเห็นคณะกรรมการ**
- `status VARCHAR(50) DEFAULT 'pending'` → ค่าเริ่มต้นเป็น pending

### API Endpoint ตาม README.md (บรรทัด 480–489)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/api/complaints/:id/status` | เปลี่ยนสถานะ (Staff+) |
| `PATCH` | `/api/complaints/:id` | อัปเดตร้องเรียน |

### AGENTS.md — กฎที่ต้องปฏิบัติตาม

- ⚙️ Backend: ทุก API Endpoint ต้องมี Middleware ป้องกันสิทธิ์ (`authenticate`, `authorize`) ตาม Permission Matrix
- ⚙️ Backend: บันทึกทุกการเปลี่ยนแปลงสถานะ (Status Flow) ลงใน `AuditLog` เสมอ
- ⚙️ Backend: คืนค่า Response ตามมาตรฐาน `response.util.ts`
- ⚙️ Backend: ใช้ Parameterized queries ผ่าน Supabase Client
- 🖥 Frontend: ห้ามใส่ Business Logic ที่ซับซ้อนใน UI Component → แยกไปไว้ใน Custom Hooks
- 🧪 QA: ต้องทำ State Transition Testing ตาม Status Flow

---

## 🔴 ปัญหา Critical — ระบบไม่ทำงานตาม Spec

### 1. ❌ Staff Detail Page ใช้ HTTP Method ผิด (PUT แทน PATCH)

> **อ้างอิง:** README.md API Endpoints (บรรทัด 488) กำหนด `PATCH /api/complaints/:id/status`

**ไฟล์:** `frontend/app/staff/complaints/[id]/page.tsx` (บรรทัด 160–163)

```typescript
// ❌ ปัจจุบัน: ใช้ PUT
const res = await fetch(`${API_URL}/complaints/staff/${complaint.complaint_id}/status`, {
  method: "PUT",  // ❌ ผิดตาม spec
```

**Backend route กำหนดเป็น PATCH:**
```typescript
// backend/src/routes/complaint.routes.ts (บรรทัด 34)
router.patch('/staff/:id/status', authenticate, authorize('staff', 'admin'), updateComplaintStatus);
```

**สิ่งที่ต้องแก้:**
```typescript
method: "PATCH",  // ✅ ตรงตาม README.md spec
```

**ผลกระทบ:** Staff/Admin กดเปลี่ยนสถานะ → ได้ 404 หรือ Method Not Allowed → **ลูกบ้านไม่เคยเห็นสถานะเปลี่ยน**

---

### 2. ❌ Staff ไม่สามารถกรอก `petition` (ความเห็นคณะกรรมการ) ได้

> **อ้างอิง:** README.md DB Schema (บรรทัด 310) มี field `petition VARCHAR(255)` ใน complaints table

**ปัจจุบัน:** ในหน้า staff detail มีส่วน "ความเห็นคณะกรรมการ" แต่เป็น **read-only** → ไม่มี textarea ให้กรอก

**ไฟล์ที่เกี่ยวข้อง:**

#### 2.1 Frontend — ขาด textarea กรอก petition
**ไฟล์:** `frontend/app/staff/complaints/[id]/page.tsx` (บรรทัด 354–362)

```tsx
// ❌ ปัจจุบัน: แสดงอย่างเดียว ไม่มีช่องกรอก
<div className="bg-white border border-gray-200 rounded-2xl p-5 min-h-[140px] relative">
  <div className="pl-10 text-xs ...">
    {complaint.petition || ""}
  </div>
</div>
```

**สิ่งที่ต้องแก้:**
```tsx
// ✅ เพิ่ม textarea ให้ staff/admin กรอก petition
<textarea
  value={petition}
  onChange={(e) => setPetition(e.target.value)}
  placeholder="กรอกเหตุผลประกอบการพิจารณา..."
  className="w-full min-h-[140px] p-4 rounded-2xl border border-gray-200 text-sm ..."
/>
```

#### 2.2 Backend Controller — ไม่ส่ง petition ไป service

> **อ้างอิง AGENTS.md:** คืนค่า Response ตามมาตรฐาน `response.util.ts`

**ไฟล์:** `backend/src/controllers/complaint.controller.ts` (บรรทัด 106–120)

```typescript
// ❌ ปัจจุบัน: รับแค่ status
const result = await ComplaintService.updateStatus(req.params.id, req.body.status, userId, role);
```

**สิ่งที่ต้องแก้:**
```typescript
// ✅ รับ petition ด้วย
const { status, petition } = req.body;
const result = await ComplaintService.updateStatus(req.params.id, status, userId, role, petition);
```

#### 2.3 Backend Service — updateStatus ไม่รับ petition

**ไฟล์:** `backend/src/services/complaint.service.ts` (บรรทัด 252–278)

```typescript
// ❌ ปัจจุบัน: ไม่มี parameter petition
async updateStatus(complaintId, newStatus, userId, role) { ... }
```

**สิ่งที่ต้องแก้:**
```typescript
// ✅ เพิ่ม petition parameter
async updateStatus(complaintId, newStatus, userId, role, petition?: string) {
  // ... existing validation ...
  const result = await ComplaintModel.updateStatus(complaintId, newStatus, petition);
  // ...
}
```

#### 2.4 Backend Model — updateStatus ไม่อัปเดต petition

**ไฟล์:** `backend/src/models/Complaint.model.ts` (บรรทัด 135–145)

```typescript
// ❌ ปัจจุบัน: อัปเดตแค่ status
async updateStatus(complaintId, status) {
  const { data } = await supabase
    .from('complaints')
    .update({ status })  // ← ขาด petition
```

**สิ่งที่ต้องแก้:**
```typescript
// ✅ อัปเดต petition ด้วย
async updateStatus(complaintId, status, petition?: string) {
  const updateData: Record<string, any> = { status };
  if (petition !== undefined) {
    updateData.petition = petition;
  }
  const { data } = await supabase
    .from('complaints')
    .update(updateData)
    .eq('complaint_id', complaintId)
    .select()
    .single();
}
```

---

### 3. ❌ Badge อนุมัติ/ไม่อนุมัติ ฝั่ง Staff ไม่ interactive

> **อ้างอิง:** README.md Status Management — staff ต้องสามารถเปลี่ยนสถานะ `→ rejected` ได้ (บรรทัด 373)  
> **อ้างอิง AGENTS.md:** Frontend — ต้องรองรับ UX ที่ใช้งานง่าย

**ไฟล์:** `frontend/app/staff/complaints/[id]/page.tsx` (บรรทัด 336–345)

ปัจจุบัน badge "อนุมัติ" / "ไม่อนุมัติ" เป็น `<div>` ไม่ใช่ `<button>` → Staff ต้องไปเลือกจาก dropdown ซึ่งไม่ intuitive

**สิ่งที่ต้องแก้:**
```tsx
// ✅ เปลี่ยนเป็น <button> ที่คลิกได้
<button
  onClick={() => setSelectedStatus('resolved')}  // "อนุมัติ" = resolved ตาม spec
  className="flex items-center gap-3 px-6 py-2.5 bg-white border cursor-pointer ..."
>
  <CheckCircleIcon active={selectedStatus === 'resolved'} />
  <span>อนุมัติ</span>
</button>

<button
  onClick={() => setSelectedStatus('rejected')}  // "ไม่อนุมัติ" = rejected ตาม spec
  className="flex items-center gap-3 px-6 py-2.5 bg-white border cursor-pointer ..."
>
  <XCircleIcon active={selectedStatus === 'rejected'} />
  <span>ไม่อนุมัติ</span>
</button>
```

---

## 🟡 ปัญหา Medium — ไม่ตรง Spec แต่ไม่ทำให้ระบบพัง

### 4. ⚠️ Frontend มีสถานะ `approved` แต่ README.md ไม่มี

> **อ้างอิง:** README.md Status Flow (บรรทัด 654–666) กำหนดสถานะ: `pending`, `in_progress`, `resolved`, `rejected`, `closed` **ไม่มี `approved`**

**ไฟล์ที่มี `approved` อยู่ใน statusConfig (นอก spec):**

| ไฟล์ | บรรทัด | สิ่งที่พบ |
|------|--------|----------|
| `frontend/app/resident/complaints/page.tsx` | 21 | `approved: { label: "อนุมัติ", ... }` |
| `frontend/app/resident/complaints/[id]/page.tsx` | 35 | `approved: { label: "อนุมัติ", ... }` |
| `frontend/app/resident/dashboard/page.tsx` | 40–43 | `approved` ใน statusConfig + Stats card นับ approved |
| `frontend/app/staff/complaints/page.tsx` | 27 | `approved: { label: "อนุมัติ", ... }` |
| `frontend/app/staff/complaints/[id]/page.tsx` | 44 | `approved: { label: "อนุมัติ", ... }` |

**ต้องตัดสินใจ:**

| ทางเลือก | คำอธิบาย | ข้อดี | ข้อเสีย |
|----------|---------|------|---------|
| **A: ลบ `approved` ออก** | ใช้ `resolved` แทน "อนุมัติ" ตาม README spec | ตรง spec ดั้งเดิม | ต้องแก้ UI wording ทั้งหมด |
| **B: เพิ่ม `approved` เข้า spec** | อัปเดต README + Backend ให้รองรับ | มีสถานะแยกชัดเจน | ต้องแก้ README + Backend transitions |

> 💡 **แนะนำทางเลือก A:** ใช้ `resolved` = "อนุมัติ/แก้ไขแล้ว" ตาม README spec เดิม เพื่อไม่ต้องแก้ Backend transition rules เยอะ
> ส่วน badge "อนุมัติ"/"ไม่อนุมัติ" ในหน้า detail ให้ผูกกับ `resolved` / `rejected` ตามลำดับ

---

### 5. ⚠️ Filter Tabs ขาดบางสถานะ (ทั้งฝั่ง resident และ staff)

> **อ้างอิง:** README.md Status Flow มี 5 สถานะ: `pending`, `in_progress`, `resolved`, `rejected`, `closed`

**ไฟล์ resident:** `frontend/app/resident/complaints/page.tsx` (บรรทัด 26–33)

```typescript
// ❌ ปัจจุบัน: ไม่มี filter สำหรับ "approved" (ถ้าเลือกทางเลือก B)
// ✅ ถ้าเลือกทางเลือก A: filter ปัจจุบันครบแล้ว (ไม่ต้องมี approved)
```

**ไฟล์ staff:** `frontend/app/staff/complaints/page.tsx` (บรรทัด 32–39) — เหมือนกัน

**สิ่งที่ต้องแก้ (ถ้าเลือกทางเลือก B เพิ่ม approved):**
```typescript
const filterOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอดำเนินการ" },
  { key: "in_progress", label: "กำลังดำเนินการ" },
  { key: "resolved", label: "แก้ไขแล้ว" },
  { key: "approved", label: "อนุมัติ" },       // ← เพิ่มถ้าเลือกทางเลือก B
  { key: "rejected", label: "ไม่อนุมัติ" },
  { key: "closed", label: "ปิดเรื่อง" },
];
```

---

### 6. ⚠️ หน้า Detail ลูกบ้าน — ปุ่ม "แก้ไขข้อมูล" แสดงตลอดทุกสถานะ

> **อ้างอิง:** README.md Permission Matrix (บรรทัด 368) — `แก้ไขเรื่องร้องเรียนของตัวเอง: resident ✅`  
> แต่ตามหลัก Status Flow ถ้าสถานะเป็น `resolved`/`closed`/`rejected` ไม่ควรให้แก้ไขแล้ว

**ไฟล์:** `frontend/app/resident/complaints/[id]/page.tsx` (บรรทัด 195–201)

ปัจจุบันปุ่ม "แก้ไขข้อมูล" แสดงตลอดเวลา แม้สถานะจะเป็น `resolved`, `closed`, `rejected`

**สิ่งที่ต้องแก้:**
```tsx
// ✅ แสดงปุ่มแก้ไขเฉพาะสถานะ pending เท่านั้น
{complaint.status === 'pending' && (
  <Link href={`/resident/complaints/${complaintId}/edit`} ...>
    แก้ไขข้อมูล
  </Link>
)}
```

---

### 7. ⚠️ หน้า Detail ลูกบ้าน — "ผู้รับคำร้อง" แสดงเป็น hardcoded text

> **อ้างอิง AGENTS.md:** บันทึกทุกการเปลี่ยนแปลงสถานะลงใน AuditLog เสมอ → สามารถดึงชื่อผู้รับจาก AuditLog ได้

**ไฟล์:** `frontend/app/resident/complaints/[id]/page.tsx` (บรรทัด 319–322)

```typescript
// ❌ ปัจจุบัน: hardcoded
{complaint.status !== 'pending' ? "เจ้าหน้าที่รับเรื่อง" : "-"}
```

**สิ่งที่ต้องแก้ (2 วิธี):**
1. **วิธี A (ง่าย):** ดึงจาก AuditLog ที่มี `action = 'UPDATE_STATUS'` ตัวล่าสุดของเรื่องนั้น
2. **วิธี B (ดีกว่า):** เพิ่ม field `reviewed_by UUID` ใน complaints table → อัปเดตเมื่อเปลี่ยนสถานะ

---

### 8. ⚠️ Dashboard ลูกบ้าน — คอลัมน์ "บ้านเลขที่" แสดง `-` ตลอด

**ไฟล์:** `frontend/app/resident/dashboard/page.tsx` (บรรทัด 271–273)

```html
<td className="...">-</td>   <!-- ❌ hardcoded เป็น "-" -->
```

API `/complaints/my` ใช้ `findByResidentId()` ซึ่ง select เฉพาะ `complaint_id, ticket_no, subject, status, reported_date, description` → ไม่มี `house_no`

**สิ่งที่ต้องแก้:** เอาคอลัมน์ "บ้านเลขที่" ออกจากตาราง Dashboard (ลูกบ้านรู้บ้านเลขที่ตัวเองอยู่แล้ว) หรือดึง house_no จาก user info ที่ได้จาก API `/complaints/user-info`

---

### 9. ⚠️ Staff Dropdown ขาดตัวเลือกสถานะบางตัว

> **อ้างอิง:** README.md Status Transition Rules (บรรทัด 421–424)

**ไฟล์:** `frontend/app/staff/complaints/[id]/page.tsx` (บรรทัด 99–104)

```typescript
// ❌ ปัจจุบัน:
const availableStatuses = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "resolved", label: "แก้ไขแล้ว" },
  { value: "rejected", label: "ปฏิเสธ" },
  // ❌ ขาด "closed" — admin ต้องใช้ (README บรรทัด 374, 427)
];
```

**สิ่งที่ต้องแก้:**
```typescript
// ✅ เพิ่ม closed สำหรับ admin
const availableStatuses = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังดำเนินการ" },
  { value: "resolved", label: "แก้ไขแล้ว/อนุมัติ" },
  { value: "rejected", label: "ไม่อนุมัติ" },
  { value: "closed", label: "ปิดเรื่อง" },       // ← เพิ่มตาม README spec
];
```

> 💡 **ถ้าต้องการควบคุมละเอียดขึ้น:** ควร filter ตัวเลือกตาม role ของผู้ใช้ (staff เห็นเฉพาะสถานะที่ตัวเองเปลี่ยนได้ตาม transition rules)

---

## 🟢 สิ่งที่ทำถูกต้องตาม Spec แล้ว

| ✅ สิ่งที่ถูกต้อง | อ้างอิง |
|------------------|---------|
| Backend มี AuditLog บันทึกทุกการเปลี่ยนสถานะ | AGENTS.md + README.md (บรรทัด 574–587) |
| Backend ใช้ Supabase parameterized queries | AGENTS.md |
| Response ใช้ `sendSuccess`/`sendError` จาก `response.util.ts` | AGENTS.md |
| Route protection ด้วย `authenticate` + `authorize` middleware | README.md (บรรทัด 234–243) + AGENTS.md |
| Resident ไม่สามารถเปลี่ยนสถานะได้ (backend `validateStatusTransition` return false) | README.md (บรรทัด 419) |
| Staff transitions ตรงกับ spec (`STAFF_TRANSITIONS` ใน complaint.service.ts) | README.md (บรรทัด 421–424) |
| Admin override ทุกสถานะ (`return true` ใน validateStatusTransition) | README.md (บรรทัด 426–428) |
| หน้า Detail ลูกบ้าน แสดง badge อนุมัติ/ไม่อนุมัติ ตามสถานะ | ✅ UI พร้อมแล้ว |
| หน้า Detail ลูกบ้าน แสดง petition (ความเห็นคณะกรรมการ) | ✅ UI พร้อมแล้ว |
| Dashboard ลูกบ้าน นับสถานะ approved/rejected แยก | ✅ UI พร้อมแล้ว |

---

## 📊 สรุปรายการแก้ไขทั้งหมด

| # | ไฟล์ | ปัญหา | อ้างอิง Spec | ความสำคัญ |
|---|------|-------|-------------|-----------|
| 1 | `frontend/.../staff/[id]/page.tsx` | ใช้ PUT แทน PATCH | README บรรทัด 488 | 🔴 Critical |
| 2a | `frontend/.../staff/[id]/page.tsx` | ไม่มี textarea กรอก petition | README บรรทัด 310 (DB: petition) | 🔴 Critical |
| 2b | `backend/controllers/complaint.controller.ts` | ไม่ส่ง petition ไป service | AGENTS.md (ครบ flow) | 🔴 Critical |
| 2c | `backend/services/complaint.service.ts` | updateStatus ไม่รับ petition | AGENTS.md (ครบ flow) | 🔴 Critical |
| 2d | `backend/models/Complaint.model.ts` | updateStatus ไม่อัปเดต petition | README บรรทัด 310 | 🔴 Critical |
| 3 | `frontend/.../staff/[id]/page.tsx` | Badge อนุมัติ/ไม่อนุมัติ กดไม่ได้ | README Status Management | 🟠 High |
| 4 | หลายไฟล์ Frontend | มี `approved` status นอก spec | README บรรทัด 654–666 | 🟡 ต้องตัดสินใจ |
| 5 | `frontend/.../resident/complaints/page.tsx` + staff | Filter tabs อาจขาดสถานะ | README Status Flow | 🟡 Medium |
| 6 | `frontend/.../resident/[id]/page.tsx` | ปุ่มแก้ไขแสดงตลอดทุกสถานะ | README Permission Matrix | 🟡 Medium |
| 7 | `frontend/.../resident/[id]/page.tsx` | ชื่อผู้รับคำร้อง hardcoded | AGENTS.md (AuditLog) | 🟡 Medium |
| 8 | `frontend/.../resident/dashboard/page.tsx` | บ้านเลขที่แสดง `-` ตลอด | — | 🟢 Low |
| 9 | `frontend/.../staff/[id]/page.tsx` | Dropdown ขาด `closed` | README บรรทัด 374, 427 | 🟡 Medium |

---

## 🔄 ลำดับการแก้ไขที่แนะนำ

### Phase 1: แก้ Critical (ระบบใช้งานได้)
1. **แก้ HTTP Method** — PUT → PATCH (`frontend/.../staff/[id]/page.tsx`)
2. **แก้ Backend** — ให้ updateStatus รับ petition ได้ (Model → Service → Controller)
3. **แก้ Frontend Staff** — เพิ่ม textarea กรอก petition + ส่งไปกับ request

### Phase 2: แก้ High (UX ดีขึ้น)
4. **เปลี่ยน Badge** — ให้กดได้ (set selectedStatus เป็น resolved/rejected)
5. **เพิ่ม `closed`** — ใน dropdown สำหรับ admin

### Phase 3: แก้ Medium (ตรง spec มากขึ้น)
6. **ตัดสินใจเรื่อง `approved`** — ลบออก หรือ เพิ่มเข้า spec
7. **ซ่อนปุ่มแก้ไข** — เมื่อสถานะไม่ใช่ pending
8. **แก้ผู้รับคำร้อง** — ดึงจาก AuditLog
9. **แก้ filter tabs** — ให้ครบตาม Status Flow

### Phase 4: แก้ Low (polish)
10. **แก้ Dashboard** — คอลัมน์บ้านเลขที่

---

## 🧪 การทดสอบหลังแก้ไข (ตาม AGENTS.md — QA Agent)

### State Transition Testing (อ้างอิง AGENTS.md QA Agent)

| Test Case | Input | Expected | อ้างอิง |
|-----------|-------|----------|---------|
| TC-1: Staff รับเรื่อง | `pending → in_progress` | ✅ สำเร็จ | README บรรทัด 421 |
| TC-2: Staff แก้ไขเสร็จ (อนุมัติ) | `in_progress → resolved` + petition | ✅ สำเร็จ + petition ถูกบันทึก | README บรรทัด 422 |
| TC-3: Staff ไม่อนุมัติ | `pending → rejected` + petition | ✅ สำเร็จ + petition ถูกบันทึก | README บรรทัด 423 |
| TC-4: Admin ปิดเรื่อง | `resolved → closed` | ✅ สำเร็จ | README บรรทัด 427 |
| TC-5: Staff ลอง close | `resolved → closed` | ❌ ไม่อนุญาต | README บรรทัด 374 |
| TC-6: Resident ลองเปลี่ยนสถานะ | ใดก็ได้ | ❌ ไม่อนุญาต | README บรรทัด 419 |

### Resident Visibility Testing

| Test Case | สิ่งที่ต้องเห็น | ผลที่คาดหวัง |
|-----------|----------------|-------------|
| TC-7: ลูกบ้านดูเรื่องที่ resolved | เห็นสถานะ "แก้ไขแล้ว" + badge อนุมัติ + petition | ✅ |
| TC-8: ลูกบ้านดูเรื่องที่ rejected | เห็นสถานะ "ไม่อนุมัติ" + badge ไม่อนุมัติ + petition | ✅ |
| TC-9: ลูกบ้านกรอง filter "ไม่อนุมัติ" | เห็นเฉพาะเรื่อง rejected | ✅ |
| TC-10: ลูกบ้าน Dashboard | ตัวเลขสถานะถูกต้อง | ✅ |

### Decision Table Testing (อ้างอิง AGENTS.md QA Agent)

| สถานะปัจจุบัน | Staff → in_progress | Staff → resolved | Staff → rejected | Staff → closed | Admin → closed |
|:---:|:---:|:---:|:---:|:---:|:---:|
| pending | ✅ | ❌ | ✅ | ❌ | ✅ (override) |
| in_progress | ❌ | ✅ | ❌ | ❌ | ✅ (override) |
| resolved | ❌ | — | ❌ | ❌ | ✅ |
| rejected | ❌ | ❌ | — | ❌ | ✅ (override) |
| closed | ❌ | ❌ | ❌ | — | — |
