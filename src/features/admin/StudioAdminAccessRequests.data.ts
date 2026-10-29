import { portrait } from "./adminPeople.data";
import type {
  AdminStudioAccessRequestDTO,
  AdminStudioAccessRequestPageDTO,
} from "./api/studioAccessRequestsAdmin.api";

/** The page size the server uses. */
export const DEMO_ACCESS_REQUEST_PAGE_SIZE = 30;

interface DemoRequestSeed {
  name: string;
  wantsToRelease: boolean;
  isFromInvite: boolean;
}

// 34 requests: the first 9 want to release music, 6 came from an invite. The
// names come from the demo member pool; a name with no portrait stands for a
// member who keeps their photo hidden, so it reads as tinted initials, as in
// the admin member list. Never the demo member's own name.
const DEMO_SEEDS: DemoRequestSeed[] = [
  { name: "Lara Pinto", wantsToRelease: true, isFromInvite: false },
  { name: "Devon Okoro", wantsToRelease: true, isFromInvite: true },
  { name: "Théo Mendes", wantsToRelease: true, isFromInvite: false },
  { name: "Beatriz Neves", wantsToRelease: true, isFromInvite: false },
  { name: "Kai Sousa", wantsToRelease: true, isFromInvite: true },
  { name: "Marco Vieira", wantsToRelease: true, isFromInvite: false },
  { name: "Rui Antunes", wantsToRelease: true, isFromInvite: false },
  { name: "Nadia Lopes", wantsToRelease: true, isFromInvite: false },
  { name: "Júlia Saraiva", wantsToRelease: true, isFromInvite: false },
  { name: "Mara L.", wantsToRelease: false, isFromInvite: true },
  { name: "Tomás R.", wantsToRelease: false, isFromInvite: false },
  { name: "Sofia D.", wantsToRelease: false, isFromInvite: false },
  { name: "Ana L.", wantsToRelease: false, isFromInvite: true },
  { name: "Beatriz Calado", wantsToRelease: false, isFromInvite: false },
  { name: "Lucas Ferraz", wantsToRelease: false, isFromInvite: false },
  { name: "Rita Moniz", wantsToRelease: false, isFromInvite: false },
  { name: "Hugo Pestana", wantsToRelease: false, isFromInvite: true },
  { name: "Clara Nogueira", wantsToRelease: false, isFromInvite: false },
  { name: "Duarte Simões", wantsToRelease: false, isFromInvite: false },
  { name: "Leonor Vaz", wantsToRelease: false, isFromInvite: false },
  { name: "Iara Bento", wantsToRelease: false, isFromInvite: false },
  { name: "Ravi Menon", wantsToRelease: false, isFromInvite: false },
  { name: "Matilde Casal", wantsToRelease: false, isFromInvite: false },
  { name: "Gil Tavares", wantsToRelease: false, isFromInvite: false },
  { name: "Noor Haddad", wantsToRelease: false, isFromInvite: false },
  { name: "Cristina Lobo", wantsToRelease: false, isFromInvite: false },
  { name: "Elias Rocha", wantsToRelease: false, isFromInvite: false },
  { name: "Vera Quintal", wantsToRelease: false, isFromInvite: false },
  { name: "Samir Costa", wantsToRelease: false, isFromInvite: false },
  { name: "Joana Barros", wantsToRelease: false, isFromInvite: false },
  { name: "Pedro Amaral", wantsToRelease: false, isFromInvite: false },
  { name: "Lia Fontes", wantsToRelease: false, isFromInvite: false },
  { name: "Afonso Reis", wantsToRelease: false, isFromInvite: false },
  { name: "Mia Duarte", wantsToRelease: false, isFromInvite: false },
];

// Members the demo roster already has keep the roster's id and slug, so the
// member drawer and this list agree on who they are. Anyone who holds a demo
// grant (Ines) or grants (Sofia) is left out of the list.
const ROSTER_ID_BY_NAME: Record<string, string> = {
  "Devon Okoro": "devon",
  "Théo Mendes": "theo",
  "Kai Sousa": "kai",
};

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

const slugOf = (name: string) =>
  name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const HOURS_BETWEEN_REQUESTS = 7;
const OLDEST_REQUEST_AT = Date.parse("2026-10-01T09:00:00.000Z");

function demoRequestAt(position: number): string {
  // Artists first, then oldest first: position order is request order.
  return new Date(
    OLDEST_REQUEST_AT + position * HOURS_BETWEEN_REQUESTS * 3_600_000,
  ).toISOString();
}

export const DEMO_ACCESS_REQUESTS: AdminStudioAccessRequestDTO[] =
  DEMO_SEEDS.map((seed, position) => {
    const rosterId = ROSTER_ID_BY_NAME[seed.name];
    const slug = rosterId ?? slugOf(seed.name);
    return {
      id: `demo-access-request-${slug}`,
      member: {
        id: rosterId ?? `demo-waiting-${slug}`,
        slug,
        displayName: seed.name,
        avatarUrl: portrait(seed.name) ?? null,
      },
      wantsToRelease: seed.wantsToRelease,
      requestedAt: demoRequestAt(position),
      isFromInvite: seed.isFromInvite,
    };
  });

/** One page of the demo list. The cursor is the id of the last row the
 *  reader holds, so a row removed in the session never shifts the next page. */
export function demoAccessRequestPage(
  cursor: string | null,
): AdminStudioAccessRequestPageDTO {
  const startIndex = cursor
    ? DEMO_ACCESS_REQUESTS.findIndex((request) => request.id === cursor) + 1
    : 0;
  const items = DEMO_ACCESS_REQUESTS.slice(
    startIndex,
    startIndex + DEMO_ACCESS_REQUEST_PAGE_SIZE,
  );
  const lastItem = items[items.length - 1];
  const hasMore = startIndex + items.length < DEMO_ACCESS_REQUESTS.length;
  return {
    items,
    nextCursor: hasMore && lastItem ? lastItem.id : null,
    totalCount: DEMO_ACCESS_REQUESTS.length,
    artistCount: DEMO_ACCESS_REQUESTS.filter(
      (request) => request.wantsToRelease,
    ).length,
  };
}
