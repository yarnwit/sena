import { test, expect } from '@playwright/test';

// ============================================================
// Admin E2E Tests - รวมจากไฟล์ Tests/admin_*.spec.js ทั้งหมด
// ============================================================

// ตั้ง timeout 120 วินาทีสำหรับทุก test (เพราะแต่ละ test มีหลาย step)
test.setTimeout(120_000);

// --- Helper: Login as Admin ---
async function loginAsAdmin(page) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('admin');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  // รอให้หน้า admin dashboard โหลดเสร็จ
  await page.getByRole('heading', { name: 'ภาพรวมระบบ' }).waitFor({ state: 'visible', timeout: 30000 });
}

// ============================================================
// 1. Admin Dashboard (จาก admin_dashboard.spec.js)
// ============================================================
test.describe('Admin Dashboard', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    // รอให้ dashboard โหลดข้อมูลเสร็จ
    await page.getByText('กิจกรรมล่าสุด').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.getByText('กิจกรรมล่าสุด').first().click();
    await page.getByRole('link', { name: 'จัดการผู้ใช้ →' }).click();
    await page.getByRole('link', { name: 'ภาพรวมระบบ' }).click();
    await page.getByRole('link', { name: 'ดู Logs →' }).click();
    await page.getByRole('link', { name: 'ภาพรวมระบบ' }).click();
    await page.getByRole('button', { name: 'รีเฟรช' }).click();
    await page.getByRole('link', { name: 'ดูทั้งหมด →' }).click();
    await page.goto('http://localhost:3000/admin/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('networkidle');
    // คลิกแถวแรกในตารางเรื่องร้องเรียนล่าสุด
    await page.locator('table tbody tr').first().click();
  });
});

