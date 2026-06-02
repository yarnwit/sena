import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Tu1');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'Audit Logs' }).click();
  await page.getByRole('textbox', { name: 'ค้นหาชื่อผู้ใช้, IP Address' }).click();
  await page.getByRole('textbox', { name: 'ค้นหาชื่อผู้ใช้, IP Address' }).fill('');
  await page.locator('#log-action-filter').selectOption('CHANGE_ROLE');
  await page.locator('#log-action-filter').selectOption('CREATE_COMPLAINT_BY_STAFF');
  await page.locator('#log-action-filter').selectOption('CREATE_USER');
  await page.locator('#log-action-filter').selectOption('DELETE_USER');
  await page.locator('#log-action-filter').selectOption('UPDATE_COMPLAINT');
  await page.locator('#log-action-filter').selectOption('UPDATE_COMPLAINT_BY_STAFF');
  await page.locator('#log-action-filter').selectOption('UPDATE_STATUS');
  await page.locator('#log-action-filter').selectOption('all');
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: 'หน้าถัดไป' }).click();
  await page.getByRole('button', { name: 'หน้าก่อนหน้า' }).click();
  await page.getByRole('button', { name: 'หน้าก่อนหน้า' }).click();
});