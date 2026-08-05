import { useEffect, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useToggleEventBookmark } from "./api/useEventMutations";

/**
 * The event-detail "Save" toggle. Optimistic: the label/pressed state flips
 * immediately from local state (seeded by the DTO's `bookmarked` flag), the
 * mutation patches the react-query detail cache and — in live — persists via
 * POST/DELETE /events/:slug/bookmark then refreshes the "Saved" tab. On failure
 * the local state rolls back alongside the cache. Demo behaviour is unchanged:
 * the mutation is a no-op, so the toggle just holds its optimistic local state.
 *
 * `param` is the raw route param the detail query is keyed on; `slug` is the
 * real event slug the API expects.
 */
export function GatheringBookmarkButton({
  slug,
  param,
  bookmarked,
}: {
  slug: string;
  param: string | undefined;
  bookmarked: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const toggle = useToggleEventBookmark(slug, param);
  const [saved, setSaved] = useState(bookmarked);

  // Re-sync when a live refetch resolves a new server truth for this event.
  useEffect(() => setSaved(bookmarked), [bookmarked]);

  const handleClick = () => {
    const next = !saved;
    setSaved(next);
    toggle.mutate(next, {
      onSuccess: () =>
        showToast(
          t(next ? "myevents:bookmark.savedToast" : "myevents:bookmark.removedToast"),
          "success",
        ),
      onError: () => setSaved(!next),
    });
  };

  return (
    <Button
      size="lg"
      variant={saved ? "jade" : "ghost"}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={saved}
      aria-label={t(
        saved ? "myevents:bookmark.savedAria" : "myevents:bookmark.saveAria",
      )}
    >
      <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />{" "}
      {t(saved ? "myevents:bookmark.saved" : "myevents:bookmark.save")}
    </Button>
  );
}
