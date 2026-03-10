import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { getDb } from "./db";
import { hubUsers, InsertHubUser, HubUser } from "../drizzle/schema";

// Simple SHA-256 hash for passwords (no external deps needed)
export function hashPassword(password: string): string {
  return createHash("sha256").update(password + "hub_psb_salt_2024").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function getHubUserByUsername(username: string): Promise<HubUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hubUsers).where(eq(hubUsers.username, username)).limit(1);
  return result[0];
}

export async function getHubUserById(id: number): Promise<HubUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hubUsers).where(eq(hubUsers.id, id)).limit(1);
  return result[0];
}

export async function listHubUsers(): Promise<HubUser[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hubUsers).orderBy(hubUsers.createdAt);
}

export async function createHubUser(data: {
  username: string;
  password: string;
  displayName?: string;
  role?: "user" | "admin";
}): Promise<HubUser> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = hashPassword(data.password);
  await db.insert(hubUsers).values({
    username: data.username,
    passwordHash,
    displayName: data.displayName ?? data.username,
    role: data.role ?? "user",
    active: true,
  });

  const created = await getHubUserByUsername(data.username);
  if (!created) throw new Error("Failed to create user");
  return created;
}

export async function updateHubUser(
  id: number,
  data: {
    displayName?: string;
    password?: string;
    role?: "user" | "admin";
    active?: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Partial<InsertHubUser> = {};
  if (data.displayName !== undefined) updateSet.displayName = data.displayName;
  if (data.password !== undefined) updateSet.passwordHash = hashPassword(data.password);
  if (data.role !== undefined) updateSet.role = data.role;
  if (data.active !== undefined) updateSet.active = data.active;

  if (Object.keys(updateSet).length > 0) {
    await db.update(hubUsers).set(updateSet).where(eq(hubUsers.id, id));
  }
}

export async function deleteHubUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(hubUsers).where(eq(hubUsers.id, id));
}

export async function updateLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(hubUsers).set({ lastSignedIn: new Date() }).where(eq(hubUsers.id, id));
}

/**
 * Seed the default admin user if it doesn't exist yet.
 * Called on server startup.
 */
export async function seedAdminUser(): Promise<void> {
  const existing = await getHubUserByUsername("fredmatos");
  if (!existing) {
    await createHubUser({
      username: "fredmatos",
      password: "Thor40302010",
      displayName: "Fred Matos",
      role: "admin",
    });
    console.log("[HUB PSB] Admin user 'fredmatos' created.");
  }
}
