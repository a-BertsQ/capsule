import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/signin");
  }

  return (
    <main className="page-wrap flex-1 py-6 md:py-10">{children}</main>
  );
}