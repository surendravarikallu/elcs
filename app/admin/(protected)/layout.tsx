import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin — ELCS" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Keep Supabase calls in try/catch but redirect() calls outside —
  // redirect() throws a special Next.js error that must NOT be caught here.
  let user = null;
  let adminUser: { id: string; name: string | null } | null = null;
  let configError = false;

  try {
    const supabase = await createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;

    if (user) {
      const { data: a } = await supabase
        .from("admin_users")
        .select("id, name")
        .eq("id", user.id)
        .single();
      adminUser = a as { id: string; name: string | null } | null;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("fetch") || msg.includes("ECONNREFUSED") || msg.includes("Invalid URL")) {
      configError = true;
    }
    // Other errors: leave user = null so the redirect below fires
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center font-mono text-sm text-foreground/50 space-y-2">
          <div className="text-accent">[ SUPABASE NOT CONFIGURED ]</div>
          <p>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local</p>
        </div>
      </div>
    );
  }

  // redirect() is called OUTSIDE try/catch so Next.js can handle the throw
  if (!user) redirect("/admin/login");
  if (!adminUser) redirect("/");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminNav email={user!.email!} name={adminUser!.name} />
      <main className="flex-1 overflow-auto p-8 md:p-10">{children}</main>
    </div>
  );
}
