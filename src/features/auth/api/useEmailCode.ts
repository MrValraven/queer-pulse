/**
 * Mutations for email code sign-in and the reauth dialog.
 *
 * Routes, bodies and reasons follow the contract file
 * `QUEERPULSE-EMAIL-CODE-SIGN-IN-CONTRACT-2026-10-26.md`, the source of truth.
 *
 * Every caller words its own failures through `readEmailCodeFailure`, one
 * string per reason, so the global error toast is silenced on all four. Demo
 * mode answers from `emailCode.data.ts`, loaded on demand so the fixtures stay
 * out of the live bundle.
 */
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Language } from "../../../shared/i18n/types";
import {
  requestEmailCode,
  requestReauthCode,
  verifyEmailCode,
  verifyReauthCode,
  type EmailCodeChallenge,
  type EmailCodeVerifyRequest,
  type EmailCodeVerifyResult,
  type ReauthCodeChallenge,
  type ReauthCodeVerifyResult,
} from "./emailCode.api";

interface RequestEmailCodeVariables {
  email: string;
  locale: Language;
  isRegistration?: boolean;
}

interface VerifyReauthCodeVariables {
  challengeId: string;
  code: string;
}

export function useRequestEmailCode(): UseMutationResult<
  EmailCodeChallenge,
  Error,
  RequestEmailCodeVariables
> {
  const { demoMode } = useDemoMode();
  return useMutation<EmailCodeChallenge, Error, RequestEmailCodeVariables>({
    meta: { silentError: true },
    mutationFn: async ({ email, locale, isRegistration }) => {
      if (demoMode) {
        const demo = await import("../emailCode.data");
        await demo.demoLatency();
        return demo.demoEmailCodeChallenge();
      }
      return requestEmailCode(email, locale, isRegistration);
    },
  });
}

export function useVerifyEmailCode(): UseMutationResult<
  EmailCodeVerifyResult,
  Error,
  EmailCodeVerifyRequest
> {
  const { demoMode } = useDemoMode();
  return useMutation<EmailCodeVerifyResult, Error, EmailCodeVerifyRequest>({
    meta: { silentError: true },
    mutationFn: async (request) => {
      if (demoMode) {
        const demo = await import("../emailCode.data");
        await demo.demoLatency();
        return demo.demoVerifyEmailCode(request);
      }
      return verifyEmailCode(request);
    },
  });
}

export function useRequestReauthCode(): UseMutationResult<
  ReauthCodeChallenge,
  Error,
  Language
> {
  const { demoMode } = useDemoMode();
  return useMutation<ReauthCodeChallenge, Error, Language>({
    meta: { silentError: true },
    mutationFn: async (locale) => {
      if (demoMode) {
        const demo = await import("../emailCode.data");
        await demo.demoLatency();
        return demo.demoReauthCodeChallenge();
      }
      return requestReauthCode(locale);
    },
  });
}

export function useVerifyReauthCode(): UseMutationResult<
  ReauthCodeVerifyResult,
  Error,
  VerifyReauthCodeVariables
> {
  const { demoMode } = useDemoMode();
  return useMutation<ReauthCodeVerifyResult, Error, VerifyReauthCodeVariables>({
    meta: { silentError: true },
    mutationFn: async ({ challengeId, code }) => {
      if (demoMode) {
        const demo = await import("../emailCode.data");
        await demo.demoLatency();
        return demo.demoVerifyReauthCode(code);
      }
      return verifyReauthCode(challengeId, code);
    },
  });
}
