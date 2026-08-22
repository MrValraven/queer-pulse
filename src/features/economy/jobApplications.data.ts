import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { MEMBERS, memberName } from "../members/data/members";
import type { ApplicationStatus } from "./api/jobs.api";

/**
 * The poster's view of one application to their own listing
 * (`GET /jobs/:slug/applications`). Deliberately close to the backend DTO: the
 * applicant, what they actually wrote, when it landed, and where the
 * application stands. No recruiter/interview/offer fiction, because the API has
 * none of it.
 */
export interface JobApplicantRow {
  id: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl: string | null;
  /** Profile slug, when the applicant still has a profile to link to. */
  profileSlug: string | null;
  /** ISO timestamp the application was submitted. */
  appliedAt: string;
  coverNote: string | null;
  answers: { question: string; answer: string }[];
  status: ApplicationStatus;
}

const SCREENING_QUESTION =
  "What kind of work do you most want to be doing a year from now?";

/**
 * Demo fixtures for the poster-side applications console. Shown for any job in
 * demo mode so the prototype exercises the whole decision flow (submitted to
 * reviewing to accepted or declined) with no backend. Live mode never reads
 * these: it reads the member's real applications from the API.
 */
export const DEMO_JOB_APPLICATIONS: JobApplicantRow[] = [
  {
    id: "demo-application-carla",
    name: memberName("carla"),
    initials: MEMBERS.carla!.initials,
    tint: MEMBERS.carla!.tint,
    avatarUrl: MEMBERS.carla!.photo ?? null,
    profileSlug: "carla",
    appliedAt: "2026-08-18T09:20:00.000Z",
    coverNote:
      "I have been doing editorial layout for small publishers for three years and I would love to do it somewhere queer-run. I can start whenever suits you.",
    answers: [
      {
        question: SCREENING_QUESTION,
        answer:
          "Type design, honestly. Book work is where I learn fastest and I want to keep going deeper rather than wider.",
      },
    ],
    status: "submitted",
  },
  {
    id: "demo-application-tomas",
    name: memberName("tomas"),
    initials: MEMBERS.tomas!.initials,
    tint: MEMBERS.tomas!.tint,
    avatarUrl: MEMBERS.tomas!.photo ?? null,
    profileSlug: "tomas",
    appliedAt: "2026-08-16T17:05:00.000Z",
    coverNote:
      "Freelancing since 2023, mostly branding for community organisations. I am looking for somewhere steadier with people I can learn from.",
    answers: [
      {
        question: SCREENING_QUESTION,
        answer:
          "Leading a small project end to end, with someone senior close enough to ask.",
      },
    ],
    status: "reviewing",
  },
  {
    id: "demo-application-beatriz",
    name: memberName("beatriz"),
    initials: MEMBERS.beatriz!.initials,
    tint: MEMBERS.beatriz!.tint,
    avatarUrl: MEMBERS.beatriz!.photo ?? null,
    profileSlug: "beatriz",
    appliedAt: "2026-08-11T11:40:00.000Z",
    coverNote: null,
    answers: [],
    status: "accepted",
  },
];
