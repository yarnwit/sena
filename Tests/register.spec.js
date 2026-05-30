import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('link', { name: 'สมัครสมาชิก' }).click();
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).click();
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).fill('ไดโนเสาร์');
  await page.getByRole('textbox', { name: 'นามสกุล' }).click();
  await page.getByRole('textbox', { name: 'นามสกุล' }).fill('พี่เต้');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Te_Trax');
  await page.getByRole('textbox', { name: 'บ้านเลขที่' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่' }).fill('88/134');
  await page.getByRole('textbox', { name: 'เฟส' }).click();
  await page.getByRole('textbox', { name: 'เฟส' }).fill('3');
  await page.getByRole('textbox', { name: 'ซอย' }).click();
  await page.getByRole('textbox', { name: 'ซอย' }).fill('2');
  await page.getByRole('textbox', { name: 'เบอร์โทรศัพท์' }).click();
  await page.getByRole('textbox', { name: 'เบอร์โทรศัพท์' }).fill('0764571657');
  await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
});