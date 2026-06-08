import { cookies } from "next/headers";
import { DashboardClient } from "@/components/dashboard-client";
import { LoginForm } from "@/components/login-form";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { getDashboardData } from "@/lib/market";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const isAuthenticated = validateSessionToken(sessionToken);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-10">
        <LoginForm />
      </main>
    );
  }

  const initialData = await getDashboardData();

  return <DashboardClient initialData={initialData} />;
}