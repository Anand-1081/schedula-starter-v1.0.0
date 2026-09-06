import type { LoginCredentials, Session } from "@/features/auth/types";

export async function login(credentials: LoginCredentials): Promise<Session> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? "Unable to sign in");
  }

  return body.data as Session;
}
