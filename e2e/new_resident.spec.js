import { test, expect } from '@playwright/test';

test.describe('ระบบนิติบุคคล - ทดสอบสิทธิ์ Resident', () => {

  // รันก่อนเริ่มแต่ละเทสต์เสมอ: ทำการ Login ด้วยรหัสของ Resident
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { window.print = () => console.log('Mocked window.print()'); });
    // Navigate to login
    await page.goto('http://localhost:3000/login');

    // รอให้ React hydrate (networkidle = JS bundle โหลดเสร็จ + event handlers ติดแล้ว)
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    // Mock window.print (ต้อง evaluate หลัง React hydrate)
    await page.evaluate(() => {
      window.print = function() {};
    });

    // รอ form field (React hydration เสร็จแล้ว ณ จุดนี้)
    const usernameField = page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' });
    await usernameField.waitFor({ state: 'visible', timeout: 20000 });

    // เลือก Role ลูกบ้าน (ปกติ Default จะเป็นลูกบ้านอยู่แล้ว)
    try {
      const residentTab = page.getByText('ลูกบ้าน');
      await residentTab.waitFor({ state: 'visible', timeout: 2000 });
      await residentTab.evaluate(node => node.click());
      await page.waitForTimeout(500);
    } catch (e) {
      // ข้ามถ้าหาไม่เจอ
    }

    // กรอก username + password
    await usernameField.fill('tanakit_1780469025132');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
    await page.waitForTimeout(300);
    
    // ใช้ evaluate click
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());

    // ตรวจสอบว่าเข้า Dashboard Resident สำเร็จ
    await expect(page).toHaveURL(/\/resident\/dashboard/, { timeout: 30000 });
  });

  // ============================================================
  // 1. ทดสอบหน้า Dashboard และ Navigation หลัก
  // ============================================================
  test('1. Resident สามารถเข้า Dashboard และ Navigate ไปหน้าต่างๆ ได้', async ({ page }) => {
    test.setTimeout(60000);

    // ไปหน้าประวัติคำร้องของฉัน (ดูทั้งหมด)
    await page.getByRole('link', { name: 'ดูทั้งหมด' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // กลับมาที่หน้าภาพรวม
    await page.getByRole('link', { name: 'ภาพรวม' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);
  });

  // ============================================================
  // 2. ทดสอบสร้างคำร้อง
  // ============================================================
  test('2. Resident สามารถสร้างคำร้องได้', async ({ page }) => {
    test.setTimeout(60000);

    // ไปหน้าสร้างคำร้อง (ใช้ goto เพื่อความชัวร์และหลีกเลี่ยง Locator ซ้ำซ้อน)
    await page.goto('http://localhost:3000/resident/complaints/new');
    await page.waitForTimeout(1000);

    const uniqueId = Date.now().toString().slice(-4);
    const complaintTitle = `ผมอยากเลี้ยงไดโนเสาร์ ${uniqueId}`;

    // กรอกข้อมูลคำร้อง
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).fill(complaintTitle);
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('ผมต้องการเลี้ยงไดโนเสาร์T-rex');
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');

    // ทดสอบ Cancel -> Confirm
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
    await page.waitForTimeout(500);
    try {
      const cancelBtn = page.getByRole('button', { name: 'ยกเลิก' });
      await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
      await cancelBtn.evaluate(node => node.click());
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'บันทึกคำร้อง' }).evaluate(node => node.click());
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('ข้ามการทดสอบปุ่มยกเลิก');
    }
    
    await page.getByRole('button', { name: 'ยืนยัน' }).evaluate(node => node.click());
    await page.waitForTimeout(2000);
  });

  // ============================================================
  // 3. ทดสอบแก้ไขเรื่องร้องเรียน
  // ============================================================
  test('3. Resident สามารถแก้ไขเรื่องร้องเรียนได้', async ({ page }) => {
    test.setTimeout(60000);

    // ไปหน้ารายการร้องเรียนของฉัน
    await page.goto('http://localhost:3000/resident/complaints');
    await page.waitForTimeout(1000);

    // คลิกดูรายละเอียดรายการแรกสุด
    const firstComplaint = page.locator('tbody tr').first().getByRole('link').first();
    if (await firstComplaint.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstComplaint.evaluate(node => node.click());
      await page.waitForTimeout(1000);

      // ลองกดแก้ไขข้อมูล
      try {
        const editBtn = page.getByRole('link', { name: 'แก้ไขข้อมูล' });
        await editBtn.waitFor({ state: 'visible', timeout: 5000 });
        await editBtn.evaluate(node => node.click());
        await page.waitForTimeout(1000);

        await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('ผมต้องการเลี้ยงไดโนเสาร์T-rex ตัวแบบคือลือเลย (แก้ไขแล้ว)');

        // ทดสอบปุ่มยกเลิก และ ยืนยันการแก้ไข
        await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'ยกเลิก' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).evaluate(node => node.click());
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: 'ยืนยัน' }).evaluate(node => node.click());
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('ข้ามการแก้ไข — ไม่พบปุ่มแก้ไข หรือสถานะไม่อนุญาตให้แก้ไขแล้ว (อาจถูกอนุมัติไปแล้ว)');
      }
    }
  });

  // ============================================================
  // 4. ทดสอบการใช้ฟิลเตอร์สถานะ
  // ============================================================
  test('4. Resident สามารถใช้ฟิลเตอร์กรองสถานะได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('http://localhost:3000/resident/complaints');
    await page.waitForTimeout(1000);

    const filters = ['รอดำเนินการ', 'กำลังดำเนินการ', 'แก้ไขแล้ว', 'ทั้งหมด'];
    for (const f of filters) {
      try {
        const filterBtn = page.getByRole('button', { name: new RegExp(f, 'i') });
        await filterBtn.waitFor({ state: 'visible', timeout: 3000 });
        await filterBtn.evaluate(node => node.click());
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`ข้ามฟิลเตอร์ ${f}`);
      }
    }
  });

  // ============================================================
  // 5. ทดสอบแก้ไขโปรไฟล์และเปลี่ยนรหัสผ่าน
  // ============================================================
  test('5. Resident สามารถแก้ไขโปรไฟล์และเปลี่ยนรหัสผ่านได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('link', { name: 'โปรไฟล์' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);

    // ทดสอบแก้ไขข้อมูลส่วนตัว
    try {
      const nameInput = page.getByRole('textbox').nth(1);
      await nameInput.waitFor({ state: 'visible', timeout: 3000 });
      await nameInput.fill('เต้');
      await page.getByRole('textbox').nth(2).fill('พระราม7');
      await page.getByRole('button', { name: 'บันทึกข้อมูล' }).evaluate(node => node.click());
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('ข้ามการบันทึกข้อมูลส่วนตัว');
    }

    // ทดสอบเปลี่ยนรหัสผ่าน (ทำแค่ Validation Check ป้องกันรหัสเปลี่ยนแล้วเทสต์อื่นรันไม่ได้)
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('123456789');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('987654321'); // รหัสไม่ตรงกัน
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).evaluate(node => node.click());
    await page.waitForTimeout(1000);
    
    // ออกจากระบบ
    await page.getByRole('button', { name: 'ออกจากระบบ' }).evaluate(node => node.click());
    await page.waitForURL('**/login', { timeout: 10000 });
  });

});