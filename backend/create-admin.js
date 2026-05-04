import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/UserModel.js';
import AdminAllowedEmail from './src/models/AdminAllowedEmailModel.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const email = 'drug.inventory.management.system@gmail.com';
    const password = 'calpol650';
    
    // Step 1: Add email to AdminAllowedEmail collection
    const adminEmail = await AdminAllowedEmail.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        email: email.toLowerCase(),
        status: 'ACTIVE',
        addedBy: 'SYSTEM',
        reason: 'Initial admin setup'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Admin email authorized:', adminEmail.email);
    
    // Step 2: Create or update user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: 'Admin User',
        email: email,
        password: password,
        role: 'ADMIN'
      });
      console.log('✅ Admin user created:', user.email);
    } else {
      console.log('ℹ️ Admin user already exists:', user.email);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}).catch(e => { 
  console.error('❌ Database connection error:', e.message); 
  process.exit(1); 
});
