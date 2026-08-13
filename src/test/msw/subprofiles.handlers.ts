import { http, HttpResponse } from "msw";
import type {
  AffiliationDTO,
  AffiliationInputDTO,
  CreateSubprofileDTO,
  SocialLinkDTO,
  SubprofileDTO,
  SubprofileItemDTO,
  SubprofileItemInputDTO,
  SubprofileSection,
  UpdateSubprofileDTO,
} from "../../features/subprofiles/api/subprofiles.api";
import {
  findDemoSubprofileByHandle,
  findDemoSubprofileByOwnerSlug,
  mockDirectory,
  mockEndorsersById,
  mockMineSubprofiles,
  mockMyEndorsement,
  mockSetEndorsed,
  mockSetFollowing,
  mockSubprofileById,
  mockSubprofilesForProfile,
  resolveCollaboratorsDemo,
  resolvePublicAccessDemo,
  validatePublishDemo,
  type DemoPublicAccessResult,
} from "../../features/subprofiles/data/subprofiles.data";
import {
  KIND_LABELS,
  defaultSlugForKind,
  slugify,
} from "../../features/subprofiles/subprofile-kinds";

/** Map incoming section-replace input items to full wire items (mirrors the
 *  real service's field defaulting + collaborator resolution): `links` items
 *  can never be featured, and every new/optional scalar defaults to `null`.
 *  Pulled out of `subprofileHandlers` to keep that function under the
 *  repo's line cap. */
