import { supabase } from '../config/supabase';
import { hashPassword } from '../utils/hash.util';
import logger from '../config/logger';

/**
 * Database seeding — สร้าง Admin account เริ่มต้น
 * รัน: npx ts-node src/seeds/admin.seed.ts
 */
async function seedAdmin() {
  const adminUsername = 'admin';
  const adminPassword = 'admin123456';
  const adminEmail = 'admin@sena.local';

  try {
    // Check if admin already exists
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .ilike('username', adminUsername)
      .single();

    if (existing) {
      logger.info('Admin account already exists. Skipping seed.');
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: adminUsername,
        password_hash: passwordHash,
        first_name: 'System',
        last_name: 'Admin',
        role: 'admin',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to seed admin:', error.message);
      process.exit(1);
    }

    logger.info(`✅ Admin account created successfully!`);
    logger.info(`   Username: ${adminUsername}`);
    logger.info(`   Password: ${adminPassword}`);
    logger.info(`   ⚠️  Please change the password after first login!`);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
}

seedAdmin().then(() => process.exit(0));
