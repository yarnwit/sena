import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้งาน' }).fill('Te_Trax');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'สร้างคำร้อง' }).click();
  await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).click();
  await page.getByRole('textbox', { name: 'เช่น น้ำรั่วซึม, ท่อระบายน้ำตัน' }).fill('อยากเลี้ยงไดโนเสาร์');
  await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).click();
  await page.getByRole('textbox', { name: 'อธิบายรายละเอียดปัญหาที่พบ' }).fill('พี่เต้จะพาฝันผมเป็นจริงไหม');
  await page.locator('div').filter({ hasText: /^แนบไฟล์เอกสาร\/ รูปภาพ$/ }).click();
  await page.getByRole('textbox', { name: 'สำนักงาน' }).click();
  await page.getByRole('textbox', { name: 'สำนักงาน' }).fill('บ้าน');
  await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
  await page.getByRole('button', { name: 'ยกเลิก' }).click();
  await page.getByRole('button', { name: 'บันทึกคำร้อง' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await page.getByRole('link', { name: 'สร้างคำร้อง', exact: true }).click();
  await page.getByRole('link', { name: 'ยกเลิก' }).click();
});