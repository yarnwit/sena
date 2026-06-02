import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Tu1');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByText('กิจกรรมล่าสุดAudit log ล่าสุดดู Logs →').click();
  await page.getByRole('link', { name: 'จัดการผู้ใช้ →' }).click();
  await page.getByRole('link', { name: 'ภาพรวมระบบ' }).click();
  await page.getByRole('link', { name: 'ดู Logs →' }).click();
  await page.getByRole('link', { name: 'ภาพรวมระบบ' }).click();
  await page.getByText('TTest Cache@').click();
  await page.locator('div').filter({ hasText: /^ผู้ใช้ เปลี่ยนสถานะ \(approved → in_meeting\)8 นาทีที่แล้ว$/ }).first().click();
  await page.getByRole('button', { name: 'รีเฟรช' }).click();
  await page.getByRole('link', { name: 'ดูทั้งหมด →' }).click();
  await page.goto('http://localhost:3000/admin/reports');
  await page.getByRole('link', { name: 'ภาพรวมระบบ' }).click();
  await page.getByRole('cell', { name: 'TK260602-3324' }).click();
});