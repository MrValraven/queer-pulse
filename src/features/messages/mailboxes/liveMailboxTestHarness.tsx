import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { queryClient as productionQueryClient } from "../../../shared/api/queryClient";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";

// Test support for live-mode mailbox suites (MSW). Imported by tests only.

export const PROFILE_IDENTITY_ID = "5f0c2a4e-1d7b-4c1e-9a52-0b6f3f1c2a01";
export const CAFE_IDENTITY_ID = "5f0c2a4e-1d7b-4c1e-9a52-0b6f3f1c2a02";

export function liveMailboxSummary(
  identityId: string,
  kind: MailboxSummary["kind"],
): MailboxSummary {
  const isProfile = kind === "profile";
  return {
    identityId,
    kind,
    displayName: isProfile ? "Live Member" : "Café Lisboa",
    handle: isProfile ? "live-member" : "cafe-lisboa",
    avatarUrl: null,
    unreadCount: 0,
    isOwner: true,
    isReadOnly: false,
    shouldShowStaffNames: isProfile ? null : true,
    shouldAllowMyName: isProfile ? null : true,
  };
}

export const LIVE_MAILBOXES: MailboxSummary[] = [
  liveMailboxSummary(PROFILE_IDENTITY_ID, "profile"),
  liveMailboxSummary(CAFE_IDENTITY_ID, "listing"),
];

/** The session and chrome endpoints every `TestProviders` render fires,
 *  mirroring `useMessagesController.activeDetail.test.tsx`, plus the mailbox
 *  list. */
export function registerLiveSessionHandlers(
  mailboxes: () => MailboxSummary[] = () => LIVE_MAILBOXES,
) {
  server.use(
    http.get(`${API_V1}/auth/me`, () =>
      HttpResponse.json({
        id: "live-member",
        email: "live-member@queerpulse.test",
        status: "active",
        role: "member",
        ageAttestedAt: "2026-01-01T00:00:00.000Z",
        onboardedAt: "2026-01-01T00:00:00.000Z",
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          pronouns: "they/them",
          avatarUrl: null,
        },
      }),
    ),
    http.get(`${API_V1}/me/bootstrap`, () =>
      HttpResponse.json({
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          vouchCount: 0,
          visibility: "open",
          limited: false,
        },
        saved: { items: [], total: 0, page: 1, pageSize: 0 },
        blocks: { items: [], total: 0, page: 1, pageSize: 0 },
        mutes: { items: [], total: 0, page: 1, pageSize: 0 },
      }),
    ),
    http.get(`${API_V1}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
      }),
    ),
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        signInOpen: true,
        inviteRequestsOpen: true,
        registrationOpen: true,
        announcement: null,
      }),
    ),
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    http.get(`${API_V1}/identities/mailboxes`, () =>
      HttpResponse.json(mailboxes()),
    ),
  );
}

/** Re-freezes the API config against a stubbed `VITE_API_URL` (live mode)
 *  and returns a `TestProviders` wrapper at `url`. Import the hook under test
 *  dynamically AFTER this, so it shares the fresh module instances. */
export async function loadLiveWrapper(url: string) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("../../../test/TestProviders");
  const prodDefaults = productionQueryClient.getDefaultOptions().queries;
  const client = new QueryClient({
    defaultOptions: { queries: { ...prodDefaults, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={client} initialEntries={[url]}>
      {children}
    </TestProviders>
  );
  return { wrapper, client };
}
