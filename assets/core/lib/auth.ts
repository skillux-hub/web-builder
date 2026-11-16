import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { BusinessError, text } from "./errors";
import { allowed, permissionList, type Permission } from "./permissions";

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  const expected = Buffer.from(hash || "", "hex");
  const actual = scryptSync(password, salt || "invalid", 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export async function login(emailInput: unknown, passwordInput: unknown) {
  const email = text(emailInput, "email").toLowerCase();
  const password = text(passwordInput, "password", 256);
  const key = digest(email);
  const now = new Date();
  const throttle = await db.loginThrottle.findUnique({ where: { key } });
  if (throttle && throttle.resetAt > now && throttle.attempts >= 8) throw new BusinessError("Too many attempts; retry after 15 minutes", 429);
  if (throttle && throttle.resetAt <= now) await db.loginThrottle.deleteMany({ where: { key, resetAt: { lte: now } } });
  const admin = await db.admin.findUnique({ where: { email } });
  const valid = verifyPassword(password, admin?.passwordHash || "invalid:" + "0".repeat(128));
  if (!admin || !admin.active || !valid) {
    await db.loginThrottle.upsert({ where: { key }, create: { key, attempts: 1, resetAt: new Date(Date.now() + 900000) }, update: { attempts: { increment: 1 } } });
    await db.auditLog.create({ data: { actor: email, action: "auth.login", success: false } });
    throw new BusinessError("Invalid email or password", 401);
  }
  await db.loginThrottle.deleteMany({ where: { key } });
  const token = randomBytes(32).toString("hex");
  await db.adminSession.create({ data: { tokenHash: digest(token), adminId: admin.id, expiresAt: new Date(Date.now() + 8 * 3600000) } });
  await db.auditLog.create({ data: { actorId: admin.id, actor: admin.email, action: "auth.login" } });
  return token;
}
export async function adminIdentity(token: string | undefined) {
  if (!token) throw new BusinessError("Admin login required", 401);
  const session = await db.adminSession.findUnique({ where: { tokenHash: digest(token) }, include: { admin: { include: { role: true } } } });
  if (!session || session.expiresAt <= new Date() || !session.admin.active) throw new BusinessError("Admin session expired", 401);
  return { id: session.admin.id, email: session.admin.email, name: session.admin.name, roleId: session.admin.roleId, role: session.admin.role?.name || "Unassigned", permissions: permissionList(session.admin.role?.permissionsJson) };
}
export async function requireAdmin(token: string | undefined, permission?: Permission) {
  const admin = await adminIdentity(token);
  if (permission && !allowed(admin.permissions, permission)) throw new BusinessError("You do not have permission for this action", 403);
  return admin.id;
}
export async function logout(token: string | undefined) {
  if (token) {const session=await db.adminSession.findUnique({where:{tokenHash:digest(token)},include:{admin:true}});await db.adminSession.deleteMany({ where: { tokenHash: digest(token) } });if(session)await db.auditLog.create({data:{actorId:session.adminId,actor:session.admin.email,action:"auth.logout"}});}
}
