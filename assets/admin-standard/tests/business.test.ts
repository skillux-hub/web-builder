import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const temp = mkdtempSync(join(tmpdir(), "web-builder-auth-"));
process.env.DATABASE_URL = "file:" + join(temp, "test.db").replaceAll("\\", "/");
let db: typeof import("../lib/db").db;
let auth: typeof import("../lib/auth");
before(async () => {
  execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/prepare-db.ts"], { env: process.env, stdio: "pipe" });
  execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "push", "--config", "prisma7.config.ts"], { env: process.env, stdio: "pipe" });
  db = (await import("../lib/db")).db; auth = await import("../lib/auth");
  await db.admin.create({ data: { email: "admin@example.test", passwordHash: auth.hashPassword("example-password-123") } });
});
after(async () => { if (db) await db.$disconnect(); rmSync(temp, { recursive: true, force: true }); });
test("admin authentication, persistent sessions, expiry and revocation", async () => {
  await assert.rejects(() => auth.requireAdmin(undefined), /login required/);
  await assert.rejects(() => auth.login("admin@example.test", "wrong"), /Invalid/);
  const token = await auth.login("admin@example.test", "example-password-123");
  assert.ok(await auth.requireAdmin(token));
  await db.$disconnect();
  assert.ok(await auth.requireAdmin(token));
  await auth.logout(token);
  await assert.rejects(() => auth.requireAdmin(token), /expired/);
  const expired = await auth.login("admin@example.test", "example-password-123");
  await db.adminSession.update({ where: { tokenHash: auth.digest(expired) }, data: { expiresAt: new Date(0) } });
  await assert.rejects(() => auth.requireAdmin(expired), /expired/);
});
test("failed logins are rate-limited in the database", async () => {
  for (let i = 0; i < 8; i++) await assert.rejects(() => auth.login("unknown@example.test", "bad-password"), /Invalid/);
  await assert.rejects(() => auth.login("unknown@example.test", "bad-password"), /Too many/);
});

let foundationActor: Awaited<ReturnType<typeof auth.adminIdentity>>;
test("foundation roles enforce grants, revoke permissions immediately and protect the last owner",async()=>{
  const governance=await import("../lib/governance");
  const ownerRole=await db.role.create({data:{slug:"owner",name:"Owner",permissionsJson:'["*"]'}});
  await db.admin.create({data:{email:"foundation-owner@example.test",name:"Owner",roleId:ownerRole.id,passwordHash:auth.hashPassword("foundation-owner-1234")}});
  foundationActor=await auth.adminIdentity(await auth.login("foundation-owner@example.test","foundation-owner-1234"));
  const role=await governance.saveRole(foundationActor,{name:"Test operator",permissions:["logs.view"]});
  const operator=await governance.saveAdministrator(foundationActor,{name:"Operator",email:"foundation-operator@example.test",password:"foundation-operator-1234",roleId:role.id});
  const token=await auth.login(operator.email,"foundation-operator-1234");
  assert.equal(await auth.requireAdmin(token,"logs.view"),operator.id);
  await assert.rejects(()=>auth.requireAdmin(token,"roles.manage"),/permission/);
  await governance.saveRole(foundationActor,{id:role.id,name:"Restricted",permissions:[]});
  await assert.rejects(()=>auth.requireAdmin(token,"logs.view"),/permission/);
  await assert.rejects(()=>governance.saveRole({...foundationActor,permissions:["roles.manage"]},{name:"Escalation",permissions:["admins.manage"]}),/cannot grant/);
  await assert.rejects(()=>governance.saveAdministrator(foundationActor,{id:foundationActor.id,name:"Owner",email:foundationActor.email,roleId:ownerRole.id,active:false}),/at least one/);
});
test("foundation settings and SEO are persisted without exposing credentials",async()=>{
  const governance=await import("../lib/governance");
  await governance.saveSettings(foundationActor,{storeName:"Configured business",contactEmail:"",maintenance:true,lowStockThreshold:4});
  await governance.saveSettings(foundationActor,{seoTitle:"Configured SEO",seoDescription:"Configured description",siteUrl:"https://example.test",allowIndexing:false},true);
  const site=await governance.settings();assert.equal(site.storeName,"Configured business");assert.equal(site.seoTitle,"Configured SEO");assert.equal(site.maintenance,true);
  await governance.saveSettings(foundationActor,{...site,maintenance:false});
});
test("foundation password change requires the old password and revokes all sessions",async()=>{
  const governance=await import("../lib/governance");
  const token=await auth.login("foundation-owner@example.test","foundation-owner-1234");
  await assert.rejects(()=>governance.changePassword(foundationActor,{currentPassword:"wrong",newPassword:"foundation-new-1234"}),/incorrect/);
  await governance.changePassword(foundationActor,{currentPassword:"foundation-owner-1234",newPassword:"foundation-new-1234"});
  await assert.rejects(()=>auth.requireAdmin(token),/expired/);
  assert.ok(await auth.requireAdmin(await auth.login("foundation-owner@example.test","foundation-new-1234")));
  const logs=JSON.stringify(await db.auditLog.findMany());assert.ok(logs.includes("administrator.password"));assert.ok(!logs.includes("foundation-new-1234"));assert.ok(!logs.includes(token));
});
