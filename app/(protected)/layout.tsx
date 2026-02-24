import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAuthenticated } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmailVerificationBanner from "@/app/components/EmailVerificationBanner";
import SessionValidator from "@/app/components/SessionValidator";

export const revalidate = 0; // Never cache this layout
export const dynamic = "force-dynamic"; // Force dynamic rendering

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;

  // Check if session exists in database
  let session = null;
  if (token) {
    session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    // If session not found or expired, redirect to signin
    if (!session || session.expires < new Date()) {
      redirect("/signin");
    }
  } else {
    // No token at all, not authenticated
    redirect("/signin");
  }

  const userEmailVerified = !!session?.user?.emailVerified;

  return (
    <>
      <SessionValidator />
      {userEmailVerified === false && <EmailVerificationBanner />}
      <main className="page-wrap flex-1 py-6 md:py-10">{children}</main>
    </>
  );
}