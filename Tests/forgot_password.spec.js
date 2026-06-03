import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('link', { name: 'ลืมรหัสผ่าน?' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Autine01');
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('button', { name: 'ย้อนกลับ' }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('link', { name: 'กลับไปหน้าเข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ลืมรหัสผ่าน?' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Autine01');
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('พอแล้ว');
  await page.getByRole('textbox', { name: 'นามสกุล' }).click();
  await page.getByRole('textbox', { name: 'นามสกุล' }).fill('รวยไม่ไหว');
  await page.getByRole('button', { name: 'ยืนยันตัวตน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่านใหม่', exact: true }).fill('123456789');
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่านใหม่' }).click();
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่านใหม่' }).fill('123456789');
  await page.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }).click();
  await page.getByRole('button', { name: 'ไปหน้าเข้าสู่ระบบ' }).click();
});