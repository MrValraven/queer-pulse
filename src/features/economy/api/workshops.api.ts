import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";

// ── Backend DTOs ─────────────────────────────────────────────────────────────
// The workshops domain. Three fields the prototype's `Workshop` renders are
// deliberately NOT stored server-side — see `workshops.adapters.ts`:
//
//   1. `id`      — the backend identifies a workshop by `slug`.
//   2. `format`  — "Workshop · 6 weeks · group of 8" is composed client-side
//                  from `weeks` + `size`; storing the sentence would ship
//                  untranslatable English.
//   3. `added`   — every row here is member-posted, so the flag would always be
//                  true; `createdAt` is stored instead and the client decides
//                  what still counts as new.
//
// Money is numeric + currency (never a formatted string), same as jobs.

export interface WorkshopTierDTO {
  label: string;
  amount: number;
  sliding?: boolean;
}

export interface WorkshopSessionDTO {
  n: string;
  title: string;
  desc: string;
  date: string;
  length: string;
  done?: boolean;
}

export interface WorkshopNeedDTO {
  label: string;
  detail: string;
  included?: boolean;
  tag?: string;
}

export interface WorkshopTutorDTO {
  name: string;
  initials: string;
  /** Avatar tint id; validated in the adapter before it reaches `<Avatar>`. */
  tint: string;
  role: string;
  memberSlug?: string | null;
}

export interface WorkshopDTO {
  /** The identifier. There is no `id` field — see the adapter. */
  slug: string;
  cat: string;
  title: string;
  titleEm: string | null;
  mode: string;
  blurb: string;
  heroPlaceholder: string | null;
  heroTint: string | null;
  /** Course length in weeks — one half of the client-composed `format` line. */
  weeks: number;
  /** Cohort size — the other half, and the render shape's `spotsTotal`. */
  size: number;
  spotsFilled: number;
  /** Numeric price + ISO 4217 code; formatted for display client-side. */
  price: number;
  currency: string;
  priceSub: string | null;
  startDate: string | null;
  cancellation: string | null;
  tiers: WorkshopTierDTO[];
  about: string[];
  sessions: WorkshopSessionDTO[];
  needs: WorkshopNeedDTO[];
  pastWork: string[];
  tutor: WorkshopTutorDTO;
  location: { name: string; address: string; access: string };
  tags: string[];
  /** True when the viewer is the host (PATCH/DELETE are host-only). */
  isHost?: boolean;
  /** Stands in for the render shape's `added` flag. */
  createdAt: string;
}

export interface CreateWorkshopDto {
  title: string;
  blurb: string;
  about: string[];
  cat: string;
  mode: string;
  weeks: number;
  size: number;
  price: number;
  currency: string;
  venue?: string;
}

export type UpdateWorkshopDto = Partial<CreateWorkshopDto>;

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /workshops?page=&cat= — page size 20. */
export async function getWorkshops(
  params: { cat?: string; page?: number } = {},
): Promise<ItemsPage<WorkshopDTO>> {
  const q = new URLSearchParams();
  if (params.cat && params.cat !== "all") q.set("cat", params.cat);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<WorkshopDTO[] | ItemsPage<WorkshopDTO>>(
    `/workshops${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

/** GET /workshops/:slug */
export const getWorkshop = (slug: string) =>
  apiGet<WorkshopDTO>(`/workshops/${slug}`);

/** POST /workshops */
export const createWorkshop = (dto: CreateWorkshopDto) =>
  apiPost<WorkshopDTO>("/workshops", dto);

/** PATCH /workshops/:slug — host only. */
export const updateWorkshop = (slug: string, dto: UpdateWorkshopDto) =>
  apiPatch<WorkshopDTO>(`/workshops/${slug}`, dto);

/** DELETE /workshops/:slug — host only, 204. */
export const deleteWorkshop = (slug: string) =>
  apiDelete<void>(`/workshops/${slug}`);
