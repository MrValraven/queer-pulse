import type { Catalog } from "../../types";

/**
 * Auth surfaces. Extracted as a small extra namespace to prove the multi-namespace
 * pattern; expand as the auth pages migrate (see README extraction workflow).
 */
export const auth: Catalog = {
  "signIn.title": "Welcome back",
  "signIn.subtitle": "Sign in to pick up where you left off.",
  "signIn.email": "Email",
  "signIn.password": "Password",
  "signIn.submit": "Sign in",
  "signIn.forgot": "Forgot your password?",
};
