import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminMember, MemberDetail } from "../adminMembers.data";
import {
  patchStaffRolesInCache,
  restoreStaffRolesSnapshot,
  useGrantStaffRole,
  useRevokeStaffRole,
} from "./useAdminMembers";

/**
 * Admin "Roles & access" — optimistic cache patch (staff-roles plan, Task 9).
 *
 * Grant/revoke patch the SAME `["admin-members"]` cache prefix the roster
 * (`useInfiniteQuery`) and the open drawer (`useAdminMember`) read from — no
 * local override map — mirroring `adminListings.optimistic.test.tsx`. These
 * tests pin: the patch reaches BOTH the roster's infinite-query pages and the
 * detail query, dedupes on grant, filters on revoke, leaves the unrelated
 * flagged-members cache untouched, and `restoreStaffRolesSnapshot` reverses
 * the patch exactly — the mechanism `onError` uses to roll back a failed live
 * mutation. Demo mode never errors (its `mutationFn` always resolves), so the
 * rollback path is exercised directly at the helper level rather than by
 * forcing a network failure, same tradeoff the listings suite makes.
 *
 * Demo mode is forced on (empty VITE_API_URL), so the real
 * `useGrantStaffRole`/`useRevokeStaffRole` mutations run their optimistic
 * patch without touching the network.
 */

interface RosterPageVM {
  items: AdminMember[];
  total: number;
  page: number;
  pageSize: number;
}

function makeMember(
  id: string,
  staffRoles: AdminMember["staffRoles"],
): AdminMember {
  return {
    id,
    slug: id,
    name: id,
    initials: "AA",
    tone: "jade",
    pronoun: "",
    verified: true,
    role: "member",
    statusTone: "jade",
    newThisWeek: false,
    meta: "",
    vouchCount: 0,
    vouchedBy: [],
    staffRoles,
  };
}

function makeDetail(
  id: string,
  staffRoles: MemberDetail["staffRoles"],
): MemberDetail {
  return {
    id,
    role: "member",
    isSystem: false,
    glance: [],
    graphNote: "",
    communities: [],
    contributions: [],
    moderationTimeline: [],
    removeBody: "",
    graph: { center: { initials: "AA", tone: "jade" }, nodes: [] },
    staffRoles,
  };
}

function makeRosterPage(members: AdminMember[]): InfiniteData<RosterPageVM> {
  return {
    pages: [{ items: members, total: members.length, page: 1, pageSize: 20 }],
    pageParams: [1],
  };
}

/** Mirrors the private query-key shapes in `useAdminMembers.ts`. Demo mode is
 *  forced on in tests, so `demoMode` is always `true` here. */
function rosterKey(language: string) {
  return ["admin-members", true, "all", language] as const;
}
function detailKey(memberId: string, language: string) {
  return ["admin-members", "detail", memberId, true, language] as const;
}
function flaggedKey(language: string) {
  return ["admin-members", "flagged", true, language] as const;
}

