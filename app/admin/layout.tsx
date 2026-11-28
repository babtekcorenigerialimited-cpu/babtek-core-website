import "./founder-dashboard.css";
import {FounderWorkspaceNav} from "@/components/admin/founder-workspace-nav";
export default function AdminLayout({children}:{children:React.ReactNode}){
 return <><FounderWorkspaceNav/>{children}</>;
}
