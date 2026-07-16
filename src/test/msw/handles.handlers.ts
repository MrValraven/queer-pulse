import { http, HttpResponse } from "msw";
import { handleFormatError, normalizeHandle } from "../../shared/handles";
import { DEMO_TAKEN_HANDLES } from "../../features/settings/api/handles.data";

/**
 * MSW handlers for the unified-username endpoints (UC4). Author-only — they
 * document the wire shapes the frontend assumes from the NestJS backend and back
 * the few LIVE-mode suites. The taken-set mirrors the demo registry so the two
 * modes agree. Registered from the handlers barrel with the shared `API` base.
 */
export function handleHandlers(api: string) {
  return [
    // GET /handles/check?name= → { available, reason }
    http.get(`${api}/handles/check`, ({ request }) => {
      const raw = new URL(request.url).searchParams.get("name") ?? "";
      const name = normalizeHandle(raw);
      const fmt = handleFormatError(name);
      if (fmt) return HttpResponse.json({ available: false, reason: fmt });
      if (DEMO_TAKEN_HANDLES.has(name)) {
        return HttpResponse.json({ available: false, reason: "taken" });
      }
      return HttpResponse.json({ available: true, reason: null });
    }),

    // PATCH /profiles/me/username → updated profile · 409 taken · 422 invalid|reserved
    http.patch(`${api}/profiles/me/username`, async ({ request }) => {
      const body = (await request.json()) as { username?: string };
      const name = normalizeHandle(body.username ?? "");
      const fmt = handleFormatError(name);
      if (fmt) {
        return HttpResponse.json(
          { reason: fmt, message: `Handle is ${fmt}` },
          { status: 422 },
        );
      }
      if (DEMO_TAKEN_HANDLES.has(name)) {
        return HttpResponse.json(
          { reason: "taken", message: "Handle is taken" },
          { status: 409 },
        );
      }
      // A minimal stand-in for the updated ProfileDTO; the frontend only reads
      // the new slug back off the success.
      return HttpResponse.json({ slug: name });
    }),
  ];
}
