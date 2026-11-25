import { cookies } from "next/headers";
import {
  CUSTOMER_SESSION_COOKIE,
  createNexusCustomerSession,
  verifyFirebaseIdToken,
} from "@/lib/providers/nexus/customer-session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { idToken?: string } | null;
  const idToken = body?.idToken?.trim();
  if (!idToken) {
    return Response.json({ error: "Token de Google requerido" }, { status: 400 });
  }

  try {
    const profile = await verifyFirebaseIdToken(idToken);
    const session = await createNexusCustomerSession(profile);

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return Response.json({
      authenticated: true,
      customer: session.customer,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "No pudimos iniciar sesión" },
      { status: 401 },
    );
  }
}
