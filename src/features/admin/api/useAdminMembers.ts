import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ACTIVE_MEMBER_COUNT,
  detailFor,
  FLAGGED,
  MEMBERS,
  type AdminMember,
  type FlaggedMember,
  type MemberDetail,
} from "../adminMembers.data";
import {
  cardDtoToMember,
  detailDtoToMember,
  flaggedDtoToMember,
} from "./adminMembers.adapters";
import {
  getAdminFlagged,
  getAdminMember,
  getAdminMembers,
} from "./adminMembers.api";

interface AdminMembersPageVM {
  items: AdminMember[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Admin member directory grid, paginated. Demo mode returns the whole
 * `MEMBERS` fixture as a single synthetic page whose `pageSize` is set to
 * `ACTIVE_MEMBER_COUNT` (the vanity total shown in the header) rather than to
 * `MEMBERS.length` — that makes `page * pageSize === total` after page 1, so
 * `getNextPageParam` returns `undefined` and demo mode never issues a page-2
 * fetch, while the header still reads the platform's real 8,412 total. Live
 * mode calls `GET /admin/members` and adapts each card DTO through
 * `cardDtoToMember`, stopping once `page * pageSize` reaches the server's
 * real `total`.
 *
 * `language` sits in the query key (not just `fmt`/`t` in the closure)
 * because `cardDtoToMember` resolves catalog keys and locale-formats
 * dates/relative-times through them — a language switch must re-map the
 * already-fetched DTOs, not just re-render stale English strings.
 */
export function useAdminMembers(filter: "all" | "verified" | "new") {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const query = useInfiniteQuery<AdminMembersPageVM>({
    queryKey: ["admin-members", demoMode, filter, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const filteredMembers =
          filter === "verified"
            ? MEMBERS.filter((member) => member.verified)
            : filter === "new"
              ? MEMBERS.filter((member) => member.newThisWeek)
              : MEMBERS;
        // pageSize === ACTIVE_MEMBER_COUNT so getNextPageParam yields
        // undefined (no page 2 in demo) while the header still shows the
        // 8,412 vanity total.
        return {
          items: filteredMembers,
          total: ACTIVE_MEMBER_COUNT,
          page: 1,
          pageSize: ACTIVE_MEMBER_COUNT,
        };
      }
      const listDto = await getAdminMembers({ page: pageParam as number, filter });
      return {
        items: listDto.items.map((cardDto) =>
          cardDtoToMember(cardDto, t, fmt),
        ),
        total: listDto.total,
        page: listDto.page,
        pageSize: listDto.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const members = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, members, total };
}

/**
 * The flagged-members queue. Demo mode returns the colocated `FLAGGED`
 * fixture and never hits the network — this is an admin-only endpoint that
 * 403s for anyone else, and the fixture is fabricated data that must not
 * appear as platform truth unless the operator explicitly turned "Populate
 * platform" on.
 */
export function useAdminFlagged() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<FlaggedMember[]>({
    queryKey: ["admin-members", "flagged", demoMode, language],
    initialData: demoMode ? FLAGGED : undefined,
    queryFn: async () => {
      if (demoMode) return FLAGGED;
      const flaggedDtos = await getAdminFlagged();
      return flaggedDtos.map((flaggedDto) =>
        flaggedDtoToMember(flaggedDto, t, fmt),
      );
    },
  });
}

/**
 * One member's drawer detail. `member` is nullable because the grid renders
 * with no row selected; `enabled` keeps the query from firing until a row is
 * opened.
 */
export function useAdminMember(member: AdminMember | null) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<MemberDetail | undefined>({
    queryKey: [
      "admin-members",
      "detail",
      member?.id ?? null,
      demoMode,
      language,
    ],
    enabled: member !== null,
    initialData: demoMode && member ? detailFor(member) : undefined,
    queryFn: async () => {
      if (demoMode) {
        return member ? detailFor(member) : undefined;
      }
      if (member === null) return undefined;
      return detailDtoToMember(await getAdminMember(member.id), t, fmt);
    },
  });
}
