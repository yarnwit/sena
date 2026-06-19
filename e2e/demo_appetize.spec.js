const { test, expect } = require('@playwright/test');

test.describe('Mobile App Testing via Appetize.io', () => {
  // ข้อควรระวัง: นี่เป็นเพียงไฟล์ตัวอย่างการเซ็ตอัป คุณต้องไปนำ Public Key จากหน้า Dashboard ของ Appetize มาใส่
  const APP_PUBLIC_KEY = 'b_qaqnax4xyba4ddn5fhtmlxmp54'; // <--- อัปเดต Key แล้ว!

  test('Should load and interact with mobile app via Appetize', async ({ page }) => {
    // 1. เปิดหน้าเว็บ Appetize (ใช้ Play URL แทน Embed เพราะบัญชีฟรีโดนจำกัด)
    await page.goto(`https://appetize.io/app/${APP_PUBLIC_KEY}?device=pixel7&autoplay=true`);

    // 2. ให้เวลามันโหลดแบบดื้อๆ ไปเลย 15 วินาที (ไม่ต้องสน DOM แล้ว)
    await page.waitForTimeout(15000); 

    // 3. ดึงขนาดหน้าจอ Browser 
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    if (viewport) {
      console.log(`Viewport Size: Width=${viewport.width}, Height=${viewport.height}`);

      // คำนวณจุดกึ่งกลาง (บวกเผื่อ Sidebar ซ้ายมือของ Appetize ประมาณ 300px)
      const centerX = ((viewport.width - 300) / 2) + 300;
      
      // 4. จำลองการคลิกช่อง "ชื่อผู้ใช้" (ขยับ Y ลงมาที่ประมาณ 55% ของความสูงหน้าจอ)
      await page.mouse.click(centerX, viewport.height * 0.55);
      await page.waitForTimeout(1500); // รอคีย์บอร์ดมือถือเด้งขึ้นมา
      await page.keyboard.type('tanawat01', { delay: 100 }); // พิมพ์ Username
      await page.waitForTimeout(1000);

      // --- กดซ่อนคีย์บอร์ด โดยการคลิกพื้นที่ว่างด้านบน (Y=20%) ---
      await page.mouse.click(centerX, viewport.height * 0.20);
      await page.waitForTimeout(1500); // รอหน้าจอเลื่อนกลับลงมา

      // 5. จำลองการคลิกช่อง "รหัสผ่าน" (ขยับ Y ลงมาที่ประมาณ 63% ของความสูงหน้าจอ)
      await page.mouse.click(centerX, viewport.height * 0.63);
      await page.waitForTimeout(1500);
      await page.keyboard.type('123456', { delay: 100 }); 
      await page.waitForTimeout(1000);

      // --- กดซ่อนคีย์บอร์ดอีกรอบ ---
      await page.mouse.click(centerX, viewport.height * 0.20);
      await page.waitForTimeout(1500); 

      // 6. จำลองการคลิกปุ่ม "เข้าสู่ระบบ" (ขยับ Y ลงมาที่ประมาณ 72% ของความสูงหน้าจอ)
      await page.mouse.click(centerX, viewport.height * 0.72);
      
      // รอแอปประมวลผลล็อกอิน
      await page.waitForTimeout(6000);
    }

    // 7. ถ่ายรูปผลลัพธ์ (การรันครั้งแรกจะ Failed เสมอเพื่อบันทึกรูปตั้งต้น)
    await expect(page).toHaveScreenshot('mobile-app-login-result.png', {
      maxDiffPixelRatio: 0.10 
    });
  });
});
