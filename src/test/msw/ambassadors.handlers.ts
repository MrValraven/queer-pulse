import { http, HttpResponse } from "msw";
import type { ItemsPage } from "../../shared/api/pagination";
import type {
  AdminAmbassadorCircleDTO,
  AdminAmbassadorDTO,
  GrantAmbassadorBody,
} from "../../features/admin/ambassadors/adminAmbassadors.api";
import {
  ADMIN_AMBASSADOR_CIRCLE_DEMO,
  ADMIN_AMBASSADORS_DEMO,
  AMBASSADOR_CIRCLE_SLUG_DEMO,
} from "../../features/admin/ambassadors/adminAmbassadors.data";
import { isAmbassadorReasonValid } from "../../features/admin/ambassadors/adminAmbassadors.api";
import { isAmbassadorFocusArea } from "../../shared/ambassadors/ambassadorFocusAreas.data";

/**
 * MSW handlers for the admin ambassadors endpoints. They document the wire
 * shapes and coded errors the page assumes from the NestJS backend, and back
 * its LIVE-mode suite. Seeded from the demo fixture so the two modes agree.
 *
 * The handlers keep a small in-memory roster so a grant or a revoke is visible
 * to the refetch that follows it. A suite that writes calls
 * `resetAmbassadorHandlerState()` in `beforeEach`.
 *
 * Both reasons follow the backend's `@Length(3, 500)` on the trimmed text: a
 * shorter or longer one answers a code-less 400, as the real DTO does.
 */

/** The backend's `PAGE_SIZE` for `GET /admin/ambassadors`. */
export const AMBASSADOR_HANDLER_PAGE_SIZE = 20;

/** The staff member the handlers name as the actor on writes. */
const HANDLER_ACTOR = { slug: "ana", name: "Ana Ribeiro" };

/** Members the grant handler can find beyond the seeded roster. Any other slug
 *  answers 404 `ambassador_member_not_found`, as the backend does. */
const GRANTABLE_MEMBERS: Record<
  string,
  { firstName: string; lastName: string }
> = {
  helena: { firstName: "Helena", lastName: "Duarte" },
  sofia: { firstName: "Sofia", lastName: "Andrade" },
};

let ambassadorRows: AdminAmbassadorDTO[] = [];
let ambassadorCircle: AdminAmbassadorCircleDTO = {
  ...ADMIN_AMBASSADOR_CIRCLE_DEMO,
};
let grantCounter = 0;

export function resetAmbassadorHandlerState() {
  ambassadorRows = ADMIN_AMBASSADORS_DEMO.map((row) => ({ ...row }));
  ambassadorCircle = { ...ADMIN_AMBASSADOR_CIRCLE_DEMO };
  grantCounter = 0;
}
resetAmbassadorHandlerState();

/** Seeds the roster directly, for a suite that needs more rows than a page
 *  or a circle that has not been founded yet. */
export function seedAmbassadorHandlerState(seed: {
  rows?: AdminAmbassadorDTO[];
  circle?: AdminAmbassadorCircleDTO;
}) {
  if (seed.rows) ambassadorRows = seed.rows.map((row) => ({ ...row }));
  if (seed.circle) ambassadorCircle = { ...seed.circle };
}

/** Newest first by `field`, the order the backend pages in. */
function newestFirst(
  rows: AdminAmbassadorDTO[],
  field: "grantedAt" | "revokedAt",
) {
  return [...rows].sort((left, right) =>
    (right[field] ?? "").localeCompare(left[field] ?? ""),
  );
}

function codedError(status: number, code: string, message: string) {
  return HttpResponse.json({ statusCode: status, code, message }, { status });
}

function memberNameFor(slug: string) {
  const seeded = ambassadorRows.find((row) => row.member.slug === slug);
  if (seeded) {
    return {
      firstName: seeded.member.firstName,
      lastName: seeded.member.lastName,
    };
  }
  return GRANTABLE_MEMBERS[slug] ?? null;
}

