import { test, expect } from '@playwright/test';

test.describe('Mobile App Testing - Staff Login', () => {
  const APP_PUBLIC_KEY = 'b_qaqnax4xyba4ddn5fhtmlxmp54';

  test('Should login as Staff (นิติบุคคล)', async ({ page }) => {
    // 1. เปิดหน้าเว็บ Appetize
    await page.goto(`https://appetize.io/app/${APP_PUBLIC_KEY}?device=pixel7&autoplay=true`);

    // 2. ให้เวลามันโหลดแอป 10 วินาทีพอ จะได้ไม่ช้าไป
    await page.waitForTimeout(10000); 

    // 3. ดึงขนาดหน้าจอ Browser 
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    if (viewport) {
      console.log(`Viewport Size: Width=${viewport.width}, Height=${viewport.height}`);

      // จุดกึ่งกลางหน้าจอมือถือ
      const centerX = ((viewport.width - 300) / 2) + 300;

      // 4. คลิกเลือกแท็บ "นิติบุคคล"
      await page.mouse.click(centerX + 80, viewport.height * 0.48);
      await page.waitForTimeout(500);

      // 5. คลิกช่อง "ชื่อผู้ใช้"
      await page.mouse.click(centerX, viewport.height * 0.55);
      await page.waitForTimeout(500); 
      await page.keyboard.type('bosszaza'); // เอา delay ออก จะได้พิมพ์ปรู๊ดเดียวจบ
      await page.waitForTimeout(500);

      // ซ่อนคีย์บอร์ด
      await page.mouse.click(centerX, viewport.height * 0.20);
      await page.waitForTimeout(500);

      // 6. คลิกช่อง "รหัสผ่าน" 
      await page.mouse.click(centerX, viewport.height * 0.63);
      await page.waitForTimeout(500);
      await page.keyboard.type('123456'); 
      await page.waitForTimeout(500);

      // ซ่อนคีย์บอร์ด
      await page.mouse.click(centerX, viewport.height * 0.20);
      await page.waitForTimeout(500); 

      // 7. คลิกปุ่ม "เข้าสู่ระบบ" 
      await page.mouse.click(centerX, viewport.height * 0.72);
      
      // รอแอปประมวลผล
      await page.waitForTimeout(4000);
    }

    // ถ่ายรูปผลลัพธ์
    await expect(page).toHaveScreenshot('mobile-app-staff-login-result.png', {
      maxDiffPixelRatio: 0.10
    });
  });
});
