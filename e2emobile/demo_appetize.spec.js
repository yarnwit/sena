const { test, expect } = require('@playwright/test');

test.describe('Mobile App Testing via Appetize.io', () => {
  // ข้อควรระวัง: นี่เป็นเพียงไฟล์ตัวอย่างการเซ็ตอัป คุณต้องไปนำ Public Key จากหน้า Dashboard ของ Appetize มาใส่
  const APP_PUBLIC_KEY = 'YOUR_APP_PUBLIC_KEY'; // <--- เปลี่ยนตรงนี้เป็น Key ของแอปคุณ

  test('Should load and interact with mobile app via Appetize', async ({ page }) => {
    // 1. เปิดหน้าเว็บ Appetize Embed
    // ใส่ autoplay=true เพื่อให้แอปเปิดขึ้นมาเองโดยไม่ต้องกด Tap to play
    await page.goto(`https://appetize.io/embed/${APP_PUBLIC_KEY}?device=iphone14pro&autoplay=true`);

    // 2. รอให้ iframe และหน้าจอโทรศัพท์ (Canvas) โหลดขึ้นมา
    // ปกติภาพแอปจะถูก render ลงบน <canvas>
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible', timeout: 30000 });

    // รอให้แอปบูทเสร็จสักพัก
    await page.waitForTimeout(5000); 

    // 3. หาวงกรอบ (Bounding Box) ของหน้าจอมือถือ
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      console.log(`Mobile Screen Location: X=${box.x}, Y=${box.y}, Width=${box.width}, Height=${box.height}`);

      // 4. จำลองการคลิก (Tap) ตรงกลางหน้าจอ
      // เนื่องจากเรามองไม่เห็นปุ่ม (Element) ภายในแอป เราต้องกะพิกัด X, Y เอาเอง
      await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));

      // รอแอปตอบสนองหลังคลิก
      await page.waitForTimeout(3000);
    }

    // 5. Assert ผลลัพธ์โดยการใช้ Visual Regression (เปรียบเทียบภาพหน้าจอ)
    // การรันครั้งแรกมันจะบันทึกรูปตั้งต้นไว้ การรันครั้งถัดไปจะเอามาเทียบกัน
    await expect(canvas).toHaveScreenshot('mobile-app-screen.png', {
      maxDiffPixelRatio: 0.05 // ยอมให้ภาพต่างกันได้เล็กน้อย (5%) ป้องกันเรื่องอนิเมชั่น
    });
  });
});
