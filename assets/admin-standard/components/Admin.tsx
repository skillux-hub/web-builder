"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, config } from "@/lib/ui";
import { allowed } from "@/lib/permissions";
import { AdminSystem } from "./AdminSystem";
export function Admin(){const router=useRouter();const [error,setError]=useState(""),[tab,setTab]=useState("overview"),[permissions,setPermissions]=useState<string[]>([]);
  useEffect(()=>{api("admin/session").then(s=>setPermissions(s.admin.permissions)).catch(()=>router.replace("/admin/login"));},[]);
  async function signOut(){try{await api("admin/session",{method:"DELETE"});setPermissions([]);router.replace("/admin/login");router.refresh();}catch(e){setError((e as Error).message);}}
  const pages=[ ["roles","Roles & permissions","roles.manage"],["administrators","Administrators","admins.manage"],["logs","Audit logs","logs.view"],["settings","System settings","settings.manage"],["seo","SEO","seo.manage"],["password","Change password",""] ];
  return <div className="admin-shell"><header><strong>{config.brand} · Admin</strong><nav><button onClick={()=>setTab("overview")}>Workspace</button>{pages.filter(([, ,p])=>!p||allowed(permissions,p)).map(([id,label])=><button key={id} onClick={()=>setTab(id)}>{label}</button>)}<a href="/" target="_blank" rel="noreferrer">View website</a><button onClick={signOut}>Sign out</button></nav></header><main>{error&&<p className="error" role="alert">{error}</p>}{tab==="overview"?<section className="admin-card"><h1>Workspace</h1><p>Choose a management area above.</p></section>:<AdminSystem key={tab} tab={tab}/>}</main></div>;
}