// ============================================================
// 2. Admin Complaints (จาก admin_complaints.spec.js)
// ============================================================
test.describe('Admin Complaints', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.getByRole('link', { name: 'รายการร้องเรียนทั้งหมด' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).fill('');
    await page.getByRole('button', { name: 'รอดำเนินการ' }).click();
    await page.getByRole('button', { name: 'อนุมัติรับเรื่อง' }).click();
    await page.getByRole('button', { name: 'เข้าที่ประชุม' }).click();
    await page.getByRole('button', { name: 'กำลังดำเนินการ' }).click();
    await page.getByRole('button', { name: 'แก้ไขแล้ว' }).click();
    await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click();
    await page.getByRole('button', { name: 'ปิดเรื่อง' }).click();
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click();
    await page.getByRole('textbox').nth(1).fill('2026-06-02');
    await page.getByRole('textbox').nth(2).fill('2026-05-31');
    await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
    await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 1 สัปดาห์' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 2 สัปดาห์' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 3 สัปดาห์' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 1 เดือน' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 3 เดือน' }).click();
    await page.getByRole('button', { name: 'ย้อนหลัง 6 เดือน' }).click();
    await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
    await page.getByRole('link', { name: 'สร้างคำร้องใหม่' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '🏠 88/134 ไดโนเสาร์ พี่เต้' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('ผมอยากเสี้ยงไดโนเสาร์ไทย');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('สามารถหาได้จากไหน');
    await page.locator('div').filter({ hasText: /^📎 แนบไฟล์เอกสาร\/ รูปภาพ$/ }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'สร้างคำร้องใหม่' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'กรอกข้อมูลเอง' }).click();
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).click();
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('นายโอ');
    await page.getByRole('textbox', { name: 'นามสกุล' }).click();
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('เลี้ยง');
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).click();
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).fill('0687541258');
    await page.getByRole('textbox', { name: 'เช่น 88/' }).click();
    await page.getByRole('textbox', { name: 'เช่น 88/' }).fill('83/96');
    await page.getByRole('textbox', { name: 'เช่น 1,' }).click();
    await page.getByRole('textbox', { name: 'เช่น 1,' }).fill('2');
    await page.getByRole('textbox', { name: 'ซอย' }).click();
    await page.getByRole('textbox', { name: 'ซอย' }).fill('3');
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('โอเลี้ยงกับข้าวแดง');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('เขาไม่ซื้อมาให้');
    await page.getByText('📎 แนบไฟล์เอกสาร/ รูปภาพ').click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');
    await page.getByRole('combobox').selectOption('phone');
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'สร้างคำร้องใหม่' }).click();
    await page.getByRole('link', { name: 'ยกเลิก' }).click();
    await page.getByRole('link', { name: 'สร้างคำร้องใหม่' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'กรอกข้อมูลเอง' }).click();
    await page.getByRole('link', { name: 'ยกเลิก' }).click();
    await page.getByRole('link', { name: 'จัดการ →' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'อนุมัติ', exact: true }).click();
    await page.getByRole('textbox', { name: 'กรอกความเห็นคณะกรรมการ หรือเหตุผลประกอบการพิจารณา' }).click();
    await page.getByRole('textbox', { name: 'กรอกความเห็นคณะกรรมการ หรือเหตุผลประกอบการพิจารณา' }).fill('เห็นชอบ');
    await page.getByRole('textbox', { name: 'พิมพ์อัปเดตความคืบหน้าให้ลูกบ้านทราบ' }).click();
    await page.getByRole('textbox', { name: 'พิมพ์อัปเดตความคืบหน้าให้ลูกบ้านทราบ' }).fill('เข้าวาระประชุม');
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'อัปเดตข้อมูล' }).click();
    await page.getByRole('link', { name: 'กลับไปหน้ารายการ' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'จัดการ →' }).nth(1).click();
    await page.getByRole('link', { name: 'กลับไปหน้ารายการ' }).click();
    await page.waitForLoadState('networkidle');
    await page.locator('tr:nth-child(13) > td:nth-child(7)').locator('a, button').first().click();
    await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'อัปเดตข้อมูล' }).click();
    await page.getByRole('link', { name: 'กลับไปหน้ารายการ' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('cell', { name: 'จัดการ →' }).first().click();
    await page.getByRole('link', { name: 'แก้ไข', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'ไม่อนุมัติ' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).fill('โอเลี้ยงกับข้าวแดงและน้ำด้วย');
    await page.goto('http://localhost:3000/admin/complaints/51');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'อนุมัติ', exact: true }).click();
    await page.getByRole('link', { name: 'แก้ไข', exact: true }).click();
    await page.getByRole('link', { name: 'ยกเลิก' }).click();
    await page.getByRole('button', { name: 'ลบ' }).click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.getByRole('button', { name: 'ลบ' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'ยืนยันการลบ' }).click();
    await page.getByRole('link', { name: 'รอเข้าที่ประชุม' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาวาระการประชุม' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาวาระการประชุม' }).fill('');
    await page.getByRole('button', { name: 'พิมพ์วาระการประชุม' }).click();
    await page.getByRole('row', { name: 'เลขที่ หัวข้อ บ้านเลขที่ ชื่อลูกบ้าน สถานะ วันที่แจ้ง' }).getByRole('checkbox').check();
    await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('cell', { name: 'ผมจะสร้างเซ็นทรันสาขาดาวอังคาร' }).first().click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'นำเรื่องเข้าที่ประชุม' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'นำเรื่องเข้าที่ประชุม' }).click();
    await page.getByRole('link', { name: 'นำเรื่องเข้าที่ประชุม' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาวาระการประชุม' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาวาระการประชุม' }).fill('');
    await page.getByRole('button', { name: 'พิมพ์วาระการประชุม' }).click();
    await page.getByRole('row', { name: 'เลขที่ หัวข้อ บ้านเลขที่ ชื่อลูกบ้าน สถานะ วันที่แจ้ง' }).getByRole('checkbox').check();
    await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('cell', { name: 'ผมจะสร้างเซ็นทรันสาขาดาวอังคาร' }).first().click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'มติ: อนุมัติให้ดำเนินการ' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'มติ: อนุมัติให้ดำเนินการ' }).click();
    await page.getByText('88/134', { exact: true }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'มติ: ไม่อนุมัติ' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'มติ: ไม่อนุมัติ' }).click();
    await page.getByRole('link', { name: 'ติดตามการแก้ไขปัญหา' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).fill('');
    await page.getByRole('columnheader').filter({ hasText: /^$/ }).click();
    await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'พิมพ์เอกสารมอบหมายงาน' }).click();
    const page1 = await page1Promise;
    await page.goto('http://localhost:3000/admin/maintenance');
    await page.waitForLoadState('networkidle');
    await page.getByRole('cell', { name: 'พ.ค. 2569' }).click();
    await page.getByRole('button', { name: 'บันทึกการแก้ไขเสร็จสิ้น' }).click();
    await page.getByRole('textbox', { name: 'เช่น ทำความสะอาดพื้นที่, ตรวจสอบแล้วปกติ' }).click();
    await page.getByRole('textbox', { name: 'เช่น ทำความสะอาดพื้นที่, ตรวจสอบแล้วปกติ' }).fill('ไปหาเอาเอง');
    await page.getByRole('textbox', { name: 'เช่น 150 บาท' }).click();
    await page.getByRole('textbox', { name: 'เช่น 150 บาท' }).fill('0 บาท');
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.getByRole('button', { name: 'บันทึกการแก้ไขเสร็จสิ้น' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'ยืนยันปิดงาน' }).click();
  });
});