export function ambassadorHandlers(api: string) {
  return [
    // GET /admin/ambassadors/circle
    //   -> { isFounded, slug, memberCount, isViewerMember }
    // A pure read: before the first grant it answers isFounded false.
    http.get(`${api}/admin/ambassadors/circle`, () =>
      HttpResponse.json<AdminAmbassadorCircleDTO>(ambassadorCircle),
    ),

    // POST /admin/ambassadors/circle/staff-seat -> { slug }
    // Founds the circle when nothing has yet, as the backend does.
    http.post(`${api}/admin/ambassadors/circle/staff-seat`, () => {
      if (!ambassadorCircle.isViewerMember) {
        ambassadorCircle = {
          ...ambassadorCircle,
          isFounded: true,
          slug: AMBASSADOR_CIRCLE_SLUG_DEMO,
          isViewerMember: true,
          memberCount: ambassadorCircle.memberCount + 1,
        };
      }
      return HttpResponse.json({ slug: AMBASSADOR_CIRCLE_SLUG_DEMO });
    }),

    // GET /admin/ambassadors/history?userId= -> AdminAmbassadorDTO[]
    // Every grant the member has held, newest first. 400 without a userId.
    http.get(`${api}/admin/ambassadors/history`, ({ request }) => {
      const userId = new URL(request.url).searchParams.get("userId");
      if (!userId) {
        return HttpResponse.json(
          { statusCode: 400, message: "userId must be a UUID" },
          { status: 400 },
        );
      }
      return HttpResponse.json<AdminAmbassadorDTO[]>(
        newestFirst(
          ambassadorRows.filter((row) => row.member.userId === userId),
          "grantedAt",
        ),
      );
    }),

    // GET /admin/ambassadors?status=active|past&page=N
    //   -> { items, total, page, pageSize }
    http.get(`${api}/admin/ambassadors`, ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const wantsPast = searchParams.get("status") === "past";
      const page = Math.max(1, Number(searchParams.get("page")) || 1);
      const matching = newestFirst(
        ambassadorRows.filter((row) => Boolean(row.revokedAt) === wantsPast),
        wantsPast ? "revokedAt" : "grantedAt",
      );
      const start = (page - 1) * AMBASSADOR_HANDLER_PAGE_SIZE;
      return HttpResponse.json<ItemsPage<AdminAmbassadorDTO>>({
        items: matching.slice(start, start + AMBASSADOR_HANDLER_PAGE_SIZE),
        total: matching.length,
        page,
        pageSize: AMBASSADOR_HANDLER_PAGE_SIZE,
      });
    }),

    // POST /admin/ambassadors { memberSlug, focusArea, reason } -> 201 row
    // 409 ambassador_already_active, 404 ambassador_member_not_found
    http.post(`${api}/admin/ambassadors`, async ({ request }) => {
      const body = (await request.json()) as Partial<GrantAmbassadorBody>;
      const memberSlug = body.memberSlug ?? "";
      const focusArea = body.focusArea;
      const reason = body.reason?.trim() ?? "";
      if (
        !isAmbassadorFocusArea(focusArea) ||
        !isAmbassadorReasonValid(reason)
      ) {
        return HttpResponse.json(
          { statusCode: 400, message: "Invalid grant" },
          { status: 400 },
        );
      }
      const isAlreadyActive = ambassadorRows.some(
        (row) => row.member.slug === memberSlug && !row.revokedAt,
      );
      if (isAlreadyActive) {
        return codedError(
          409,
          "ambassador_already_active",
          "Already an ambassador",
        );
      }
      const name = memberNameFor(memberSlug);
      if (!name) {
        return codedError(404, "ambassador_member_not_found", "No such member");
      }
      grantCounter += 1;
      const earlierGrant = ambassadorRows.find(
        (existing) => existing.member.slug === memberSlug,
      );
      const row: AdminAmbassadorDTO = {
        id: `msw-ambassador-${grantCounter}`,
        member: {
          userId: earlierGrant?.member.userId ?? `msw-user-${memberSlug}`,
          slug: memberSlug,
          ...name,
          avatarUrl: null,
        },
        focusArea,
        grantedAt: new Date().toISOString(),
        grantedBy: HANDLER_ACTOR,
        grantReason: reason,
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        isTagVisible: true,
        inviteQuotaOverride: null,
      };
      ambassadorRows = [row, ...ambassadorRows];
      // The first grant founds the circle and seats the member.
      ambassadorCircle = {
        ...ambassadorCircle,
        isFounded: true,
        slug: AMBASSADOR_CIRCLE_SLUG_DEMO,
        memberCount: ambassadorCircle.memberCount + 1,
      };
      return HttpResponse.json(row, { status: 201 });
    }),

    // PATCH /admin/ambassadors/:id { focusArea } -> row
    http.patch(`${api}/admin/ambassadors/:id`, async ({ params, request }) => {
      const body = (await request.json()) as { focusArea?: unknown };
      const focusArea = body.focusArea;
      const existing = ambassadorRows.find(
        (row) => row.id === params.id && !row.revokedAt,
      );
      if (!existing) {
        return codedError(404, "ambassador_not_found", "No active grant");
      }
      if (!isAmbassadorFocusArea(focusArea)) {
        return HttpResponse.json(
          { statusCode: 400, message: "Invalid focus" },
          { status: 400 },
        );
      }
      const updated = { ...existing, focusArea };
      ambassadorRows = ambassadorRows.map((row) =>
        row.id === updated.id ? updated : row,
      );
      return HttpResponse.json(updated);
    }),

    // POST /admin/ambassadors/:id/revoke { reason } -> row
    // 404 ambassador_not_found when there is no active grant
    http.post(
      `${api}/admin/ambassadors/:id/revoke`,
      async ({ params, request }) => {
        const body = (await request.json()) as { reason?: string };
        const reason = body.reason?.trim() ?? "";
        const existing = ambassadorRows.find(
          (row) => row.id === params.id && !row.revokedAt,
        );
        if (!existing) {
          return codedError(404, "ambassador_not_found", "No active grant");
        }
        if (!isAmbassadorReasonValid(reason)) {
          return HttpResponse.json(
            { statusCode: 400, message: "reason must be 3 to 500 characters" },
            { status: 400 },
          );
        }
        const revoked: AdminAmbassadorDTO = {
          ...existing,
          revokedAt: new Date().toISOString(),
          revokedBy: HANDLER_ACTOR,
          revokeReason: reason,
        };
        ambassadorRows = ambassadorRows.map((row) =>
          row.id === revoked.id ? revoked : row,
        );
        return HttpResponse.json(revoked);
      },
    ),
  ];
}
