import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Tu1');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'รายงานสรุป' }).click();
  await page.getByRole('button', { name: 'วันนี้' }).click();
  await page.getByRole('button', { name: 'วันล่าสุด' }).click();
  await page.getByRole('button', { name: 'เดือนนี้' }).click();
  await page.getByRole('button', { name: 'รีเฟรช' }).click();
  await page.getByRole('button', { name: 'ทั้งหมด' }).click();
  await page.getByRole('button', { name: 'ออกรายงาน (Print)' }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await page.getByRole('cell', { name: 'dffg' }).click();
});