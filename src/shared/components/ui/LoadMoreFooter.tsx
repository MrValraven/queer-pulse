import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { Button, type ButtonSize } from "./Button";
import styles from "./LoadMoreFooter.module.css";

interface LoadMoreState {
  /** A next page, or its retry, is in flight. */
  isFetchingNextPage: boolean;
  /** The latest next-page fetch failed. Everything already loaded stays on
   *  screen; the footer alone says so, and its button retries that page. */
  isFetchNextPageError: boolean;
}

export interface LoadMoreStatusProps extends LoadMoreState {
  /** The failure line, e.g. "We couldn't load more of your feed." */
  errorMessage: string;
  /** Class on the live region itself, for a status placed inside a row. */
  className?: string;
  /** Replaces the default centred, faded line style. */
  messageClassName?: string;
}

/**
 * ENG-501: the polite live region of a paged list's footer. Mount it with the
 * footer, before any failure, so a failed page lands in a live region that
 * already exists. The line clears while a retry runs, so a second failure is
 * announced again.
 */
export function LoadMoreStatus({
  isFetchingNextPage,
  isFetchNextPageError,
  errorMessage,
  className,
  messageClassName,
}: LoadMoreStatusProps) {
  return (
    <div role="status" className={className}>
      {isFetchNextPageError && !isFetchingNextPage && (
        <p className={messageClassName ?? styles.message}>{errorMessage}</p>
      )}
    </div>
  );
}

export interface LoadMoreButtonProps extends LoadMoreState {
  /** Fetches the next page, or retries the one that failed. */
  onLoadMore: () => void;
  /** The idle call to action, e.g. "Load more". */
  label: ReactNode;
  /** Shown while a page or its retry is in flight. */
  loadingLabel: ReactNode;
  /** Button size, forwarded to `Button` (its own default when omitted). */
  size?: ButtonSize;
  /** Class on the button, e.g. a larger coarse-pointer target. */
  className?: string;
}

/**
 * ENG-501: the ghost button of a paged list's footer. It reads `label` while
 * idle, `common:error.retry` once a page failed, and `loadingLabel` while a
 * page or its retry is in flight.
 */
export function LoadMoreButton({
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
  label,
  loadingLabel,
  size,
  className,
}: LoadMoreButtonProps) {
  const { t } = useTranslation();
  // The `isFetchingNextPage` prop only turns true on the re-render after a
  // press, so a second press before that render would fetch again. This ref
  // holds the press until the list reports it is idle; it is cleared on any
  // render while idle, so a press that never starts a fetch cannot lock the
  // button.
  const isPressPendingRef = useRef(false);
  useEffect(() => {
    if (!isFetchingNextPage) isPressPendingRef.current = false;
  });
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={className}
      // `aria-disabled` keeps focus on the button while a page (or its retry)
      // is in flight; a real `disabled` would drop it to the page body.
      aria-disabled={isFetchingNextPage || undefined}
      onClick={() => {
        if (isFetchingNextPage || isPressPendingRef.current) return;
        isPressPendingRef.current = true;
        onLoadMore();
      }}
    >
      {isFetchingNextPage
        ? loadingLabel
        : isFetchNextPageError
          ? t("common:error.retry")
          : label}
    </Button>
  );
}

export interface LoadMoreFooterProps extends Omit<
  LoadMoreButtonProps,
  "className"
> {
  /** The failure line, e.g. "We couldn't load more roles." */
  errorMessage: string;
  /** Class on the footer, e.g. its offset from the list above. */
  className?: string;
  /** Replaces the default centred, faded line style. */
  messageClassName?: string;
  /** Marks the footer busy for assistive tech, e.g. while a page loads. */
  "aria-busy"?: boolean;
}

/**
 * ENG-501: the stacked paged-list footer, its failure line centred above the
 * button. A row layout (the line beside its button) composes
 * `LoadMoreStatus` and `LoadMoreButton` directly.
 */
export function LoadMoreFooter({
  errorMessage,
  className,
  messageClassName,
  "aria-busy": isBusy,
  ...buttonProps
}: LoadMoreFooterProps) {
  return (
    <div
      className={[styles.footer, className].filter(Boolean).join(" ")}
      aria-busy={isBusy}
    >
      <LoadMoreStatus
        isFetchingNextPage={buttonProps.isFetchingNextPage}
        isFetchNextPageError={buttonProps.isFetchNextPageError}
        errorMessage={errorMessage}
        messageClassName={messageClassName}
      />
      <LoadMoreButton {...buttonProps} />
    </div>
  );
}
