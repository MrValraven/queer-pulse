import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { buildDemoLifecycleDesk } from "../data/lifecycleDesk.data";
import {
  createArticleTranslation,
  getArticleTranslations,
  getLifecycleDesk,
  setArticleLifecycle,
  type CreateArticleTranslationDto,
  type LifecycleDeskDTO,
  type SetArticleLifecycleDto,
} from "./lifecycle.api";

const LIFECYCLE_DESK_KEY = "magazine-lifecycle-desk";

/**
 * CON-16 — the lifecycle desk's read. Demo resolves the colocated fixture;
 * live calls `GET /magazine/admin/lifecycle`.
 *
 * `withinDays` joins the query key because it changes what the server
 * returns: widening the horizon is a different question, not a client-side
 * filter over the same page.
 */
export function useLifecycleDesk(withinDays: number) {
  const { demoMode } = useDemoMode();
  return useQuery<LifecycleDeskDTO>({
    queryKey: [LIFECYCLE_DESK_KEY, demoMode, withinDays],
    queryFn: () =>
      demoMode
        ? Promise.resolve(buildDemoLifecycleDesk())
        : getLifecycleDesk(withinDays),
  });
}

/**
 * The desk's two lifecycle writes. Both invalidate the whole desk key rather
 * than patching one row: changing a piece's state moves it between the queue
 * and the flagged list AND shifts the tally, so a targeted patch would leave
 * two of the three panels stale.
 *
 * Demo mode has no write path: the fixture is static, and pretending a save
 * succeeded would be exactly the "fake success" the audit flags elsewhere.
 * The page hides the controls in demo instead.
 */
export function useLifecycleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [LIFECYCLE_DESK_KEY] });

  const setLifecycle = useMutation({
    mutationFn: ({
      pieceId,
      dto,
    }: {
      pieceId: string;
      dto: SetArticleLifecycleDto;
    }) => setArticleLifecycle(pieceId, dto),
    onSuccess: invalidate,
  });

  const openTranslation = useMutation({
    mutationFn: ({
      pieceId,
      dto,
    }: {
      pieceId: string;
      dto: CreateArticleTranslationDto;
    }) => createArticleTranslation(pieceId, dto),
    onSuccess: invalidate,
  });

  return { setLifecycle, openTranslation };
}

/** Every language one piece exists in, for the desk's languages panel. */
export function useArticleTranslations(pieceId: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: ["magazine-article-translations", demoMode, pieceId],
    // Demo has no translation family to show, and inventing one would put a
    // Portuguese piece on screen that does not exist.
    enabled: !demoMode && pieceId !== null,
    queryFn: () => getArticleTranslations(pieceId!),
  });
}
