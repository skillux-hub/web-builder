import config from "../site.config.json";
export const permissionLabels = {
  "dashboard.view": "View dashboard", "catalog.view": "View products & inventory", "catalog.manage": "Manage products & categories",
  "orders.view": "View orders", "orders.manage": "Process orders & shipments", "customers.view": "View members", "customers.manage": "Manage member status",
  "roles.manage": "Manage roles & permissions", "admins.manage": "Manage administrators", "logs.view": "Read audit logs",
  "settings.manage": "Manage system settings", "seo.manage": "Manage SEO",
} as const;
export type Permission = keyof typeof permissionLabels;
const commerceRequested=((config as {modules?:string[]}).modules||[]).includes("orders");
export const defaultRoles=[{slug:"owner",name:"Owner",permissions:["*"]},...(commerceRequested?[
{slug:"manager",name:"Store manager",permissions:["dashboard.view","catalog.view","catalog.manage","orders.view","orders.manage","customers.view","customers.manage"]},
{slug:"catalog",name:"Catalog editor",permissions:["dashboard.view","catalog.view","catalog.manage"]},
{slug:"support",name:"Customer support",permissions:["dashboard.view","orders.view","orders.manage","customers.view"]}
]:[{slug:"manager",name:"Manager",permissions:["dashboard.view"]}])];
export function permissionList(raw?: string) { try { const value=JSON.parse(raw || "[]"); return Array.isArray(value)?value.filter((x):x is string=>typeof x==="string"):[]; } catch { return []; } }
export function allowed(permissions: string[], permission: string) { return permissions.includes("*") || permissions.includes(permission); }
