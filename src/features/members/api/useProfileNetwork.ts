import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useVouchActions } from "../../../app/providers/useVouch";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import { CONNECTION_META } from "../../connect/connections.data";
import { MEMBERS } from "../data/members";
import { useVouchers } from "./useVouchers";
import { useGivenVouches } from "./useGivenVouches";
import { demoNetworkTimestamp } from "./networkTimestamps";
import type { NetworkGroup, NetworkPerson } from "./profileNetwork.types";

/** Newest-first by ISO `at`; people with a `null` timestamp sort last. */
function sortNewestFirst(people: NetworkPerson[]): NetworkPerson[] {
  return [...people].sort((personA, personB) => {
    if (personA.at === personB.at) return 0;
    if (personA.at === null) return 1;
    if (personB.at === null) return -1;
    return personB.at.localeCompare(personA.at);
  });
}

/**
 * DEMO-ONLY: the members the demo persona has vouched for, resolved from the
 * local vouch store plus the seeded "you-vouched"/"mutual" relationships, with
 * cosmetic timestamps. Never runs in live mode (see `useProfileNetwork`), so
 * reading the mock registry here is not a demo-persona leak.
 */
function buildDemoGivenPeople(storeVouchedSlugs: string[]): NetworkPerson[] {
  const givenSlugs = new Set<string>(storeVouchedSlugs);
  for (const [slug, meta] of Object.entries(CONNECTION_META)) {
    if (meta.vouchBadge === "you-vouched" || meta.vouchBadge === "mutual") {
      givenSlugs.add(slug);
    }
  }
  return [...givenSlugs].flatMap((slug, itemIndex) => {
    const member = MEMBERS[slug];
    if (!member) return [];
    return [
      {
        slug,
        name: `${member.first} ${member.last}`,
        avatarUrl: member.photo,
        pronouns: member.pronouns ?? CONNECTION_META[slug]?.pron,
        at: demoNetworkTimestamp(itemIndex),
      },
    ];
  });
}

/**
 * The three network lists for the owner's OWN profile: who they're connected
 * with, who they vouched for, who vouched for them — each sorted newest-first.
 *
 * Pure composition of existing dual-mode hooks. `useConnectionsList` and
 * `useVouchers` already branch demo/live internally; only the "vouched given"
 * group needs a demo branch here, because `useGivenVouches` is a live-only fetch
 * (its demo counterpart is the local vouch store, resolved above).
 */
export function useProfileNetwork(ownerSlug: string): {
  groups: NetworkGroup[];
  loading: boolean;
} {
  const { demoMode } = useDemoMode();
  // "all" is the accepted-connections tab in both modes, so every view here is
  // already an accepted connection.
  const connectionsList = useConnectionsList("all");
  const receivedVouchers = useVouchers(ownerSlug);
  const givenVouches = useGivenVouches();
  const { vouched: demoVouchedSlugs } = useVouchActions();

  const connectedPeople = useMemo<NetworkPerson[]>(
    () =>
      sortNewestFirst(
        connectionsList.views.map((connection) => ({
          slug: connection.slug,
          name: connection.name,
          avatarUrl: connection.photo,
          pronouns: connection.pron,
          at: connection.meta.connectedAtIso ?? null,
        })),
      ),
    [connectionsList.views],
  );

  const receivedPeople = useMemo<NetworkPerson[]>(
    () =>
      sortNewestFirst(
        (receivedVouchers.data ?? [])
          .filter((face) => !face.anonymous && face.slug !== "")
          .map((face) => ({
            slug: face.slug,
            name: face.name,
            avatarUrl: face.avatarUrl,
            at: face.createdAt ?? null,
          })),
      ),
    [receivedVouchers.data],
  );

  const givenPeople = useMemo<NetworkPerson[]>(() => {
    if (demoMode) {
      return sortNewestFirst(buildDemoGivenPeople(demoVouchedSlugs));
    }
    return sortNewestFirst(
      (givenVouches.data ?? []).map((face) => ({
        slug: face.slug,
        name: `${face.firstName} ${face.lastName}`.trim(),
        avatarUrl: face.avatarUrl,
        at: face.createdAt,
      })),
    );
  }, [demoMode, demoVouchedSlugs, givenVouches.data]);

  // The connected group is paginated (`useConnectionsList("all")`), so its true
  // size is the server `total`, NOT the loaded page length — the chip badge is
  // now the headline, so it must be honest. `total` is `undefined` only while
  // the first live page is in flight; fall back to the loaded length then. The
  // two vouch groups arrive as full lists, so their total is `people.length`
  // (and in demo mode `connectionsList.total` already equals the local count).
  const connectedTotal = connectionsList.total ?? connectedPeople.length;

  const groups = useMemo<NetworkGroup[]>(
    () => [
      {
        key: "connected",
        people: connectedPeople,
        total: connectedTotal,
      },
      {
        key: "vouchedGiven",
        people: givenPeople,
        total: givenPeople.length,
      },
      {
        key: "vouchedReceived",
        people: receivedPeople,
        total: receivedPeople.length,
      },
    ],
    [connectedPeople, connectedTotal, givenPeople, receivedPeople],
  );

  // `isLoading` (not `isPending`) so a disabled query — demo `useGivenVouches`,
  // or a not-yet-enabled voucher fetch — never pins the section as loading.
  const loading =
    connectionsList.loading ||
    receivedVouchers.isLoading ||
    givenVouches.isLoading;

  return { groups, loading };
}
