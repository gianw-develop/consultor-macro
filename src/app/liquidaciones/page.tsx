import Link from "next/link";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/login-form";
import { LiquidacionesClient } from "@/components/liquidaciones-client";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { calculateLiquidationLevels, DEFAULT_LEVELS } from "@/lib/liquidation-clusters";

export const dynamic = "force-dynamic";

export default async function LiquidacionesPage() {
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

  const initialData = await calculateLiquidationLevels("BTC", DEFAULT_LEVELS);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
                Consultor Macro
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                Liquidaciones
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Niveles aproximados de liquidacion x25/x50/x100 sobre Open Interest publico de Binance Futures.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-fit items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Volver al dashboard
            </Link>
          </div>
        </header>

        <LiquidacionesClient initialSymbol="BTC" initialData={initialData} />
      </div>
    </main>
  );
}
