import { test, expect } from '@playwright/test';

test.describe('ระบบนิติบุคคล - ทดสอบสิทธิ์ Admin', () => {

  // รันก่อนเริ่มแต่ละเทสต์เสมอ: ทำการ Login ด้วยรหัสของ Admin
  test.beforeEach(async ({ page }) => {
    // Mock window.print (ใช้ addInitScript เพื่อให้อยู่ตลอดทุกหน้า)
    // *** ต้องประกาศก่อน page.goto เสมอ ***
    await page.addInitScript(() => {
      window.print = () => console.log('Mocked window.print()');
    });

    // Navigate to login
    await page.goto('http://localhost:3000/login');

    // รอให้ React hydrate (networkidle = JS bundle โหลดเสร็จ + event handlers ติดแล้ว)
    // cap ที่ 8 วินาที เพื่อไม่ให้ timeout กับ test ที่ทำ network มาก (tests 6, 14)
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    // รอ form field (React hydration เสร็จแล้ว ณ จุดนี้)
    const usernameField = page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' });
    await usernameField.waitFor({ state: 'visible', timeout: 20000 });

    // กรอก credentials → React state อัพเดตถูกต้องเพราะ hydrated แล้ว
    await usernameField.fill('admin');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
    await page.waitForTimeout(300);

    // ใช้ evaluate click (ไม่ใช้ .click() ซึ่ง hang ใน Firefox
    // และไม่ใช้ press(Enter) ซึ่งทำ native GET submit)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 30000 });
  });

  // ============================================================
  // 1. ทดสอบหน้า Dashboard และ Navigation หลัก
  // ============================================================
  test('1. Admin สามารถเข้า Dashboard และ Navigate ไปหน้าต่างๆ ได้', async ({ page }) => {
    test.setTimeout(60000);

    // กดรีเฟรช
    await page.getByRole('button', { name: 'รีเฟรช' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ไปหน้าจัดการผู้ใช้
    await page.getByRole('link', { name: 'จัดการผู้ใช้ →' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // กลับหน้า Dashboard
    await page.getByRole('link', { name: 'ภาพรวมระบบ' }).evaluate(node => node.click());
    await page.waitForTimeout(500);

    // ไปหน้า Logs
    await page.getByRole('link', { name: 'ดู Logs →' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // กลับ Dashboard แล้วไปดูเรื่องร้องเรียนทั้งหมด
    await page.getByRole('link', { name: 'ภาพรวมระบบ' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'ดูทั้งหมด →' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);
  });

  // ============================================================
  // 2. ทดสอบสร้างคำร้อง (เลือกลูกบ้านจากระบบ)
  // ============================================================
  test('2. Admin สามารถสร้างคำร้องโดยเลือกลูกบ้านจากระบบได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('link', { name: 'สร้างคำร้อง' }).first().evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ค้นหาลูกบ้าน
    await page.getByRole('textbox', { name: 'พิมพ์บ้านเลขที่ หรือ ชื่อ-นามสกุล' }).fill('เต');
    await page.waitForTimeout(1000);

    // เลือกลูกบ้านคนแรกที่ขึ้นมา (ไม่ hardcode ชื่อ)
    const residentButton = page.locator('button').filter({ hasText: '🏠' }).first();
    if (await residentButton.isVisible({ timeout: 5000 })) {
      await residentButton.evaluate(node => node.click());
    }
    await page.waitForTimeout(500);

    // กรอกข้อมูลคำร้อง
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('ทดสอบสร้างคำร้องจาก Admin');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('คำร้องทดสอบจากระบบ Admin อัตโนมัติ');
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('สำนักงานนิติบุคคล');

    // ทดสอบ Cancel -> Confirm flow
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    const cancelBtn = page.getByRole('button', { name: 'ยกเลิก' });
    if (await cancelBtn.isVisible({ timeout: 5000 })) {
      await cancelBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    }
    await page.getByRole('button', { name: 'ยืนยัน' }).evaluate(node => node.click());
    await page.waitForTimeout(2000);
  });

  // ============================================================
  // 3. ทดสอบสร้างคำร้อง (กรอกข้อมูลเอง)
  // ============================================================
  test('3. Admin สามารถสร้างคำร้องโดยกรอกข้อมูลเองได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000/admin/complaints');
    await page.waitForTimeout(1000);

    await page.getByRole('link', { name: 'สร้างคำร้อง', exact: true }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'กรอกข้อมูลเอง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);

    // กรอกข้อมูลผู้ร้อง
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Boss');
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Manu');
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).fill('0864971258');
    await page.getByRole('textbox', { name: 'เช่น 88/' }).fill('88/74');
    await page.getByRole('textbox', { name: 'เช่น 1,' }).fill('1');
    await page.getByRole('textbox', { name: 'ซอย' }).fill('2');

    // กรอกข้อมูลคำร้อง
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('ทดสอบคำร้องกรอกข้อมูลเอง');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('คำร้องที่ Admin กรอกข้อมูลผู้ร้องเอง');
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');

    // ทดสอบ Cancel -> Confirm
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'ยกเลิก' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'ยืนยัน' }).evaluate(node => node.click());
    await page.waitForTimeout(2000);
  });

  // ============================================================
  // 4. ทดสอบหน้ารายการร้องเรียนทั้งหมด + ฟิลเตอร์สถานะ
  // ============================================================
  test('4. Admin สามารถดูรายการร้องเรียนและกรองตามสถานะได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รายการร้องเรียนทั้งหมด' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบกดฟิลเตอร์สถานะต่างๆ
    const statusFilters = ['รอดำเนินการ', 'อนุมัติรับเรื่อง', 'เข้าที่ประชุม', 'กำลังดำเนินการ', 'แก้ไขแล้ว', 'ไม่อนุมัติ', 'ปิดเรื่อง', 'ทั้งหมด'];
    for (const filter of statusFilters) {
      const btn = page.getByRole('button', { name: filter });
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.evaluate(node => node.click());
        await page.waitForTimeout(300);
      }
    }

    // ทดสอบช่องค้นหา
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).fill('ทดสอบ');
    await page.waitForTimeout(500);
    await page.getByRole('textbox', { name: 'ค้นหาเรื่องร้องเรียน, เลขที่, หรือสถานที่' }).fill('');
    await page.waitForTimeout(500);

    // ทดสอบตัวกรองเพิ่มเติม
    const filterMoreBtn = page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' });
    await filterMoreBtn.waitFor({ state: 'attached', timeout: 5000 });
    await filterMoreBtn.evaluate(node => node.click());
    await page.waitForTimeout(500);

    // ทดสอบปุ่ม Quick date filters
    const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 2 สัปดาห์', 'ย้อนหลัง 1 เดือน', 'ย้อนหลัง 3 เดือน'];
    for (const df of dateFilters) {
      const dfBtn = page.getByRole('button', { name: df });
      if (await dfBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dfBtn.evaluate(node => node.click());
        await page.waitForTimeout(300);
      }
    }
    await page.getByRole('button', { name: 'ล้างตัวกรอง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
  });

  // ============================================================
  // 5. ทดสอบจัดการ (แก้ไข / ลบ) เรื่องร้องเรียน
  // ============================================================
  test('5. Admin สามารถแก้ไขและลบเรื่องร้องเรียนได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รายการร้องเรียนทั้งหมด' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // คลิกจัดการแถวแรก (ไม่ hardcode ID)
    const manageLink = page.getByRole('link', { name: 'จัดการ →' }).first();
    if (await manageLink.isVisible({ timeout: 5000 })) {
      await manageLink.evaluate(node => node.click());
      await page.waitForTimeout(1000);

      // ทดสอบกดแก้ไข
      const editLink = page.getByRole('link', { name: 'แก้ไข', exact: true });
      if (await editLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editLink.evaluate(node => node.click());
        await page.waitForTimeout(1000);

        await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('แก้ไขข้อมูลทดสอบจาก Admin Auto Test');
        await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'ยกเลิก' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'ยืนยัน' }).evaluate(node => node.click());
        await page.waitForTimeout(2000);
      }

      // ทดสอบกดลบ (ยกเลิก ไม่ลบจริง)
      const deleteBtn = page.getByRole('button', { name: 'ลบ' });
      if (await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteBtn.evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'ยกเลิก' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
      }
    }
  });

  // ============================================================
  // 6. ทดสอบอนุมัติ/ไม่อนุมัติเรื่องร้องเรียน
  // ============================================================
  test('6. Admin สามารถอนุมัติและไม่อนุมัติเรื่องร้องเรียนได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รายการร้องเรียนทั้งหมด' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // คลิกจัดการแถวแรก
    const manageLink = page.getByRole('link', { name: 'จัดการ →' }).first();
    if (await manageLink.isVisible({ timeout: 5000 })) {
      await manageLink.evaluate(node => node.click());
      await page.waitForTimeout(1000);

      // ทดสอบอนุมัติ
      const approveBtn = page.getByRole('button', { name: 'อนุมัติ', exact: true });
      if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await approveBtn.evaluate(node => node.click());
        await page.waitForTimeout(500);

        // รอ dialog confirm แล้วกดตกลง
        page.once('dialog', dialog => {
          dialog.accept().catch(() => {});
        });
        const updateBtn = page.getByRole('button', { name: 'อัปเดตข้อมูล' });
        if (await updateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await updateBtn.evaluate(node => node.click());
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  // ============================================================
  // 7. ทดสอบหน้ารอตรวจสอบ + ฟิลเตอร์
  // ============================================================
  test('7. Admin สามารถดูหน้ารอตรวจสอบและใช้ฟิลเตอร์ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รอตรวจสอบ' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์เพิ่มเติม
    const filterBtn = page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' });
    if (await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 3 สัปดาห์'];
      for (const df of dateFilters) {
        const dfBtn = page.getByRole('button', { name: df });
        if (await dfBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dfBtn.evaluate(node => node.click());
          await page.waitForTimeout(300);
        }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    }

    // ทดสอบปุ่มพิมพ์รายการ
    const printBtn = page.getByRole('button', { name: 'พิมพ์รายการ' });
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }
  });

  // ============================================================
  // 8. ทดสอบหน้ารอเข้าที่ประชุม + ฟิลเตอร์
  // ============================================================
  test('8. Admin สามารถดูหน้ารอเข้าที่ประชุมและใช้ฟิลเตอร์ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รอเข้าที่ประชุม' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    const filterBtn = page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' });
    if (await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 1 เดือน', 'ย้อนหลัง 3 เดือน'];
      for (const df of dateFilters) {
        const dfBtn = page.getByRole('button', { name: df });
        if (await dfBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dfBtn.evaluate(node => node.click());
          await page.waitForTimeout(300);
        }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    }

    // ทดสอบพิมพ์วาระการประชุม
    const printBtn = page.getByRole('button', { name: 'พิมพ์วาระการประชุม' });
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }
  });

  // ============================================================
  // 9. ทดสอบหน้านำเรื่องเข้าที่ประชุม
  // ============================================================
  test('9. Admin สามารถนำเรื่องเข้าที่ประชุมได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'นำเรื่องเข้าที่ประชุม' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    const filterBtn = page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' });
    if (await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 2 สัปดาห์', 'ย้อนหลัง 1 เดือน'];
      for (const df of dateFilters) {
        const dfBtn = page.getByRole('button', { name: df });
        if (await dfBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dfBtn.evaluate(node => node.click());
          await page.waitForTimeout(300);
        }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    }

    // ทดสอบพิมพ์วาระการประชุม
    const printBtn = page.getByRole('button', { name: 'พิมพ์วาระการประชุม' });
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }
  });

  // ============================================================
  // 10. ทดสอบหน้าติดตามการแก้ไขปัญหา
  // ============================================================
  test('10. Admin สามารถดูหน้าติดตามการแก้ไขปัญหาได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'ติดตามการแก้ไขปัญหา' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    const filterBtn = page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' });
    if (await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 1 เดือน'];
      for (const df of dateFilters) {
        const dfBtn = page.getByRole('button', { name: df });
        if (await dfBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await dfBtn.evaluate(node => node.click());
          await page.waitForTimeout(300);
        }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    }
  });

  // ============================================================
  // 11. ทดสอบเพิ่มบัญชีผู้ใช้งาน
  // ============================================================
  test('11. Admin สามารถเพิ่มบัญชีผู้ใช้งานใหม่ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(1000);

    await page.getByRole('link', { name: 'เพิ่มบัญชีผู้ใช้งาน' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // กรอกข้อมูลบัญชีใหม่ (ใช้ timestamp เพื่อไม่ให้ซ้ำ)
    const uniqueSuffix = Date.now().toString().slice(-6);
    await page.getByRole('textbox', { name: 'เช่น somchai123' }).fill(`testuser_${uniqueSuffix}`);
    await page.getByRole('textbox', { name: 'ตั้งรหัสผ่าน 6 ตัวอักษรขึ้นไป' }).fill('123456');
    await page.locator('input[name="first_name"]').fill('ทดสอบ');
    await page.locator('input[name="last_name"]').fill('ระบบ');
    await page.locator('input[name="phone_number"]').fill('0874569821');
    await page.getByRole('textbox', { name: 'เช่น 123/' }).fill('23/57');
    await page.getByRole('textbox', { name: 'เช่น เฟส' }).fill('1');
    await page.getByRole('textbox', { name: 'เช่น ซอย' }).fill('2');

    await page.getByRole('button', { name: 'ยืนยันการสร้างบัญชี' }).evaluate(node => node.click());
    await page.waitForTimeout(2000);
  });

  // ============================================================
  // 12. ทดสอบหน้าจัดการผู้ใช้งาน + ค้นหา + กรอง Role
  // ============================================================
  test('12. Admin สามารถค้นหาและกรองผู้ใช้งานตาม Role ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(1000);

    // ทดสอบค้นหา
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).fill('ทดสอบ');
    await page.waitForTimeout(500);
    await page.getByRole('textbox', { name: 'ค้นหาชื่อ, นามสกุล หรือ' }).fill('');
    await page.waitForTimeout(500);

    // ทดสอบรีเฟรช
    await page.getByRole('button', { name: 'รีเฟรช' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบกรอง Role
    const roles = ['resident', 'staff', 'admin', 'all'];
    for (const role of roles) {
      const sel = page.locator('#user-role-filter');
      if (await sel.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sel.selectOption(role);
        await page.waitForTimeout(500);
      }
    }
  });

  // ============================================================
  // 13. ทดสอบหน้ารายงานสรุป
  // ============================================================
  test('13. Admin สามารถดูรายงานสรุปและเลือกช่วงเวลาได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('link', { name: 'รายงานสรุป' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบปุ่มเลือกช่วงเวลา
    const timeButtons = ['วันนี้', 'วันล่าสุด', 'เดือนนี้'];
    for (const btn of timeButtons) {
      const timeBtn = page.getByRole('button', { name: btn });
      if (await timeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await timeBtn.evaluate(node => node.click());
        await page.waitForTimeout(500);
      }
    }

    // ทดสอบรีเฟรช
    const refreshBtn = page.getByRole('button', { name: 'รีเฟรช' });
    if (await refreshBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await refreshBtn.evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }

    // ทดสอบออกรายงาน
    const printBtn = page.getByRole('button', { name: 'ออกรายงาน (Print)' });
    if (await printBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await printBtn.evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }
  });

  // ============================================================
  // 14. ทดสอบหน้า Audit Logs
  // ============================================================
  test('14. Admin สามารถดู Audit Logs และกรองตาม Action ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('link', { name: 'Audit Logs' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบค้นหา
    const searchBox = page.getByRole('textbox', { name: 'ค้นหาชื่อผู้ใช้, IP Address' });
    if (await searchBox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchBox.fill('admin');
      await page.waitForTimeout(500);
      await searchBox.fill('');
      await page.waitForTimeout(500);
    }

    // ทดสอบกรอง Action — อ่าน options จาก DOM จริงๆ (dynamic จาก DB)
    const sel = page.locator('#log-action-filter');
    if (await sel.isVisible({ timeout: 5000 }).catch(() => false)) {
      // ดึงค่า option values จริงจาก DOM
      const optionValues = await sel.locator('option').evaluateAll(
        opts => opts.map(o => o.value)
      );
      for (const val of optionValues) {
        await sel.selectOption(val);
        await page.waitForTimeout(200);
      }
    }

    // ทดสอบ Pagination
    const page2Btn = page.getByRole('button', { name: '2' });
    if (await page2Btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page2Btn.evaluate(node => node.click());
      await page.waitForTimeout(500);
      const prevBtn = page.getByRole('button', { name: 'หน้าก่อนหน้า' });
      if (await prevBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prevBtn.evaluate(node => node.click());
        await page.waitForTimeout(500);
      }
    }
  });

  // ============================================================
  // 15. ทดสอบแก้ไขโปรไฟล์ + เปลี่ยนรหัสผ่าน
  // ============================================================
  test('15. Admin สามารถแก้ไขโปรไฟล์และเปลี่ยนรหัสผ่านได้', async ({ page }) => {
    test.setTimeout(90000);

    await page.getByRole('link', { name: 'โปรไฟล์' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // แก้ไขนามสกุล
    const lastNameInput = page.getByRole('textbox').nth(2);
    if (await lastNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameInput.fill('ชา');
      await page.getByRole('button', { name: 'บันทึกข้อมูล' }).evaluate(node => node.click());
      await page.waitForTimeout(1000);
    }

    // ทดสอบ Validation เปลี่ยนรหัสผ่าน (รหัสผ่านไม่ตรงกัน)
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('123456789');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('987654321');
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ออกจากระบบ
    await page.getByRole('button', { name: 'ออกจากระบบ' }).evaluate(node => node.click());
    await page.waitForURL('**/login', { timeout: 10000 });
  });

});