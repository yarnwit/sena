const crypto = require('crypto');
const fs = require('fs');

let secret = 'jVPU5Skc1uLuTIU8TSkmlq34o3X1uh/R1jzWW0aP5m7qEvlGLAOosStmXaYuHl9UrCcJgYrjvBx8jWVjty+MPA==';
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/JWT_SECRET=(.+)/);
  if (match && match[1]) {
    secret = match[1].trim();
  }
} catch (e) {
  // Ignore error if file doesn't exist
}

// จำลอง Payload ที่คล้ายกับตอนที่ Login ผ่าน Supabase หรือ Backend
const payload = {
  id: '00000000-0000-0000-0000-000000000000', // ตัวอย่าง UUID (เปลี่ยนเป็น UUID ของ user จริงได้)
  role: 'admin', // ตำแหน่งที่ต้องการทดสอบ: 'resident', 'staff', 'admin'
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000), // เวลาที่ออก Token
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // หมดอายุใน 7 วัน
};

const header = {
  alg: 'HS256',
  typ: 'JWT'
};

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const encodedHeader = base64url(header);
const encodedPayload = base64url(payload);

// สร้าง Signature ด้วย HMAC-SHA256
const signature = crypto
  .createHmac('sha256', secret)
  .update(encodedHeader + '.' + encodedPayload)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = `${encodedHeader}.${encodedPayload}.${signature}`;

console.log('\n=============================================');
console.log('🌟 TEST JWT TOKEN GENERATOR');
console.log('=============================================\n');
console.log('Payload Data:');
console.table(payload);
console.log('\n🔑 Your JWT Token:');
console.log('\x1b[32m%s\x1b[0m', token); // แสดงตัวหนังสือสีเขียว
console.log('\n=============================================\n');
console.log('👉 วิธีใช้งานเพื่อทดสอบ API:');
console.log('เพิ่ม Header ใน Postman หรือ cURL:');
console.log('Authorization: Bearer ' + token + '\n');
