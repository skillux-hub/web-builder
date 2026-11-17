import type { Metadata } from "next";
import { config } from "@/lib/ui";
import "./globals.css";
import { settings } from "@/lib/settings";
export const dynamic="force-dynamic";
export async function generateMetadata():Promise<Metadata>{const site=await settings();return {title:site.seoTitle,description:site.seoDescription,robots:{index:site.allowIndexing,follow:site.allowIndexing},...(site.siteUrl?{metadataBase:new URL(site.siteUrl)}:{})};}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang={config.locale}><body>{children}</body></html>;
}
