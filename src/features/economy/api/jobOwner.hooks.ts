import { useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { usePostedJobs } from "../../../app/providers/usePostedJobs";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { economyKeys } from "./economyKeys";
import {
  closeJob,
  getJob,
  getMyJobs,
  updateJob,
  type JobDetailDTO,
  type UpdateJobDto,
} from "./jobs.api";
import {
  demoJobToEditDraft,
  demoJobToMyJobRow,
  jobCardToMyJobRow,
  jobDetailDtoToEditDraft,
  type JobEditDraft,
  type MyJobRow,
} from "./jobOwner.adapters";

/**
 * Query keys for the poster's own jobs (PRD-44).
 *
 * They live beside the only hooks that read and invalidate them, so the read
 * site and the write site still share one source of truth. `language` is part
 * of the list key for the same reason it is part of `economyKeys.jobs`:
 * `jobCardToMyJobRow` resolves the pay chrome through `t`, so a language switch
 * has to re-derive the rows.
 */
export const jobOwnerKeys = {
  myJobsRoot: ["my-jobs"] as const,
  myJobs: (demoMode: boolean, language: string) =>
    ["my-jobs", demoMode, language] as const,
  jobEditRoot: ["job-edit-source"] as const,
  jobEdit: (slug: string | undefined, demoMode: boolean) =>
    ["job-edit-source", slug, demoMode] as const,
};

/** Demo mode has nothing to fetch, so its result exposes inert callbacks. */
const noop = () => undefined;

export interface MyJobsResult {
  rows: MyJobRow[];
  isLoading: boolean;
  /** A failed fetch must never render as "you have not posted a job yet". */
  isError: boolean;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

interface MyJobsPageVM {
  rows: MyJobRow[];
  total: number;
  page: number;
}

/**
 * The poster's own postings, newest first (`GET /me/jobs`, page-paginated at
 * 20 a page like every other list endpoint).
 *
 * Demo mode reads `PostedJobsProvider`, which is the prototype's store for
 * jobs published in this session and the same source the demo board merges in.
 * Live mode never touches it.
 */
export function useMyJobs(): MyJobsResult {
  const { demoMode } = useDemoMode();
  const { postedJobs } = usePostedJobs();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<MyJobsPageVM>({
    queryKey: jobOwnerKeys.myJobs(demoMode, language),
    enabled: !demoMode,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const page = await getMyJobs({ page: pageParam as number }, signal);
      return {
        rows: page.items.map((dto) => jobCardToMyJobRow(dto, t, fmt)),
        total: page.total,
        page: page.page,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (running, page) => running + page.rows.length,
        0,
      );
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const demoRows = useMemo(
    () => postedJobs.map(demoJobToMyJobRow),
    [postedJobs],
  );

  if (demoMode) {
    return {
      rows: demoRows,
      isLoading: false,
      isError: false,
      refetch: noop,
      hasNextPage: false,
      fetchNextPage: noop,
      isFetchingNextPage: false,
    };
  }

  return {
    rows: (query.data?.pages ?? []).flatMap((page) => page.rows),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

/**
 * The prefill for the edit form. Live mode fetches the RAW `GET /jobs/:slug`
 * detail rather than reusing `useJob`, because that hook's adapted view-model
 * has already thrown away everything the form has to edit: the pay split, the
 * benefits, the inclusivity and screening lists, the contact methods, the
 * seniority and the format.
 *
 * A 403 or a 404 arrives here as the query's error, which the page reads to
 * say which one happened.
 */
export function useJobEditSource(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { postedJobs } = usePostedJobs();

  return useQuery<JobEditDraft | null>({
    queryKey: jobOwnerKeys.jobEdit(slug, demoMode),
    enabled: Boolean(slug),
    queryFn: async ({ signal }) => {
      if (!slug) return null;
      if (demoMode) {
        const posted = postedJobs.find((job) => job.slug === slug);
        if (posted) return demoJobToEditDraft(posted);
        // Demo-only mock, loaded on demand so it never ships in the live bundle.
        const { JOBS } = await import("../jobs.data");
        const mock = JOBS.find((job) => job.slug === slug);
        return mock ? demoJobToEditDraft(mock) : null;
      }
      return jobDetailDtoToEditDraft(await getJob(slug, signal));
    },
  });
}

/**
 * PATCH /jobs/:slug. Demo is a no-op, matching every other economy mutation.
 *
 * The slug never changes on an update, so the caller can navigate straight
 * back to the detail page it came from. Invalidates the board, the detail and
 * this index, since a corrected salary band has to stop showing the old one
 * everywhere at once.
 */
export function useUpdateJob(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<JobDetailDTO | null, Error, UpdateJobDto>({
    // EditJobPage writes the failure into the form instead of a toast, so the
    // global MutationCache handler would only duplicate it.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) return null;
      return updateJob(slug, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: economyKeys.jobsRoot });
      void queryClient.invalidateQueries({
        queryKey: economyKeys.jobBySlug(slug),
      });
      void queryClient.invalidateQueries({
        queryKey: jobOwnerKeys.myJobsRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: jobOwnerKeys.jobEditRoot,
      });
    },
  });
}

/**
 * POST /jobs/:slug/close. Idempotent server-side, poster only.
 *
 * Closing was reachable only through `PostedJobsProvider.removeJob`, which no
 * component ever called, so a listing could not be taken down from anywhere in
 * the app. This is the caller.
 */
export function useCloseJob() {
  const { demoMode } = useDemoMode();
  const { removeJob } = usePostedJobs();
  const queryClient = useQueryClient();
  return useMutation<JobDetailDTO | null, Error, string>({
    meta: { silentError: true },
    mutationFn: async (slug) => {
      if (demoMode) {
        // The demo store IS the demo board, so closing there means dropping the
        // row from it. `removeJob` returns before its own network call in demo
        // mode, so this stays a no-op against the API.
        removeJob(slug);
        return null;
      }
      return closeJob(slug);
    },
    onSuccess: (_result, slug) => {
      void queryClient.invalidateQueries({ queryKey: economyKeys.jobsRoot });
      void queryClient.invalidateQueries({
        queryKey: economyKeys.jobBySlug(slug),
      });
      void queryClient.invalidateQueries({
        queryKey: jobOwnerKeys.myJobsRoot,
      });
    },
  });
}
