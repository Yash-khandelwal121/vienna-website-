import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { ensureDbInitialized, db } from '../server/config/db.js';

async function resetPassword() {
  const newPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Vienna@2026';
  const targetEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@viennadaytrip.com').toLowerCase().trim();

  console.log(`Resetting admin password for: ${targetEmail}`);
  console.log(`Target password: ${newPassword}`);

  const salt = await bcrypt.genSalt(12);
  const newHash = await bcrypt.hash(newPassword, salt);

  // Initialize DB (which connects to Neon via cloud DNS fallback)
  await ensureDbInitialized();

  console.log(`PostgreSQL connected status: ${db.isConnectedToPostgres}`);

  // 1. Update in DB abstraction (PostgreSQL if connected + memory store)
  const updatedUser = await db.users.update({
    where: { email: targetEmail },
    data: { passwordHash: newHash, isActive: true }
  });

  console.log('Result from db.users.update:', updatedUser);

  // 2. Also ensure store.json on disk is explicitly updated with the exact hash
  const storePath = path.resolve('server/data/store.json');
  if (fs.existsSync(storePath)) {
    try {
      const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (storeData.users && Array.isArray(storeData.users)) {
        const userIdx = storeData.users.findIndex(u => u.email.toLowerCase() === targetEmail);
        if (userIdx !== -1) {
          storeData.users[userIdx].passwordHash = newHash;
          storeData.users[userIdx].updatedAt = new Date().toISOString();
        } else {
          storeData.users.push({
            id: 'usr_super_admin_vdt',
            email: targetEmail,
            passwordHash: newHash,
            name: process.env.INITIAL_ADMIN_NAME || 'Vienna Day Trip Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
        console.log('✅ Successfully confirmed store.json updated with hash');
      }
    } catch (storeError) {
      console.error('⚠️ store.json update error:', storeError.message);
    }
  }

  // 3. Verify reading user back from DB
  const userCheck = await db.users.findUnique({ where: { email: targetEmail } });
  console.log('User found in db after update:', {
    id: userCheck.id,
    email: userCheck.email,
    hasHash: !!userCheck.passwordHash
  });

  const isValid = await bcrypt.compare(newPassword, userCheck.passwordHash);
  console.log(`Verification (bcrypt.compare('${newPassword}', userCheck.passwordHash)): ${isValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);

  process.exit(0);
}

resetPassword().catch(err => {
  console.error('Fatal error resetting password:', err);
  process.exit(1);
});
