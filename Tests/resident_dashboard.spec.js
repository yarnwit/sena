import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Te_Trax');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ดูทั้งหมด' }).click();
  await page.getByRole('link', { name: 'ภาพรวม' }).click();
  await page.getByRole('row', { name: 'TK260530-2686 dffg 88/134 30' }).getByRole('link').click();
  await page.getByRole('link', { name: 'ภาพรวม' }).click();
});