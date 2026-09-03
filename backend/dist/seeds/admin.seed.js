"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const hash_util_1 = require("../utils/hash.util");
const logger_1 = __importDefault(require("../config/logger"));
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
        const { data: existing } = await supabase_1.supabase
            .from('users')
            .select('user_id')
            .ilike('username', adminUsername)
            .single();
        if (existing) {
            logger_1.default.info('Admin account already exists. Skipping seed.');
            return;
        }
        // Hash password
        const passwordHash = await (0, hash_util_1.hashPassword)(adminPassword);
        // Create admin user
        const { data, error } = await supabase_1.supabase
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
            logger_1.default.error('Failed to seed admin:', error.message);
            process.exit(1);
        }
        logger_1.default.info(`✅ Admin account created successfully!`);
        logger_1.default.info(`   Username: ${adminUsername}`);
        logger_1.default.info(`   Password: ${adminPassword}`);
        logger_1.default.info(`   ⚠️  Please change the password after first login!`);
    }
    catch (error) {
        logger_1.default.error('Seed error:', error);
        process.exit(1);
    }
}
seedAdmin().then(() => process.exit(0));
