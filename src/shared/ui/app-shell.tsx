"use client";
import Link from "next/link";
import { Brand } from "./brand";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NotebookProvider } from "./notebook";
import { DemoProvider } from "./demo-provider";
import { PRODUCT_AREAS } from "../navigation";
function Frame({children,local}:{children:React.ReactNode;local:boolean}) {
 const pathname=usePathname();
 const [sessionMessage,setSessionMessage]=useState("");
 if(pathname==="/acceso")return <div className="workspace">{children}</div>;
 return <div className="workspace"><a className="skip-link" href="#main-content">Saltar al contenido</a><header className="app-header"><Link className="brand" href="/annienexus" aria-label="AWNexus, principal"><Brand/></Link><nav aria-label="Navegación principal">{PRODUCT_AREAS.map(link=><Link href={link.href} key={link.id} aria-current={pathname===link.href?"page":undefined}>{link.label}</Link>)}</nav><div className="session-controls"><span className="demo-badge">{local?"VISTA PREVIA":"DATOS CON FECHA"}<span> · SIN DATOS EN VIVO</span></span>{!local&&<button className="session-exit" onClick={async()=>{try{const response=await fetch("/api/auth/logout",{method:"POST"});if(!response.ok)throw new Error();window.location.replace("/acceso");}catch{setSessionMessage("No se pudo cerrar la sesión. Inténtalo otra vez.");}}}>Salir</button>}<span role="status">{sessionMessage}</span></div></header>{children}<footer className="app-footer"><span className="footer-brand"><Brand/></span><span>Entender antes de decidir.</span><span>{local?"Vista previa local · ":""}Sin operaciones automáticas</span></footer></div>;
}
export function AppShell({children,local}:{children:React.ReactNode;local:boolean}) {return <DemoProvider><NotebookProvider local={local}><Frame local={local}>{children}</Frame></NotebookProvider></DemoProvider>;}
