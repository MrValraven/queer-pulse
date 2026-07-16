import { http, HttpResponse } from "msw";
import type {
  CreateSubprofileDTO,
  SubprofileDTO,
  SubprofileItemInputDTO,
  SubprofileSection,
  UpdateSubprofileDTO,
} from "../../features/subprofiles/api/subprofiles.api";
import {
  mockDirectory,
  mockMineSubprofiles,
  mockPublicByHandle,
  mockSubprofileById,
  mockSubprofilesForProfile,
  validatePublishDemo,
} from "../../features/subprofiles/data/subprofiles.data";
import {
  KIND_LABELS,
  defaultSlugForKind,
  slugify,
} from "../../features/subprofiles/subprofile-kinds";

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
    http.get(`${api}/subprofiles/by-handle/:handle`, ({ params }) => {
      const dto = mockPublicByHandle(String(params.handle));
      return dto
        ? HttpResponse.json(dto)
        : new HttpResponse(null, { status: 404 });
    }),
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
      // Mirrors the backend: displayName is required and the slug is derived
      // server-side (create rejects a client slug; rename via PATCH).
      const displayName = body.displayName?.trim() || KIND_LABELS[body.kind];
      const slug = slugify(displayName) || defaultSlugForKind(body.kind);
      const created: SubprofileDTO = {
        id: `sp-msw-${Date.now()}`,
        kind: body.kind,
        slug,
        handle: null,
        displayName,
        avatarUrl: null,
        tagline: null,
        bio: null,
        linkVisibility: "linked",
        visibility: "open",
        status: "draft",
        position: 0,
        items: [],
      };
      return HttpResponse.json(created, { status: 201 });
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
        const others = current.items.filter((i) => i.section !== section);
        const replaced = body.items.map((i) => ({
          section,
          title: i.title,
          subtitle: i.subtitle ?? null,
          description: i.description ?? null,
          url: i.url ?? null,
          imageUrl: i.imageUrl ?? null,
          date: i.date ?? null,
          meta: i.meta ?? null,
          tags: i.tags ?? [],
        }));
        return HttpResponse.json({
          ...current,
          items: [...others, ...replaced],
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
  ];
}
