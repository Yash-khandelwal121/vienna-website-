import bcrypt from 'bcryptjs';

/**
 * Hash a password using standard bcrypt with salt rounds 12
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function comparePassword(plainPassword, hash) {
  if (!plainPassword || !hash) return false;
  return bcrypt.compare(plainPassword, hash);
}
