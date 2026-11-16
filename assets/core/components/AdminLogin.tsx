"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, config, tr } from "@/lib/ui";
export function AdminLogin() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    try { await api("admin/session", { method: "POST", body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); router.replace("/admin"); router.refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="admin-shell admin-login"><main><form className="panel login" onSubmit={signIn}><p>{config.brand} · {tr("管理后台", "Admin")}</p><h1>{tr("管理员登录", "Admin sign in")}</h1>{error && <p className="error" role="alert">{error}</p>}<label>Email<input name="email" type="email" required autoComplete="username" /></label><label>{tr("密码", "Password")}<input name="password" type="password" required autoComplete="current-password" /></label><button disabled={busy}>{busy ? tr("登录中…", "Signing in…") : tr("登录", "Sign in")}</button></form></main></div>;
}
