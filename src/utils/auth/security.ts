
import { User, AuthResponse } from '@/types/user';

// Basit hash fonksiyonu (production'da bcrypt kullanılmalı)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'beautiq_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Şifre doğrulama
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Token oluşturma
export const generateToken = (): string => {
  return crypto.randomUUID() + '_' + Date.now();
};

// Token doğrulama
export const verifyToken = (token: string): boolean => {
  if (!token) return false;
  const parts = token.split('_');
  if (parts.length !== 2) return false;
  
  const timestamp = parseInt(parts[1]);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  return (now - timestamp) < oneDay; // 24 saat geçerli
};
