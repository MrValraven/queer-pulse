import { useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useToggleEventBookmark } from "./api/useEventMutations";

/**
 * The event-detail "Save" toggle. Optimistic: the label/pressed state flips
 * immediately from local state (seeded by the DTO's `bookmarked` flag), the
 * mutation patches the react-query detail cache and, in live, persists via
 * POST/DELETE /events/:slug/bookmark then refreshes the "Saved" tab. On failure
 * the local state rolls back alongside the cache. Demo behaviour is unchanged:
 * the mutation is a no-op, so the toggle just holds its optimistic local state.
 *
 * `param` is the raw route param the detail query is keyed on; `slug` is the
 * real event slug the API expects.
 *
 * `isCompact` renders the same toggle as a lone icon for the header toolbar,
 * with the visible "Save" / "Saved" text moved into a tooltip. The caller's
 * `className` lands on the button in both forms, which is how the toolbar tints
 * the saved icon so the pressed state reads at a glance.
 */
export function GatheringBookmarkButton({
  slug,
  param,
  bookmarked,
  isCompact = false,
  className,
}: {
  slug: string;
  param: string | undefined;
  bookmarked: boolean;
  isCompact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const toggle = useToggleEventBookmark(slug, param);
  const [prevBookmarked, setPrevBookmarked] = useState(bookmarked);
  const [saved, setSaved] = useState(bookmarked);

  // Re-sync when a live refetch resolves a new server truth for this event.
  // Adjusted during render (not an effect) so it lands in the same commit
  // instead of a follow-up render.
  if (prevBookmarked !== bookmarked) {
    setPrevBookmarked(bookmarked);
    setSaved(bookmarked);
  }

  const handleClick = () => {
    const next = !saved;
    setSaved(next);
    toggle.mutate(next, {
      onSuccess: () =>
        showToast(
          t(
            next
              ? "myevents:bookmark.savedToast"
              : "myevents:bookmark.removedToast",
          ),
          "success",
        ),
      onError: () => setSaved(!next),
    });
  };

  const ariaLabel = t(
    saved ? "myevents:bookmark.savedAria" : "myevents:bookmark.saveAria",
  );
  const visibleLabel = t(
    saved ? "myevents:bookmark.saved" : "myevents:bookmark.save",
  );
  // Explicit "none": Feather icons given `fill={undefined}` paint solid black.
  const icon = (
    <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
  );

  if (isCompact) {
    return (
      <Tooltip label={visibleLabel} placement="bottom">
        <IconButton
          className={className}
          onClick={handleClick}
          disabled={toggle.isPending}
          aria-pressed={saved}
          aria-label={ariaLabel}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      size="lg"
      className={className}
      variant={saved ? "jade" : "ghost"}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={saved}
      aria-label={ariaLabel}
    >
      {icon} {visibleLabel}
    </Button>
  );
}