describe("patchStaffRolesInCache / restoreStaffRolesSnapshot", () => {
  it("adds a role to both the roster page and the open drawer detail", async () => {
    const client = new QueryClient();
    client.setQueryData(rosterKey("en"), makeRosterPage([makeMember("m1", [])]));
    client.setQueryData(detailKey("m1", "en"), makeDetail("m1", []));

    await patchStaffRolesInCache(client, true, "m1", (current) =>
      current.includes("magazine_editor")
        ? current
        : [...current, "magazine_editor"],
    );

    const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
      rosterKey("en"),
    );
    const detail = client.getQueryData<MemberDetail>(detailKey("m1", "en"));
    expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([
      "magazine_editor",
    ]);
    expect(detail?.staffRoles).toEqual(["magazine_editor"]);
  });

  it("dedupes — adding an already-held role is a no-op", async () => {
    const client = new QueryClient();
    client.setQueryData(
      rosterKey("en"),
      makeRosterPage([makeMember("m1", ["magazine_editor"])]),
    );

    await patchStaffRolesInCache(client, true, "m1", (current) =>
      current.includes("magazine_editor")
        ? current
        : [...current, "magazine_editor"],
    );

    const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
      rosterKey("en"),
    );
    expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([
      "magazine_editor",
    ]);
  });

  it("removes a role via a filtering updater (revoke)", async () => {
    const client = new QueryClient();
    client.setQueryData(
      rosterKey("en"),
      makeRosterPage([makeMember("m1", ["magazine_editor", "magazine_writer"])]),
    );
    client.setQueryData(
      detailKey("m1", "en"),
      makeDetail("m1", ["magazine_editor", "magazine_writer"]),
    );

    await patchStaffRolesInCache(client, true, "m1", (current) =>
      current.filter((role) => role !== "magazine_editor"),
    );

    const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
      rosterKey("en"),
    );
    const detail = client.getQueryData<MemberDetail>(detailKey("m1", "en"));
    expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([
      "magazine_writer",
    ]);
    expect(detail?.staffRoles).toEqual(["magazine_writer"]);
  });

  it("leaves the flagged-members cache untouched (it carries no staffRoles)", async () => {
    const client = new QueryClient();
    const flaggedFixture = [{ id: "m1", handle: "@m1" }];
    client.setQueryData(flaggedKey("en"), flaggedFixture);

    await patchStaffRolesInCache(client, true, "m1", (current) => [
      ...current,
      "magazine_editor",
    ]);

    expect(client.getQueryData(flaggedKey("en"))).toEqual(flaggedFixture);
  });

  it("restoreStaffRolesSnapshot reverses the patch exactly — the onError rollback path", async () => {
    const client = new QueryClient();
    client.setQueryData(rosterKey("en"), makeRosterPage([makeMember("m1", [])]));
    client.setQueryData(detailKey("m1", "en"), makeDetail("m1", []));

    const snapshot = await patchStaffRolesInCache(
      client,
      true,
      "m1",
      (current) => [...current, "magazine_editor"],
    );
    restoreStaffRolesSnapshot(client, snapshot);

    const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
      rosterKey("en"),
    );
    const detail = client.getQueryData<MemberDetail>(detailKey("m1", "en"));
    expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([]);
    expect(detail?.staffRoles).toEqual([]);
  });

  it("never touches the OTHER mode's cached entries — demoMode is scoped, not just the bare prefix", async () => {
    const client = new QueryClient();
    // Same member id cached under BOTH modes (roster's demoMode sits at
    // position 1, detail's at position 3 — see `staffRolesQueryMatchesMode`).
    client.setQueryData(
      rosterKey("en"),
      makeRosterPage([makeMember("m1", [])]),
    ); // demo (true)
    client.setQueryData(
      ["admin-members", false, "all", "en"],
      makeRosterPage([makeMember("m1", [])]),
    ); // live (false)
    client.setQueryData(detailKey("m1", "en"), makeDetail("m1", [])); // demo (true)
    client.setQueryData(
      ["admin-members", "detail", "m1", false, "en"],
      makeDetail("m1", []),
    ); // live (false)

    // Patch only the demo-mode (true) entries.
    await patchStaffRolesInCache(client, true, "m1", (current) => [
      ...current,
      "magazine_editor",
    ]);

    const demoRoster = client.getQueryData<InfiniteData<RosterPageVM>>(
      rosterKey("en"),
    );
    const liveRoster = client.getQueryData<InfiniteData<RosterPageVM>>([
      "admin-members",
      false,
      "all",
      "en",
    ]);
    const demoDetail = client.getQueryData<MemberDetail>(
      detailKey("m1", "en"),
    );
    const liveDetail = client.getQueryData<MemberDetail>([
      "admin-members",
      "detail",
      "m1",
      false,
      "en",
    ]);

    expect(demoRoster?.pages[0]?.items[0]?.staffRoles).toEqual([
      "magazine_editor",
    ]);
    expect(demoDetail?.staffRoles).toEqual(["magazine_editor"]);
    // The live-mode entries are untouched.
    expect(liveRoster?.pages[0]?.items[0]?.staffRoles).toEqual([]);
    expect(liveDetail?.staffRoles).toEqual([]);
  });
});

/** Renders both mutations plus the real `language` the roster/detail query
 *  keys embed, so the integration tests below can seed the cache under the
 *  exact key the hooks' own `onMutate` will look up. */
function useTestHarness() {
  const grant = useGrantStaffRole();
  const revoke = useRevokeStaffRole();
  const { language } = useTranslation();
  return { grant, revoke, language };
}

describe("useGrantStaffRole (demo)", () => {
  it("optimistically adds the role to the cached member before the request resolves", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useTestHarness(), {
      wrapper: ({ children }) => (
        <TestProviders queryClient={client}>{children}</TestProviders>
      ),
    });
    const { language } = result.current;
    client.setQueryData(
      rosterKey(language),
      makeRosterPage([makeMember("m1", [])]),
    );
    client.setQueryData(detailKey("m1", language), makeDetail("m1", []));

    await act(async () => {
      await result.current.grant.mutateAsync({
        memberId: "m1",
        slug: "m1",
        role: "magazine_editor",
        isSystem: false,
      });
    });

    await waitFor(() => {
      const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
        rosterKey(language),
      );
      expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([
        "magazine_editor",
      ]);
    });
    const detail = client.getQueryData<MemberDetail>(
      detailKey("m1", language),
    );
    expect(detail?.staffRoles).toEqual(["magazine_editor"]);
  });
});

describe("useRevokeStaffRole (demo)", () => {
  it("optimistically removes the role from the cached member", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useTestHarness(), {
      wrapper: ({ children }) => (
        <TestProviders queryClient={client}>{children}</TestProviders>
      ),
    });
    const { language } = result.current;
    client.setQueryData(
      rosterKey(language),
      makeRosterPage([makeMember("m1", ["magazine_editor"])]),
    );
    client.setQueryData(
      detailKey("m1", language),
      makeDetail("m1", ["magazine_editor"]),
    );

    await act(async () => {
      await result.current.revoke.mutateAsync({
        memberId: "m1",
        slug: "m1",
        role: "magazine_editor",
        isSystem: false,
      });
    });

    await waitFor(() => {
      const roster = client.getQueryData<InfiniteData<RosterPageVM>>(
        rosterKey(language),
      );
      expect(roster?.pages[0]?.items[0]?.staffRoles).toEqual([]);
    });
    const detail = client.getQueryData<MemberDetail>(
      detailKey("m1", language),
    );
    expect(detail?.staffRoles).toEqual([]);
  });
});
