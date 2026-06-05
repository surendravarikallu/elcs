import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin — ELCS" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  let adminUser = null;

  try {
    const supabase = await createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;

    if (!user) redirect("/admin/login");

    const { data: a } = await supabase
      .from("admin_users")
      .select("id, name")
      .eq("id", user.id)
      .single();

    adminUser = a;
    if (!adminUser) redirect("/");
  } catch (e: unknown) {
    // If Supabase env vars aren't set yet, show a helpful message
    if (e instanceof Error && e.message.includes("fetch")) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center font-mono text-sm text-foreground/50 space-y-2">
            <div className="text-accent">[ SUPABASE NOT CONFIGURED ]</div>
            <p>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local</p>
          </div>
        </div>
      );
    }
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminNav email={user!.email!} name={adminUser!.name} />
      <main className="flex-1 overflow-auto p-8 md:p-10">{children}</main>
    </div>
  );
}
