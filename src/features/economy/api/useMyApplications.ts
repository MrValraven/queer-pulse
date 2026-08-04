import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { orgBadgeInitials } from "../../../shared/lib/initials";
import { getMyApplications } from "./jobs.api";
import type { JobApplicationDTO } from "./jobs.api";
import { economyKeys } from "./economyKeys";
import type { Application, Stage } from "../applicationStatus.types";

export interface MyApplicationsResult {
  /** The member's applications as the tracker's `Application` view-model. */
  applications: Application[];
  /** True while the first fetch is in flight (drives the skeleton). */
  isLoading: boolean;
  /** True when the fetch failed (drives the error state). */
  isError: boolean;
}

/**
 * The signed-in member's own job-application tracker.
 *
 * Dual-mode: demo returns the rich colocated `APPS` fiction (loaded on demand so
 * it never ships in the live bundle); live calls `GET /me/applications` and maps
 * each `JobApplicationDTO` onto the same `Application` view-model the page and
 * card already render. The live DTO is deliberately sparse (no recruiter,
 * interview, offer, or draft fiction), so live cards show the honest shape: job
 * title, a stage tracker derived from the real status, a status line, a badge,
 * and — when the member supplied them — their submitted answers/cover note
 * behind a "View submission" action.
 *
 * i18n: `language` is part of the query key because the live mapping resolves
 * all chrome (status lines, badges, stage labels, the applied-on subtitle)
 * through `t`/`fmt`, so switching language must re-derive the view-models.
 */
export function useMyApplications(): MyApplicationsResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<Application[]>({
    queryKey: economyKeys.myApplications(demoMode, language),
    queryFn: async () => {
      if (demoMode) {
        // Demo-only mock — loaded on demand so it never ships in the live bundle.
        const { APPS } = await import("../applicationStatus.data");
        return APPS;
      }
      const dtos = await getMyApplications();
      return dtos.map((dto) => toApplication(dto, t, fmt));
    },
  });

  // Stabilise the array reference so the page can seed its local (optimistic)
  // state from it and only reseed when the underlying data actually changes.
  const applications = useMemo(() => query.data ?? [], [query.data]);

  return {
    applications,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Map one live application DTO onto the tracker's `Application` view-model. */
function toApplication(
  dto: JobApplicationDTO,
  t: TFunction,
  fmt: Formatters,
): Application {
  const title = dto.job.title;
  const appliedOn = t("economy:applicationStatus.live.appliedOn", {
    date: fmt.date(new Date(dto.createdAt), {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  });

  const stageSubmitted = t("economy:applicationStatus.live.stage.submitted");
  const stageReview = t("economy:applicationStatus.live.stage.review");
  const stageDecision = t("economy:applicationStatus.live.stage.decision");
  const stageOffer = t("economy:applicationStatus.live.stage.offer");
  const stageDeclined = t("economy:applicationStatus.live.stage.declined");

  // The applicant's own submission is real data — expose it behind a quiet
  // "View submission" action whenever they actually supplied answers or a note.
  const hasSubmission = dto.answers.length > 0 || Boolean(dto.coverNote);
  const submission = hasSubmission
    ? {
        date: appliedOn,
        role: title,
        coverLetter: dto.coverNote ?? "",
        attachments: [] as string[],
        answers: dto.answers.map((entry) => ({
          q: entry.question,
          a: entry.answer,
        })),
      }
    : undefined;
  const actions = submission
    ? [
        {
          label: t("economy:applicationStatus.live.action.viewSubmission"),
          kind: "submission" as const,
          muted: true,
        },
      ]
    : [];

  const base = {
    id: dto.id,
    logo: orgBadgeInitials(title, "?"),
    logoTint: "" as const,
    title,
    company: appliedOn,
    companyName: "",
    meta: [] as string[],
    actions,
    submission,
  };

  const inReviewStages: Stage[] = [
    { label: stageSubmitted, state: "done" },
    { label: stageReview, state: "active" },
    { label: stageDecision, state: "" },
  ];

  switch (dto.status) {
    case "accepted":
      return {
        ...base,
        category: "offer",
        accent: "offer",
        stages: [
          { label: stageSubmitted, state: "done" },
          { label: stageReview, state: "done" },
          { label: stageOffer, state: "active" },
        ],
        status: t("economy:applicationStatus.live.status.accepted"),
        badge: {
          kind: "offer",
          label: t("economy:applicationStatus.live.badge.accepted"),
        },
      };
    case "declined":
      return {
        ...base,
        category: "closed",
        stages: [
          { label: stageSubmitted, state: "done" },
          { label: stageReview, state: "done" },
          { label: stageDeclined, state: "rejected" },
        ],
        status: t("economy:applicationStatus.live.status.declined"),
        badge: {
          kind: "rejected",
          label: t("economy:applicationStatus.live.badge.declined"),
        },
      };
    case "reviewing":
      return {
        ...base,
        category: "active",
        stages: inReviewStages,
        status: t("economy:applicationStatus.live.status.reviewing"),
        badge: {
          kind: "in-review",
          label: t("economy:applicationStatus.live.badge.reviewing"),
          pulse: true,
        },
      };
    case "submitted":
    default:
      return {
        ...base,
        category: "active",
        stages: inReviewStages,
        status: t("economy:applicationStatus.live.status.submitted"),
        badge: {
          kind: "in-review",
          label: t("economy:applicationStatus.live.badge.submitted"),
          pulse: true,
        },
      };
  }
}
