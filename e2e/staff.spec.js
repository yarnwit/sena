import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    test.setTimeout(120000); // เพิ่ม timeout เป็น 2 นาที เพราะเทสยาว

    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => { });
    await page.addInitScript(() => { window.print = () => console.log('Mocked window.print()'); });
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('bosszaza');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());
    await page.waitForURL('**/staff/**', { timeout: 15000 }).catch(() => {});

    // รอให้หน้า dashboard โหลดเสร็จ โดยรอจนเห็นลิงก์ "สร้างคำร้อง"
    await page.getByRole('link', { name: /สร้าง(คำร้อง|เรื่องร้องเรียน)/ }).first().waitFor({ timeout: 15000 });

    // === สร้างคำร้องแบบเลือกลูกบ้านจากระบบ ===
    await page.getByRole('link', { name: /สร้าง(คำร้อง|เรื่องร้องเรียน)/ }).first().click();
    // รอให้รายชื่อลูกบ้านโหลดจาก API เสร็จก่อน
    await page.getByRole('button', { name: '🏠 83/34' }).first().waitFor({ timeout: 30000 });
    await page.getByRole('button', { name: '🏠 83/34' }).first().click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('โปรแมพmlbb');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('มีคนโปรเเมพmlbb');
    await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('สำนักงาน');
    await page.getByRole('combobox').selectOption('line');
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // คลิกที่คำร้องที่เพิ่งสร้าง (ใช้ .first() เพราะอาจมีชื่อซ้ำจากรอบก่อน)
    await page.getByRole('cell', { name: 'โปรแมพmlbb' }).first().click();

    // === สร้างคำร้องแบบ Manual (กรอกข้อมูลเอง) ===
    await page.getByRole('link', { name: /สร้าง(คำร้อง|เรื่องร้องเรียน)/ }).first().click();
    await page.getByRole('button', { name: 'กรอกข้อมูลเอง' }).click();
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).click();
    await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('บอส');
    await page.getByRole('textbox', { name: 'นามสกุล' }).click();
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('โปรแมพ');
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).click();
    await page.getByRole('textbox', { name: '08x-xxx-xxxx' }).fill('092-254-1232');
    await page.getByRole('textbox', { name: 'เช่น 88/' }).click();
    await page.getByRole('textbox', { name: 'เช่น 88/' }).fill('88/11');
    await page.locator('div').filter({ hasText: /^เฟส$/ }).click();
    await page.getByRole('textbox', { name: 'เช่น 1,' }).fill('1');
    await page.locator('div').filter({ hasText: /^ซอย$/ }).click();
    await page.getByRole('textbox', { name: 'ซอย' }).fill('1');
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม' }).fill('โปรแมพ freefire');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหา' }).fill('แอดครับมีคนโปรแมพ freefire');
    await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('สำนักงาน');
    await page.getByRole('combobox').selectOption('line');
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.waitForURL('**/staff/complaints');
    await page.waitForTimeout(1000);

    // === อนุมัติคำร้อง ===
    await page.getByRole('cell', { name: 'โปรแมพ freefire' }).first().waitFor({ timeout: 20000 });
    await page.getByRole('cell', { name: 'โปรแมพ freefire' }).first().click();
    await page.getByRole('button', { name: 'อนุมัติ', exact: true }).click();
    await page.getByRole('textbox', { name: 'กรอกความเห็นคณะกรรมการ หรือเหตุผลประกอบการพิจารณา' }).click();
    await page.getByRole('textbox', { name: 'กรอกความเห็นคณะกรรมการ หรือเหตุผลประกอบการพิจารณา' }).fill('พร้อมนพเข้าที่ประชุม');
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => { });
    });
    await page.getByRole('button', { name: 'อัปเดตข้อมูล' }).click();

    // === รอเข้าที่ประชุม → นำเรื่องเข้าที่ประชุม ===
    await page.getByRole('link', { name: 'รอเข้าที่ประชุม' }).evaluate(node => node.click());
    await page.waitForURL('**/staff/approvals'); // รอโหลดหน้า approvals ก่อน
    await page.waitForTimeout(1000);
    await page.getByRole('cell', { name: 'โปรแมพ freefire' }).first().waitFor({ timeout: 20000 });
    await page.getByRole('cell', { name: 'โปรแมพ freefire' }).first().click();
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => { });
    });
    await page.getByRole('button', { name: 'นำเรื่องเข้าที่ประชุม' }).click();

    // === มติอนุมัติให้ดำเนินการ ===
    await page.getByRole('link', { name: 'นำเรื่องเข้าที่ประชุม' }).evaluate(node => node.click());
    await page.waitForURL('**/staff/meetings'); // รอเปลี่ยนหน้าก่อน
    await page.waitForTimeout(1000);
    await page.getByRole('cell', { name: 'บอส โปรแมพ' }).first().waitFor({ timeout: 20000 });
    await page.getByRole('cell', { name: 'บอส โปรแมพ' }).first().click();
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => { });
    });
    await page.getByRole('button', { name: 'มติ: อนุมัติให้ดำเนินการ' }).click();

    // === ติดตามการแก้ไข → ปิดงาน ===
    await page.getByRole('link', { name: 'ติดตามการแก้ไขปัญหา' }).evaluate(node => node.click());
    await page.waitForURL('**/staff/maintenance'); // รอโหลดหน้า maintenance ก่อน
    await page.waitForTimeout(1000);
    await page.getByRole('cell', { name: 'บอส โปรแมพ' }).first().waitFor({ timeout: 20000 });
    await page.getByRole('cell', { name: 'บอส โปรแมพ' }).first().click();
    await page.getByRole('button', { name: 'บันทึกการแก้ไขเสร็จสิ้น' }).click();
    await page.getByRole('textbox', { name: 'เช่น ทำความสะอาดพื้นที่, ตรวจสอบแล้วปกติ' }).click();
    await page.getByRole('textbox', { name: 'เช่น ทำความสะอาดพื้นที่, ตรวจสอบแล้วปกติ' }).fill('แบนโปรยกเซิร์ฟ');
    await page.getByRole('textbox', { name: 'เช่น 150 บาท' }).click();
    await page.getByRole('textbox', { name: 'เช่น 150 บาท' }).fill('150000');
    page.once('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => { });
    });
    await page.getByRole('button', { name: 'ยืนยันปิดงาน' }).click();

    // === เปลี่ยนรหัสผ่าน ===
    await page.getByRole('link', { name: 'โปรไฟล์' }).evaluate(node => node.click());
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('1234567');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('1234567');
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();

    // === ออกจากระบบ แล้วล็อกอินใหม่ด้วยรหัสใหม่ ===
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('bosszaza');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('1234567');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());

    // === เปลี่ยนรหัสผ่านกลับเป็น 123456 เพื่อให้รันซ้ำได้ ===
    await page.waitForURL('**/staff/**', { timeout: 15000 }).catch(() => {});
    await page.getByRole('link', { name: 'โปรไฟล์' }).evaluate(node => node.click());
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('123456');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('123456');
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
});