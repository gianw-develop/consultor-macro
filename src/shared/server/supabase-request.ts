import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { applicationOrigin, authConfiguration, emailAllowed } from "./auth-config";
export function requestAuth(request: Request) {
  const config = authConfiguration();
  if (!config) return null;
  const input = request instanceof NextRequest ? request : new NextRequest(request.url, {headers: request.headers});
  const changes = new Map<string, {name:string;value:string;options:CookieOptions}>();
  const client = createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, secure: new URL(applicationOrigin(request)).protocol === "https:", sameSite: "lax", path: "/", maxAge: 60*60*24*7 },
    cookies: {
      getAll() { return input.cookies.getAll(); },
      setAll(cookies) { for (const cookie of cookies) { input.cookies.set(cookie.name,cookie.value); changes.set(cookie.name,cookie); } },
    },
  });
  return { client, input,
    apply(response: NextResponse) {
      for (const {name,value,options} of changes.values()) response.cookies.set(name,value,options);
      response.headers.set("Cache-Control","private, no-store, max-age=0");
      response.headers.set("Pragma","no-cache");
      return response;
    },
    async user() {
      const {data,error} = await client.auth.getUser();
      if (error || !data.user) return null;
      return data.user;
    },
  };
}
export async function authorizedUser(auth: NonNullable<ReturnType<typeof requestAuth>>) {
  const user = await auth.user();
  return user?.email_confirmed_at && emailAllowed(user.email) ? user : null;
}
