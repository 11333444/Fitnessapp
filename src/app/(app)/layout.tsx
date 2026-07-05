import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { getCurrentUserAndProfile } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUserAndProfile();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <NavBar isAdmin={session.profile.role === "admin"} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
