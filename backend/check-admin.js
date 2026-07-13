import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/UserModel.js';
import AdminAllowedEmail from './src/models/AdminAllowedEmailModel.js';

dotenv.config();

const EMAIL = 'drug.inventory.management.system@gmail.com';
const TEST_PASSWORD = 'calpol650';

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found in .env. Please set MONGO_URI and retry.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const normalizedEmail = String(EMAIL || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).lean();
    const allowed = await AdminAllowedEmail.findOne({ email: normalizedEmail, status: 'ACTIVE' }).lean();

    if (!user) {
      console.log('User not found:', normalizedEmail);
    } else {
      console.log('User found:', user.email);
      console.log(' - role:', user.role);
      console.log(' - _id:', user._id);
      console.log(' - password field present:', !!user.password);
      if (user.password) {
        const match = await bcrypt.compare(TEST_PASSWORD, user.password);
        console.log(` - does '${TEST_PASSWORD}' match stored hash?`, match);
        console.log(' - stored hash (prefix):', user.password.slice(0, 60));
      }
    }

    console.log('AdminAllowedEmail ACTIVE present:', !!allowed);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