function buildReplacedSectionItems(
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
): SubprofileItemDTO[] {
  const isLinksSection = section === "links";
  // Mirrors `useSubprofileMutations`' demo replace path: no per-item id
  // continuity in this system's input DTO, so every replaced item is
  // stamped with "now" as its first-published date.
  const replaceTimestamp = new Date().toISOString();
  return items.map((item) => ({
    // Same id-continuity limitation as `createdAt` above: mirrors the real
    // backend recreating item rows (and therefore ids) on a full section
    // replace, so each mocked item gets a fresh id here too.
    id: `itm-msw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    createdAt: replaceTimestamp,
    title: item.title,
    subtitle: item.subtitle ?? null,
    description: item.description ?? null,
    url: item.url ?? null,
    imageUrl: item.imageUrl ?? null,
    date: item.date ?? null,
    meta: item.meta ?? null,
    tags: item.tags ?? [],
    isFeatured: isLinksSection ? false : (item.isFeatured ?? false),
    collaborators: resolveCollaboratorsDemo(item.collaborators),
    venue: item.venue ?? null,
    doors: item.doors ?? null,
    ticketUrl: item.ticketUrl ?? null,
    gigState: item.gigState ?? null,
    medium: item.medium ?? null,
    dimensions: item.dimensions ?? null,
    edition: item.edition ?? null,
    workState: item.workState ?? null,
    structured: item.structured ?? null,
  }));
}

/** Build the freshly-created draft DTO for the `POST /subprofiles` echo, mirroring
 *  the backend: `displayName` is required and the slug is derived server-side
 *  (create rejects a client slug; rename via PATCH). Pulled out of
 *  `subprofileHandlers` to keep that function under the repo's line cap. */
function buildCreatedSubprofile(body: CreateSubprofileDTO): SubprofileDTO {
  const displayName = body.displayName?.trim() || KIND_LABELS[body.kind];
  const slug = slugify(displayName) || defaultSlugForKind(body.kind);
  return {
    id: `sp-msw-${Date.now()}`,
    kind: body.kind,
    slug,
    handle: null,
    displayName,
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [],
    linkVisibility: "linked",
    visibility: "open",
    status: "draft",
    position: 0,
    items: [],
    endorsementCount: 0,
    followerCount: 0,
    affiliations: [],
    skinData: null,
  };
}

/**
 * Turn a `resolvePublicAccessDemo` outcome into the exact live-wire shape the
 * Shared Contract (Phase 1b) promises: 200 the DTO / 403 `{restrictedState}`
 * / 404 empty. Used by both single-item public-read handlers below so they
 * stay byte-for-byte in sync with `usePublicSubprofile`'s demo branch — the
 * same resolver, just rendered as an HTTP response instead of a hook result.
 * MSW has no real signed-in-cookie context, so these handlers always resolve
 * as an anonymous (signed-out) viewer; a suite exercising the owner-preview
 * path calls `resolvePublicAccessDemo` directly instead (see
 * `usePublicSubprofile.live.test.tsx`).
 */
function publicAccessResponse(result: DemoPublicAccessResult) {
  if (result.kind === "ok") return HttpResponse.json(result.dto);
  if (result.kind === "restricted") {
    return HttpResponse.json(
      { restrictedState: result.restricted },
      { status: 403 },
    );
  }
  return new HttpResponse(null, { status: 404 });
}

/**
 * MSW handlers for the subprofiles C4 endpoints. They double as executable
 * documentation of the wire shapes the frontend assumes from the NestJS backend.
 * Authored only — not run here. Registered from the handlers barrel with the
 * shared `API` base. Literal paths are ordered before `/:id` so they win.
 */
export function subprofileHandlers(api: string) {
  return [
    // ── Public reads ─────────────────────────────────────────────────────────
    http.get(`${api}/profiles/:slug/subprofiles`, ({ params }) =>
      HttpResponse.json(mockSubprofilesForProfile(String(params.slug))),
    ),
    // Phase 1b: single-item nested-linked read — same restricted-state
    // contract as the by-handle route below (200/403/404), unlike the bulk
    // list above (which can only ever return already-viewable personas).
    http.get(`${api}/profiles/:slug/subprofiles/:subslug`, ({ params }) =>
      publicAccessResponse(
        resolvePublicAccessDemo(
          findDemoSubprofileByOwnerSlug(
            String(params.slug),
            String(params.subslug),
          ),
          null,
        ),
      ),
    ),
    http.get(`${api}/subprofiles/by-handle/:handle`, ({ params }) =>
      publicAccessResponse(
        resolvePublicAccessDemo(
          findDemoSubprofileByHandle(String(params.handle)),
          null,
        ),
      ),
    ),
    http.get(`${api}/subprofiles/directory`, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        items: mockDirectory({
          kind: url.searchParams.get("kind") ?? undefined,
          query: url.searchParams.get("query") ?? undefined,
        }),
      });
    }),

    // ── Owner reads/writes ───────────────────────────────────────────────────
    http.get(`${api}/subprofiles/mine`, () =>
      HttpResponse.json(mockMineSubprofiles()),
    ),
    http.post(`${api}/subprofiles`, async ({ request }) => {
      const body = (await request.json()) as CreateSubprofileDTO;
      return HttpResponse.json(buildCreatedSubprofile(body), { status: 201 });
    }),
    http.get(`${api}/subprofiles/:id`, ({ params }) => {
      const dto = mockSubprofileById(String(params.id));
      return dto
        ? HttpResponse.json(dto)
        : new HttpResponse(null, { status: 404 });
    }),
    http.patch(`${api}/subprofiles/:id`, async ({ params, request }) => {
      const current = mockSubprofileById(String(params.id));
      if (!current) return new HttpResponse(null, { status: 404 });
      const patch = (await request.json()) as UpdateSubprofileDTO;
      return HttpResponse.json({ ...current, ...patch });
    }),
    http.put(
      `${api}/subprofiles/:id/sections/:section`,
      async ({ params, request }) => {
        const current = mockSubprofileById(String(params.id));
        if (!current) return new HttpResponse(null, { status: 404 });
        const section = String(params.section) as SubprofileSection;
        const body = (await request.json()) as {
          items: SubprofileItemInputDTO[];
        };
        // Mirrors the demo mutation path: `links` items can never be featured,
        // and a featured item arriving in this section clears `isFeatured` on
        // every other section's items (single spotlight per persona).
        const replacedItems = buildReplacedSectionItems(section, body.items);
        const incomingHasFeaturedItem = replacedItems.some(
          (item) => item.isFeatured,
        );
        const otherSectionItems = current.items
          .filter((item) => item.section !== section)
          .map((item) =>
            incomingHasFeaturedItem ? { ...item, isFeatured: false } : item,
          );
        return HttpResponse.json({
          ...current,
          items: [...otherSectionItems, ...replacedItems],
        });
      },
    ),
    http.put(`${api}/subprofiles/:id/social-links`, async ({ params, request }) => {
      const current = mockSubprofileById(String(params.id));
      if (!current) return new HttpResponse(null, { status: 404 });
      const body = (await request.json()) as { items: SocialLinkDTO[] };
      return HttpResponse.json({ ...current, socialLinks: body.items });
    }),
    http.put(
      `${api}/subprofiles/:id/affiliations`,
      async ({ params, request }) => {
        const current = mockSubprofileById(String(params.id));
        if (!current) return new HttpResponse(null, { status: 404 });
        const body = (await request.json()) as { items: AffiliationInputDTO[] };
        // Mirrors the demo mutation path (`useAffiliations`): re-resolve each
        // input against the persona's currently-known affiliations so an edit,
        // reorder, or removal keeps its real `name`/`imageUrl`; a genuinely new
        // slug falls back to the raw slug as a placeholder name.
        const resolvedAffiliations: AffiliationDTO[] = body.items.map(
          (item) => {
            const known = current.affiliations.find(
              (affiliation) =>
                affiliation.targetType === item.targetType &&
                affiliation.targetSlug === item.targetSlug,
            );
            return {
              targetType: item.targetType,
              targetSlug: item.targetSlug,
              role: item.role,
              name: known?.name ?? item.targetSlug,
              imageUrl: known?.imageUrl ?? null,
            };
          },
        );
        return HttpResponse.json({
          ...current,
          affiliations: resolvedAffiliations,
        });
      },
    ),
    http.post(`${api}/subprofiles/:id/publish`, ({ params }) => {
      const current = mockSubprofileById(String(params.id));
      if (!current) return new HttpResponse(null, { status: 404 });
      const unmet = validatePublishDemo(current);
      if (unmet.length) return HttpResponse.json({ unmet }, { status: 422 });
      return HttpResponse.json({
        ...current,
        status: "published",
        handle:
          current.linkVisibility === "unlinked"
            ? (current.handle ?? current.slug)
            : null,
      });
    }),
    http.post(`${api}/subprofiles/:id/unpublish`, ({ params }) => {
      const current = mockSubprofileById(String(params.id));
      if (!current) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({
        ...current,
        status: "draft",
        handle: current.linkVisibility === "unlinked" ? null : current.handle,
      });
    }),
    http.delete(`${api}/subprofiles/:id`, () =>
      HttpResponse.json({ ok: true }),
    ),

    // ── Endorsements ─────────────────────────────────────────────────────────
    http.post(`${api}/subprofiles/:id/endorse`, async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        note?: string;
      };
      const result = mockSetEndorsed(String(params.id), true, body.note);
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),
    http.delete(`${api}/subprofiles/:id/endorse`, ({ params }) => {
      const result = mockSetEndorsed(String(params.id), false);
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),
    http.get(`${api}/subprofiles/:id/endorsement/mine`, ({ params }) => {
      const result = mockMyEndorsement(String(params.id));
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),
    http.get(`${api}/subprofiles/:id/endorsements`, ({ params }) => {
      const result = mockEndorsersById(String(params.id));
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),

    // ── Follows ──────────────────────────────────────────────────────────────
    http.post(`${api}/subprofiles/:id/follow`, ({ params }) => {
      const result = mockSetFollowing(String(params.id), true);
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),
    http.delete(`${api}/subprofiles/:id/follow`, ({ params }) => {
      const result = mockSetFollowing(String(params.id), false);
      return result
        ? HttpResponse.json(result)
        : new HttpResponse(null, { status: 404 });
    }),
  ];
}
