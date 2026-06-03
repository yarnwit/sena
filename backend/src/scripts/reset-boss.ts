import { UserModel } from '../models/User.model';
import { hashPassword } from '../utils/hash.util';

async function reset() {
  const user = await UserModel.findByUsername('bosszaza');
  if (user) {
    const newHash = await hashPassword('123456');
    await UserModel.updatePassword(user.user_id, newHash);
    console.log('Password reset successfully for bosszaza to 123456');
  } else {
    console.log('User bosszaza not found');
  }
}

reset().then(() => process.exit(0)).catch(console.error);