// ============================================================
// 3. Admin Users (จาก admin_users.spec.js)
// ============================================================
test.describe('Admin Users', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('button', { name: 'จัดการบัญชีผู้ใช้งาน' }).click();
    await page.getByRole('link', { name: 'บัญชีผู้ใช้ทั้งหมด' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).fill('');
    await page.locator('#user-role-filter').selectOption('resident');
    await page.locator('#user-role-filter').selectOption('staff');
    await page.locator('#user-role-filter').selectOption('admin');
    await page.locator('#user-role-filter').selectOption('all');
    await page.getByRole('button', { name: 'รีเฟรช' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('cell', { name: '@test_cache_1780166300934' }).click();
    await page.getByRole('cell', { name: 'ลูกบ้าน' }).first().click();
    await page.getByText('ลูกบ้าน').nth(2).click();
    await page.getByRole('cell', { name: 'T Test Cache' }).click();
    await page.getByRole('link', { name: 'ปรับสิทธิ์ผู้ใช้งาน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('row', { name: 'ไ ไดโนเสาร์ พี่เต้ @Te_Trax' }).getByRole('combobox').selectOption('staff');
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.getByRole('row', { name: 'ไ ไดโนเสาร์ พี่เต้ @Te_Trax' }).getByRole('combobox').selectOption('staff');
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.waitForLoadState('networkidle');
    await page.locator('tr:nth-child(6) > td:nth-child(4)').getByRole('combobox').selectOption('admin');
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.locator('tr:nth-child(6) > td:nth-child(4)').getByRole('combobox').selectOption('admin');
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).fill('');
    await page.locator('#user-role-filter').selectOption('resident');
    await page.locator('#user-role-filter').selectOption('staff');
    await page.locator('#user-role-filter').selectOption('admin');
    await page.locator('#user-role-filter').selectOption('all');
    await page.getByRole('button', { name: 'รีเฟรช' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ลบบัญชีผู้ใช้งาน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'ลบ' }).nth(5).click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await page.getByRole('button', { name: 'ลบ' }).nth(5).click();
    await page.getByRole('button', { name: 'ลบบัญชีถาวร' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).fill('');
    await page.locator('#user-role-filter').selectOption('resident');
    await page.locator('#user-role-filter').selectOption('staff');
    await page.locator('#user-role-filter').selectOption('admin');
    await page.getByRole('button', { name: 'รีเฟรช' }).click();
    await page.waitForLoadState('networkidle');
    await page.locator('#user-role-filter').selectOption('all');
  });
});

// ============================================================
// 4. Admin Users - New (จาก admin_users_new.spec.js)
// ============================================================
test.describe('Admin Users New', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'เพิ่มบัญชีผู้ใช้งาน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'เช่น somchai123' }).click();
    await page.getByRole('textbox', { name: 'เช่น somchai123' }).fill('IA_001');
    await page.getByRole('textbox', { name: 'ตั้งรหัสผ่าน 6 ตัวอักษรขึ้นไป' }).click();
    await page.getByRole('textbox', { name: 'ตั้งรหัสผ่าน 6 ตัวอักษรขึ้นไป' }).fill('123456');
    await page.locator('input[name="first_name"]').click();
    await page.locator('input[name="first_name"]').fill('ลุง');
    await page.locator('input[name="last_name"]').click();
    await page.locator('input[name="last_name"]').fill('เอ');
    await page.locator('input[name="phone_number"]').click();
    await page.locator('input[name="phone_number"]').fill('0574129654');
    await page.getByRole('textbox', { name: 'เช่น 123/' }).click();
    await page.getByRole('textbox', { name: 'เช่น 123/' }).fill('123/45');
    await page.getByRole('textbox', { name: 'เช่น เฟส' }).click();
    await page.getByRole('textbox', { name: 'เช่น เฟส' }).fill('1');
    await page.getByRole('textbox', { name: 'เช่น ซอย' }).click();
    await page.getByRole('textbox', { name: 'เช่น ซอย' }).fill('2');
    await page.getByRole('button', { name: 'ยืนยันการสร้างบัญชี' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'เพิ่มบัญชีผู้ใช้งาน' }).click();
    await page.getByRole('link', { name: 'ยกเลิก' }).click();
    await page.getByRole('link', { name: 'เพิ่มบัญชีผู้ใช้งาน' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('link').filter({ hasText: /^$/ }).click();
  });
});

// ============================================================
// 5. Admin Reports (จาก admin_reports.spec.js)
// ============================================================
test.describe('Admin Reports', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'รายงานสรุป' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'วันนี้' }).click();
    await page.getByRole('button', { name: 'วันล่าสุด' }).click();
    await page.getByRole('button', { name: 'เดือนนี้' }).click();
    await page.getByRole('button', { name: 'รีเฟรช' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await page.getByRole('button', { name: 'ออกรายงาน (Print)' }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.getByRole('cell', { name: 'dffg' }).click();
  });
});

