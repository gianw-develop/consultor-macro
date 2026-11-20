import type { Metadata } from "next";
import "./globals.css";
import "../shared/ui/terminal.css";
import { AppShell } from "../shared/ui/app-shell";
import { localPreview } from "../shared/server/auth-config";
export const dynamic="force-dynamic";
export const metadata: Metadata = { title: "AWNexus · Entender antes de decidir", description: "Inteligencia macroeconómica visual con fuentes y fechas.", robots: {index:false,follow:false} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body className="terminal-theme"><AppShell local={localPreview()}>{children}</AppShell></body></html>;}
