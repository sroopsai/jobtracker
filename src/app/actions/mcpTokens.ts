'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { mcpApiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

async function requireAuthUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: You must be signed in.');
  }
  return userId;
}

export async function getUserMcpKeys() {
  const userId = await requireAuthUser();

  return await db
    .select({
      id: mcpApiKeys.id,
      name: mcpApiKeys.name,
      key: mcpApiKeys.key,
      createdAt: mcpApiKeys.createdAt,
    })
    .from(mcpApiKeys)
    .where(eq(mcpApiKeys.userId, userId));
}

export async function createMcpToken(name?: string) {
  const userId = await requireAuthUser();

  const tokenValue = `mcp_live_${crypto.randomBytes(24).toString('hex')}`;

  const [created] = await db
    .insert(mcpApiKeys)
    .values({
      userId,
      key: tokenValue,
      name: name && name.trim() ? name.trim() : 'MCP Client Access Token',
    })
    .returning();

  revalidatePath('/mcp');
  return created;
}

export async function revokeMcpToken(id: string) {
  const userId = await requireAuthUser();

  await db
    .delete(mcpApiKeys)
    .where(and(eq(mcpApiKeys.id, id), eq(mcpApiKeys.userId, userId)));

  revalidatePath('/mcp');
  return true;
}

export async function resolveUserIdFromToken(token: string): Promise<string | null> {
  if (!token) return null;

  const cleanToken = token.replace('Bearer ', '').trim();

  const [found] = await db
    .select({ userId: mcpApiKeys.userId })
    .from(mcpApiKeys)
    .where(eq(mcpApiKeys.key, cleanToken));

  return found ? found.userId : null;
}
