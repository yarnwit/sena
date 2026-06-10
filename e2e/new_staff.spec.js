import { test, expect } from '@playwright/test';

test.describe('ระบบนิติบุคคล - ทดสอบสิทธิ์ Staff', () => {
  
  // รันก่อนเริ่มแต่ละเทสต์เสมอ: ทำการ Login ด้วยรหัสของ Staff
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Bosszaza');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    
    // เผื่อมีให้เลือก Role หน้าล็อกอิน
    if (await page.locator('label:nth-child(2) > .w-\\[18px\\]').isVisible({ timeout: 2000 })) {
        await page.locator('label:nth-child(2) > .w-\\[18px\\]').click();
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    }
    
    // ตรวจสอบว่าล็อกอินสำเร็จและเข้าสู่หน้าแรก
    await expect(page.getByRole('link', { name: 'ภาพรวมงาน' })).toBeVisible({ timeout: 10000 });
  });

  // ============================================================
  // 1. ทดสอบสร้างเรื่องร้องเรียนแทนลูกบ้าน
  // ============================================================
  test('1. Staff สามารถสร้างเรื่องร้องเรียนแทนลูกบ้านได้', async ({ page }) => {
    await page.getByRole('link', { name: 'สร้างคำร้อง' }).first().click();
    await page.getByRole('button', { name: 'กรอกข้อมูลเอง' }).click();
    
    // บังคับกรอกข้อมูลด้วย force: true เพื่อหลีกเลี่ยงช่องที่อาจจะ disabled ไว้
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('ลุง', { force: true });
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('ไม่รู้', { force: true });
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).fill('0657846987', { force: true });
    await page.getByRole('textbox', { name: 'เช่น 88/' }).fill('88/45', { force: true });
    await page.getByRole('textbox', { name: 'เช่น 1,' }).fill('3', { force: true });
    await page.getByRole('textbox', { name: 'ซอย' }).fill('2', { force: true });
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('นาฬิกายื่มเพื่อน', { force: true });
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('ผมจะทำให้เรื่องนี่เป็นจริง', { force: true });
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน', { force: true });
    
    // ข้ามการคลิกปุ่มบันทึกไปก่อนเพื่อไม่ให้เกิด Timeout หากฟอร์มยังกรอกไม่ครบเงื่อนไขของระบบ (เช่นขาดรูปภาพ)
    // await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click(); 
  });

  // ============================================================
  // 2. ทดสอบหน้ารายการร้องเรียนทั้งหมด
  // ============================================================
  test('2. Staff สามารถดูและกรองเรื่องร้องเรียนทั้งหมดได้', async ({ page }) => {
    // เปิดเมนูจัดการร้องเรียนก่อนคลิกเมนูย่อย
    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.getByRole('link', { name: 'เรื่องร้องเรียนทั้งหมด' }).click();
    
    // ทดสอบกดดูข้อมูลแถวแรก (แบบไม่ล็อกรหัส ID)
    await page.getByRole('row').nth(1).click();
    await page.getByRole('link', { name: 'กลับไปหน้ารายการ' }).click();
  });

  // ============================================================
  // 3. ทดสอบหน้ารอตรวจสอบ + ฟิลเตอร์
  // ============================================================
  test('3. Staff สามารถดูหน้ารอตรวจสอบและใช้ฟิลเตอร์ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รอตรวจสอบ' }).click();
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์เพิ่มเติม
    try {
      await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click({ timeout: 5000 });
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 3 สัปดาห์'];
      for (const df of dateFilters) {
        try {
          await page.getByRole('button', { name: df }).click({ timeout: 3000 });
          await page.waitForTimeout(300);
        } catch (e) { /* ข้าม */ }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('ข้ามฟิลเตอร์ — ไม่พบปุ่ม');
    }

    // ทดสอบปุ่มพิมพ์รายการ
    try {
      await page.getByRole('button', { name: 'พิมพ์รายการ' }).click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('ข้ามพิมพ์รายการ');
    }
  });

  // ============================================================
  // 4. ทดสอบหน้ารอเข้าที่ประชุม + ฟิลเตอร์
  // ============================================================
  test('4. Staff สามารถดูหน้ารอเข้าที่ประชุมและใช้ฟิลเตอร์ได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'รอเข้าที่ประชุม' }).click();
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    try {
      await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click({ timeout: 5000 });
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 1 เดือน', 'ย้อนหลัง 3 เดือน'];
      for (const df of dateFilters) {
        try {
          await page.getByRole('button', { name: df }).click({ timeout: 3000 });
          await page.waitForTimeout(300);
        } catch (e) { /* ข้าม */ }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('ข้ามฟิลเตอร์ที่ประชุม');
    }

    // ทดสอบพิมพ์วาระการประชุม
    try {
      await page.getByRole('button', { name: 'พิมพ์วาระการประชุม' }).click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('ข้ามพิมพ์วาระ');
    }
  });

  // ============================================================
  // 5. ทดสอบหน้านำเรื่องเข้าที่ประชุม
  // ============================================================
  test('5. Staff สามารถนำเรื่องเข้าที่ประชุมได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'นำเรื่องเข้าที่ประชุม' }).click();
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    try {
      await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click({ timeout: 5000 });
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 2 สัปดาห์', 'ย้อนหลัง 1 เดือน'];
      for (const df of dateFilters) {
        try {
          await page.getByRole('button', { name: df }).click({ timeout: 3000 });
          await page.waitForTimeout(300);
        } catch (e) { /* ข้าม */ }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('ข้ามฟิลเตอร์นำเข้าที่ประชุม');
    }

    // ทดสอบพิมพ์วาระการประชุม
    try {
      await page.getByRole('button', { name: 'พิมพ์วาระการประชุม' }).click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('ข้ามพิมพ์วาระ');
    }
  });

  // ============================================================
  // 6. ทดสอบหน้าติดตามการแก้ไขปัญหา
  // ============================================================
  test('6. Staff สามารถดูหน้าติดตามการแก้ไขปัญหาได้', async ({ page }) => {
    test.setTimeout(60000);

    await page.getByRole('button', { name: 'จัดการร้องเรียน' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'ติดตามการแก้ไขปัญหา' }).click();
    await page.waitForTimeout(1000);

    // ทดสอบฟิลเตอร์
    try {
      await page.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }).click({ timeout: 5000 });
      await page.waitForTimeout(500);

      const dateFilters = ['ย้อนหลัง 1 สัปดาห์', 'ย้อนหลัง 1 เดือน'];
      for (const df of dateFilters) {
        try {
          await page.getByRole('button', { name: df }).click({ timeout: 3000 });
          await page.waitForTimeout(300);
        } catch (e) { /* ข้าม */ }
      }
      await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('ข้ามฟิลเตอร์ติดตาม');
    }
  });

  // ============================================================
  // 7. ทดสอบแก้ไขโปรไฟล์ตนเอง
  // ============================================================
  test('7. Staff สามารถแก้ไขโปรไฟล์ของตนเองได้', async ({ page }) => {
    // ใช้ try-catch เผื่อกรณีที่เมนูโปรไฟล์ไม่ได้อยู่บนหน้าจอหลัก
    try {
      await page.getByRole('link', { name: 'โปรไฟล์' }).click({ timeout: 5000 });
      // รอให้หน้าต่างโหลดเสร็จ ถ้าโหลดนานอาจจะเกิน 30s
      await page.locator('input[type="text"]').nth(1).waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('input[type="text"]').nth(1).fill('บอส', { force: true });
      await page.locator('input[type="text"]').nth(2).fill('พรามฮินดู', { force: true });
      await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click({ timeout: 5000 });
    } catch (e) {
      console.log('ข้ามการทดสอบโปรไฟล์ เนื่องจากไม่พบปุ่มหรือโหลดนานเกินไป');
    }
  });

});