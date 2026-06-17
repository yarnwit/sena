import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    test.setTimeout(120000); // เพิ่ม timeout เป็น 2 นาที เพราะเทสยาว
    const username = `tanakit_${Date.now()}`;
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => { window.print = function() {}; });
    await page.getByRole('link', { name: 'สมัครสมาชิก' }).evaluate(node => node.click());
    await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).click();
    await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).fill('ธนกฤต');
    await page.getByRole('textbox', { name: 'นามสกุล' }).click();
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('แจ้งแสงเงิน');
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill(username);
    await page.getByRole('textbox', { name: 'บ้านเลขที่' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่' }).fill('88/23');
    await page.getByRole('textbox', { name: 'เฟส' }).click();
    await page.getByRole('textbox', { name: 'เฟส' }).fill('2');
    await page.getByRole('textbox', { name: 'ซอย' }).click();
    await page.getByRole('textbox', { name: 'ซอย' }).fill('1');
    await page.getByRole('textbox', { name: 'เบอร์โทรศัพท์' }).click();
    await page.getByRole('textbox', { name: 'เบอร์โทรศัพท์' }).fill('0941231232');
    await page.getByLabel('ประเภทผู้อยู่อาศัย').selectOption('family');
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
    await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).click();
    await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
    await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
    await page.waitForURL('**/login', { timeout: 15000 }); // รอ redirect ไปหน้า login (มี delay 2 วิ)
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill(username);
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());
    await page.getByRole('link', { name: 'สร้างคำร้อง', exact: true }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).click();
    await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).fill('ยามหลับหน้าป้อมตอนตี2');
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('เห็นยามหลับหน้าป้อมตอนตี2วันที่ 3/6/2025');
    await page.locator('div').filter({ hasText: /^สถานที่รับคำร้อง$/ }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
    await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');
    await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    await page.getByRole('link', { name: 'ดูรายละเอียด →' }).click();
    await page.getByRole('link', { name: 'แก้ไขข้อมูล' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).click();
    await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('เห็นยามหลับหน้าป้อมตอนตี2วันที่ 3/6/2025 ครับ');
    await page.locator('input[type="file"]').setInputFiles({
        name: 'home.png',
        mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
    // รอให้ redirect กลับหน้ารายละเอียดหลังแก้ไขสำเร็จ
    await page.waitForURL(/\/resident\/complaints\//, { timeout: 15000 });
    await page.getByRole('link', { name: 'กลับไปหน้ารายการ' }).click();
    await page.getByRole('link', { name: 'โปรไฟล์' }).click();
    await page.getByRole('textbox', { name: 'เช่น 081-234-' }).click();
    await page.getByRole('textbox', { name: 'เช่น 081-234-' }).fill('082-243-2121');
    await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('123456');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('1234567');
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
    await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('1234567');
    await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).click();
    await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('1234567');
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
    await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill(username);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).evaluate(node => node.click());
    await page.getByRole('link', { name: 'โปรไฟล์' }).click();
    await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
});