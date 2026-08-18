import { http, HttpResponse } from "msw";
import type {
  AdminCommunityCardDTO,
  AdminCommunityListDTO,
} from "../../features/admin/api/adminCommunities.api";
import type { AdminBotSummaryDTO } from "../../features/admin/api/adminBots.api";
import type { JobCardDTO } from "../../features/economy/api/jobs.api";
import type { Paginated } from "../../shared/api/refs";
import { subprofileHandlers } from "./subprofiles.handlers";
import { handleHandlers } from "./handles.handlers";

/**
 * MSW handlers for the few LIVE-mode suites. They double as executable
 * documentation of the shapes the frontend assumes from the NestJS backend —
 * if the real contract drifts, update these.
 *
 * `API` is the backend ORIGIN — it matches the `VITE_API_URL` the live suites
 * stub in (`http://api.test`), so it's what tests pass to `vi.stubEnv`.
 *
 * `API_V1` is that origin under the client's URI version prefix (`/v1`). The
 * client (`src/shared/api/client.ts`) prefixes every call made through its
 * generic `request()` builder with `/v1` (the backend runs
 * `enableVersioning({ type: URI, defaultVersion: '1' })`), so a handler for a
 * domain endpoint must be registered under `API_V1` to match the real request.
 * The two DIRECT `fetch()` calls in the client — `/csrf-token` and
 * `/auth/refresh` — are `@Version(VERSION_NEUTRAL)` and stay UNversioned, so
 * their handlers below stay under bare `API`.
 */
export const API = "http://api.test";
export const API_V1 = `${API}/v1`;

const jobCard: JobCardDTO = {
  slug: "brand-designer",
  title: "Brand Designer",
  company: { slug: "atelier-pulso", nameText: "Atelier Pulso" },
  category: "Arts & Culture",
  commitment: "Freelance",
  seniority: "Mid",
  format: "hybrid",
  location: "Lisbon",
  city: "Lisbon",
  timezone: null,
  pay: {
    salary: "€2,200/mo",
    rateMin: null,
    rateMax: null,
    currency: null,
    ratePer: null,
    hidePay: false,
    barter: false,
  },
  deadline: "2026-06-30",
  startDate: null,
  desc: "Shape a warm, queer brand system.",
  tags: ["brand", "figma"],
  queerRun: true,
  qrLabel: null,
  status: "open",
  createdAt: "2026-06-01",
};

const adminCommunityCard: AdminCommunityCardDTO = {
  slug: "trans-friends",
  name: "Trans & Friends",
  initials: "TR",
  tone: "jade",
  tag: "Peer support · private",
  memberCount: 1204,
  activityLabel: "High",
  activePercentage: 68,
  openReportCount: 1,
  healthScore: 94,
  healthBreakdown: {
    memberActivity: 91,
    reportResolution: 100,
    memberSentiment: null,
    safetyLoad: 90,
  },
  activitySparkline: [5, 6, 5, 7, 6, 8, 7, 9],
  needsSupport: false,
};

const adminBotSummary: AdminBotSummaryDTO = {
  userId: "u-house",
  slug: "queerpulse",
  firstName: "QueerPulse",
  lastName: "",
  avatarUrl: null,
};

export const handlers = [
  http.get(`${API}/csrf-token`, () =>
    HttpResponse.json({ csrfToken: "test-csrf" }),
  ),
  http.post(
    `${API}/auth/refresh`,
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.get(`${API_V1}/jobs`, () => {
    const body: Paginated<JobCardDTO> = {
      items: [jobCard],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    return HttpResponse.json(body);
  }),
  http.get(`${API_V1}/admin/communities`, () =>
    HttpResponse.json<AdminCommunityListDTO>({
      items: [adminCommunityCard],
      truncated: false,
    }),
  ),
  http.get(`${API_V1}/admin/bots`, () =>
    HttpResponse.json<AdminBotSummaryDTO[]>([adminBotSummary]),
  ),
  ...subprofileHandlers(API_V1),
  ...handleHandlers(API_V1),
];
