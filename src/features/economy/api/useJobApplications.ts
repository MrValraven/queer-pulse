import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type { JobApplicantRow } from "../jobApplications.data";
import {
  decideJobApplication,
  getJobApplications,
  type JobApplicationDecision,
  type JobApplicationDTO,
} from "./jobs.api";
import { economyKeys } from "./economyKeys";

/** Map one poster-side application DTO onto the console's row view-model. */
export function applicationDtoToRow(dto: JobApplicationDTO): JobApplicantRow {
  const applicant = dto.applicant;
  return {
    id: dto.id,
    name: applicant
      ? `${applicant.firstName} ${applicant.lastName}`.trim()
      : "",
    initials: applicant
      ? initialsOf(applicant.firstName, applicant.lastName)
      : "",
    tint: applicant ? tintForSlug(applicant.slug) : "default",
    avatarUrl: applicant?.avatarUrl ?? null,
    profileSlug: applicant?.slug ?? null,
    appliedAt: dto.createdAt,
    coverNote: dto.coverNote,
    answers: dto.answers,
    status: dto.status,
  };
}

/**
 * The poster's applications for one of their own listings
 * (`GET /jobs/:slug/applications`). Demo mode returns the colocated fixture,
 * loaded on demand so it never ships in the live bundle; live mode fetches and
 * maps the real rows.
 *
 * A 403 (not the poster) and a 404 (no such job) both surface as the query's
 * error state, which the page reads to explain which one happened rather than
 * showing one generic failure.
 */
export function useJobApplications(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<JobApplicantRow[]>({
    queryKey: economyKeys.jobApplications(slug, demoMode),
    enabled: Boolean(slug),
    queryFn: async ({ signal }) => {
      if (!slug) return [];
      if (demoMode) {
        const { DEMO_JOB_APPLICATIONS } =
          await import("../jobApplications.data");
        return DEMO_JOB_APPLICATIONS;
      }
      const dtos = await getJobApplications(slug, signal);
      return dtos.map(applicationDtoToRow);
    },
  });
}

export interface DecideApplicationInput {
  applicationId: string;
  status: JobApplicationDecision;
}

/**
 * PATCH /jobs/:slug/applications/:id. The poster moves one application on
 * (BE-HSG-16). A decision is one-way and the backend enforces it: 409 when the
 * application was already decided, 403 when the caller is not the poster. Both
 * reach the caller as an `ApiError` so the console can name what happened.
 *
 * Nothing changes on screen before the server answers. The cached row is
 * replaced in `onSuccess` with the application the server returned, so the
 * displayed status is always the stored one. Live mode also invalidates the
 * job detail, whose `myApplicationStatus` the same decision moves.
 */
export function useDecideJobApplication(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.jobApplications(slug, demoMode);
  return useMutation<JobApplicantRow | null, Error, DecideApplicationInput>({
    // The console reports its own failure inline, so the global mutation-error
    // toast would only stack a duplicate.
    meta: { silentError: true },
    mutationFn: async ({ applicationId, status }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        const current = queryClient
          .getQueryData<JobApplicantRow[]>(key)
          ?.find((row) => row.id === applicationId);
        return current ? { ...current, status } : null;
      }
      return applicationDtoToRow(
        await decideJobApplication(slug, applicationId, status),
      );
    },
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<JobApplicantRow[]>(key, (previous) =>
        (previous ?? []).map((row) => (row.id === updated.id ? updated : row)),
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.jobBySlug(slug),
        });
      }
    },
  });
}
