import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

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

  // User is authenticated but not in admin_users table
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center font-mono space-y-3 max-w-sm px-6">
          <div className="text-accent text-[10px] tracking-[0.45em]">[ ACCESS DENIED ]</div>
          <p className="text-sm text-foreground/50">
            Your account ({user!.email}) is not in the admin_users table.
          </p>
          <p className="text-xs text-foreground/30">
            Run this in Supabase SQL Editor:
          </p>
          <pre className="text-left text-[10px] text-foreground/50 bg-card border border-foreground/10 p-3 rounded overflow-auto">
{`INSERT INTO admin_users (id, email, name)
VALUES (
  '${user!.id}',
  '${user!.email}',
  'Your Name'
)
ON CONFLICT (id) DO NOTHING;`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <AdminShell email={user!.email!} name={adminUser!.name}>
      {children}
    </AdminShell>
  );
}
