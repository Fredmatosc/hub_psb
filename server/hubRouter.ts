import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import { router, publicProcedure } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import {
  getHubUserByUsername,
  getHubUserById,
  listHubUsers,
  createHubUser,
  updateHubUser,
  deleteHubUser,
  updateLastSignedIn,
  verifyPassword,
} from "./hubDb";

const HUB_COOKIE = "hub_session";
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "hub_psb_fallback_secret_key_2024"
);
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

async function signHubToken(userId: number, role: string): Promise<string> {
  return new SignJWT({ sub: String(userId), role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET_KEY);
}

async function verifyHubToken(token: string): Promise<{ userId: number; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return { userId: Number(payload.sub), role: payload.role as string };
  } catch {
    return null;
  }
}

// Parse cookies from the raw HTTP header (Express doesn't use cookie-parser)
function parseCookieHeader(req: { headers?: Record<string, unknown> | { cookie?: string } }): Record<string, string> {
  const cookieHeader = (req.headers as Record<string, unknown>)?.["cookie"];
  if (!cookieHeader || typeof cookieHeader !== "string") return {};
  return parseCookies(cookieHeader);
}

// Middleware: extract hub user from cookie
async function getHubUserFromCookie(req: { headers?: Record<string, unknown> | { cookie?: string }; cookies?: Record<string, string> }) {
  const cookies = parseCookieHeader(req);
  const token = cookies[HUB_COOKIE] ?? req.cookies?.[HUB_COOKIE];
  if (!token) return null;
  const payload = await verifyHubToken(token);
  if (!payload) return null;
  const user = await getHubUserById(payload.userId);
  if (!user || !user.active) return null;
  return user;
}

// Admin-only procedure for hub
const hubAdminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const hubUser = await getHubUserFromCookie(ctx.req as { cookies?: Record<string, string> });
  if (!hubUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado" });
  if (hubUser.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  return next({ ctx: { ...ctx, hubUser } });
});

// Authenticated procedure for hub
const hubAuthProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const hubUser = await getHubUserFromCookie(ctx.req as { cookies?: Record<string, string> });
  if (!hubUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado" });
  return next({ ctx: { ...ctx, hubUser } });
});

export const hubRouter = router({
  // --- Auth ---
  login: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await getHubUserByUsername(input.username);
      if (!user || !user.active) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos" });
      }
      if (!verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos" });
      }
      await updateLastSignedIn(user.id);
      const token = await signHubToken(user.id, user.role);
      const cookieOptions = { ...getSessionCookieOptions(ctx.req as Parameters<typeof getSessionCookieOptions>[0]), maxAge: SESSION_DURATION };
      ctx.res.cookie(HUB_COOKIE, token, cookieOptions);
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req as Parameters<typeof getSessionCookieOptions>[0]);
    ctx.res.clearCookie(HUB_COOKIE, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    const hubUser = await getHubUserFromCookie(ctx.req as { cookies?: Record<string, string> });
    if (!hubUser) return null;
    return {
      id: hubUser.id,
      username: hubUser.username,
      displayName: hubUser.displayName,
      role: hubUser.role,
    };
  }),

  // --- Admin: User Management ---
  listUsers: hubAdminProcedure.query(async () => {
    const users = await listHubUsers();
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
      lastSignedIn: u.lastSignedIn,
    }));
  }),

  createUser: hubAdminProcedure
    .input(
      z.object({
        username: z.string().min(3).max(64).regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e _"),
        password: z.string().min(6),
        displayName: z.string().max(128).optional(),
        role: z.enum(["user", "admin"]).default("user"),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await getHubUserByUsername(input.username);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Nome de usuário já existe" });
      }
      const user = await createHubUser({
        username: input.username,
        password: input.password,
        displayName: input.displayName,
        role: input.role,
      });
      return { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
    }),

  updateUser: hubAdminProcedure
    .input(
      z.object({
        id: z.number(),
        displayName: z.string().max(128).optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["user", "admin"]).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateHubUser(id, data);
      return { success: true };
    }),

  deleteUser: hubAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Prevent deleting self
      const me = await getHubUserFromCookie(ctx.req as { cookies?: Record<string, string> });
      if (me?.id === input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível excluir sua própria conta" });
      }
      await deleteHubUser(input.id);
      return { success: true };
    }),
});
