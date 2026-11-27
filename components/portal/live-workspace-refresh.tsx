"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
export function LiveWorkspaceRefresh(){
 const router=useRouter();const [lastSync,setLastSync]=useState("");
 useEffect(()=>{const refresh=()=>{if(document.visibilityState==="visible"){router.refresh();setLastSync(new Date().toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"}));}};const timer=window.setInterval(refresh,30000);window.addEventListener("focus",refresh);setLastSync(new Date().toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"}));return()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);};},[router]);
 return <span className="workspace-live" title="Workspace data refreshes while this page is open"><i/>Live sync · {lastSync||"starting"}</span>;
}
