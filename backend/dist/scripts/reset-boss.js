"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../models/User.model");
const hash_util_1 = require("../utils/hash.util");
async function reset() {
    const user = await User_model_1.UserModel.findByUsername('bosszaza');
    if (user) {
        const newHash = await (0, hash_util_1.hashPassword)('123456');
        await User_model_1.UserModel.updatePassword(user.user_id, newHash);
        console.log('Password reset successfully for bosszaza to 123456');
    }
    else {
        console.log('User bosszaza not found');
    }
}
reset().then(() => process.exit(0)).catch(console.error);
