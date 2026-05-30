import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Bosszaza');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('12345678');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'โปรไฟล์' }).click();
  await page.getByRole('textbox').nth(2).click();
  await page.getByRole('textbox').nth(2).fill('เมนู');
  await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click();
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).click();
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่ (อย่างน้อย 6' }).fill('12345678');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).click();
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านใหม่อีกครั้ง' }).fill('12345678');
  await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();
});