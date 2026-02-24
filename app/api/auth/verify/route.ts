import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