// ============================================================
// 6. Admin Profile (จาก admin_profile.spec.js)
// ============================================================
test.describe('Admin Profile', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'โปรไฟล์' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('ลุงโอ');
    await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('12345678');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('12345678');
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();
    await page.waitForLoadState('networkidle');
  });
});

// ============================================================
// 7. Admin Logs (จาก admin_logs.spec.js)
// ============================================================
test.describe('Admin Logs', () => {
  test('test', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Audit Logs' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'ค้นหาชื่อผู้ใช้, IP Address' }).click();
    await page.getByRole('textbox', { name: 'ค้นหาชื่อผู้ใช้, IP Address' }).fill('');
    await page.locator('#log-action-filter').selectOption('CHANGE_ROLE');
    await page.locator('#log-action-filter').selectOption('CREATE_COMPLAINT_BY_STAFF');
    await page.locator('#log-action-filter').selectOption('CREATE_USER');
    await page.locator('#log-action-filter').selectOption('DELETE_USER');
    await page.locator('#log-action-filter').selectOption('UPDATE_COMPLAINT');
    await page.locator('#log-action-filter').selectOption('UPDATE_COMPLAINT_BY_STAFF');
    await page.locator('#log-action-filter').selectOption('UPDATE_STATUS');
    await page.locator('#log-action-filter').selectOption('all');
    await page.getByRole('button', { name: '2' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'หน้าถัดไป' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'หน้าก่อนหน้า' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'หน้าก่อนหน้า' }).click();
  });
});
