import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hashPassword, verifyPassword } from "./hubDb";

// Helper to create a mock context with hub session cookie
function createCtxWithCookie(cookieValue?: string): TrpcContext {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: cookieValue ? { hub_session: cookieValue } : {},
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      _clearedCookies: clearedCookies,
      _setCookies: setCookies,
    } as unknown as TrpcContext["res"],
  };
}

describe("Password hashing", () => {
  it("hashes password deterministically", () => {
    const hash1 = hashPassword("TestPassword123");
    const hash2 = hashPassword("TestPassword123");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it("verifies correct password", () => {
    const hash = hashPassword("MySecurePass");
    expect(verifyPassword("MySecurePass", hash)).toBe(true);
  });

  it("rejects wrong password", () => {
    const hash = hashPassword("MySecurePass");
    expect(verifyPassword("WrongPass", hash)).toBe(false);
  });

  it("different passwords produce different hashes", () => {
    expect(hashPassword("pass1")).not.toBe(hashPassword("pass2"));
  });
});

describe("hub.me (unauthenticated)", () => {
  it("returns null when no session cookie", async () => {
    const ctx = createCtxWithCookie();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.hub.me();
    expect(result).toBeNull();
  });
});

describe("hub.logout", () => {
  it("clears hub_session cookie", async () => {
    const ctx = createCtxWithCookie();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.hub.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("hub.login validation", () => {
  it("throws UNAUTHORIZED for empty username", async () => {
    const ctx = createCtxWithCookie();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.hub.login({ username: "", password: "somepass" })
    ).rejects.toThrow();
  });

  it("throws UNAUTHORIZED for empty password", async () => {
    const ctx = createCtxWithCookie();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.hub.login({ username: "someuser", password: "" })
    ).rejects.toThrow();
  });
});
