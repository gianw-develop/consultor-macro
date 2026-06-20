import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consultor Macro",
  description: "Dashboard macro pre-market para swing trading de índices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full bg-[var(--app-bg)] text-[var(--app-fg)]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
