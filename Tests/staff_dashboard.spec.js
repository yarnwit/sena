import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Bosszaza');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('cell', { name: 'หมาบ้าน 88/2' }).click();
  await page.getByRole('link', { name: 'ภาพรวมงาน' }).click();
  await page.locator('div').filter({ hasText: '25เรื่องร้องเรียนทั้งหมด' }).nth(4).click();
  await page.locator('div').filter({ hasText: 'รอดำเนินการ' }).nth(4).click();
  await page.locator('div').filter({ hasText: 'อนุมัติรับเรื่อง' }).nth(4).click();
  await page.locator('div').filter({ hasText: '3เข้าที่ประชุม' }).nth(4).click();
  await page.locator('div').filter({ hasText: 'กำลังดำเนินการ' }).nth(4).click();
  await page.locator('div').filter({ hasText: 'แก้ไขแล้ว / ปิด' }).nth(4).click();
  await page.locator('div').filter({ hasText: 'ปฏิเสธ' }).nth(4).click();
  await page.getByRole('link', { name: 'ดูทั้งหมด' }).click();
  await page.getByRole('link', { name: 'ภาพรวมงาน' }).click();
});