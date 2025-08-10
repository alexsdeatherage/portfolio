const bcrypt = require('bcryptjs');

const generateHash = async () => {
  const password = process.argv[2];
  
  if (!password) {
    console.error('Usage: node generate-password-hash.js <your-password>');
    console.error('Example: node generate-password-hash.js mySecurePassword123');
    process.exit(1);
  }

  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n=== Password Hash Generated ===');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\n=== Environment Variables to Set ===');
    console.log(`ADMIN_USERNAME=admin`);
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log(`JWT_SECRET=${generateRandomSecret()}`);
    console.log('\n=== Security Notes ===');
    console.log('1. Store these in your .env file or hosting platform environment variables');
    console.log('2. Never commit the .env file to version control');
    console.log('3. Use a strong, unique JWT_SECRET in production');
    console.log('4. Consider changing the admin username from "admin" to something unique');
    
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
};

const generateRandomSecret = () => {
  return require('crypto').randomBytes(64).toString('hex');
};

generateHash();
