import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { BusinessError } from "@/lib/errors";
import { sessionCookie } from "@/lib/admin-http";
export default async function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  try { await requireAdmin((await cookies()).get(sessionCookie)?.value); }
  catch (error) { if (error instanceof BusinessError && error.status === 401) redirect("/admin/login"); throw error; }
  return children;
}
