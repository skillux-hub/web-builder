import { config, tr } from "@/lib/ui";
export default function Page() {
  return <div className="storefront"><header><strong>{config.brand}</strong><nav>{config.adminRequired && <a href="/admin">{tr("管理后台", "Admin")}</a>}</nav></header><main><h1>{config.brand}</h1><p>{tr("欢迎访问", "Welcome")}</p></main></div>;
}
