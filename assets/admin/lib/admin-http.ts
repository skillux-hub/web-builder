import { cookies } from "next/headers";
export const sessionCookie = "web_builder_admin";
export async function sessionToken() { return (await cookies()).get(sessionCookie)?.value; }
