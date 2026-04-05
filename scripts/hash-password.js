// Run: node scripts/hash-password.js
// Then copy the output hash into Render's ADMIN_PASSWORD_HASH env var

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter your admin password: ', async (password) => {
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log('\n✅ Copy this hash into Render as ADMIN_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('');
  rl.close();
});
