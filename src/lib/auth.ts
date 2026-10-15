import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/lib/roles";

export type { Role };

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "snel-cvs-kitambo-secret-key-2024"
);

export interface JWTPayload {
  userId: number;
  email: string;
  role: Role;
  nom: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Non authentifié");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Accès interdit : rôle insuffisant");
  }

  return user;
}
