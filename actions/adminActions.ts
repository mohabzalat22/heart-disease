'use server';

import { SystemRepo } from '../repositories/systemRepo';
import { verifyToken } from '../lib/auth';
import { UserRepo } from '../repositories/userRepo';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;

  const payload = await verifyToken(token);
  if (!payload) return false;

  const user = await UserRepo.findById(payload.userId);
  return user?.role === 'ADMIN';
}

export async function updateGlobalPrompt(prompt: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  await SystemRepo.updateDefaultPrompt(prompt);
  revalidatePath('/admin');
  return { success: true };
}

export async function getGlobalPrompt() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return '';
  }
  return await SystemRepo.getDefaultPrompt();
}

export async function getLogs(
  page = 1,
  pageSize = 50,
  level?: string,
  date?: string
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const logFile = path.join(process.cwd(), 'logs', 'app.log');

  if (!fs.existsSync(logFile)) {
    return { logs: [], total: 0, pages: 0 };
  }

  try {
    const content = fs.readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n');

    let parsedLogs = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return {
          time: new Date().toISOString(),
          level: 'error',
          message: 'Failed to parse log line',
          meta: line,
        };
      }
    });

    // Apply filtering
    if (level && level !== 'all') {
      parsedLogs = parsedLogs.filter(
        (log) => log.level.toLowerCase() === level.toLowerCase()
      );
    }

    if (date) {
      const filterDate = new Date(date).toDateString();
      parsedLogs = parsedLogs.filter(
        (log) => new Date(log.time).toDateString() === filterDate
      );
    }

    // Sort by time descending
    parsedLogs.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const total = parsedLogs.length;
    const pages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedLogs = parsedLogs.slice(offset, offset + pageSize);

    return {
      logs: paginatedLogs,
      total,
      pages,
    };
  } catch (error) {
    console.error('Error reading logs:', error);
    return { logs: [], total: 0, pages: 0 };
  }
}

export async function getAllUsers() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const users = await UserRepo.findAll();
  // Strip passwords
  return users.map((user) => user);
}

export async function toggleUserStatus(userId: number, isActive: boolean) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) throw new Error('Unauthorized');

  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');

  if (payload.userId === userId && !isActive) {
    throw new Error('You cannot deactivate your own account.');
  }

  const admin = await UserRepo.findById(payload.userId);
  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  await UserRepo.updateStatus(userId, isActive);
  revalidatePath('/admin');
  return { success: true };
}
