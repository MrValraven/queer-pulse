import type { Ref } from "react";
import { Spinner } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GoingAttendeesPreview.module.css";

interface GoingAttendeesMoreButtonProps {
  /** How many more people the press would reveal. */
  count: number;
  /** A page is loading for this press: the label holds its width under a
   *  spinner, and presses are ignored until it settles. */
  isBusy: boolean;
  onPress: () => void;
  /** The id of the region this button opens. */
  controlsId: string;
  /** Set on the toggle only; the load-more button inside the open list
   *  leaves it out. */
  isExpanded?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  /** Extra class, e.g. the fade a pill takes as it enters or leaves. */
  className?: string;
}

/**
 * The "+N more" pill of the "Who's going" row. While busy it keeps focus
 * (`aria-disabled` in place of `disabled`, which would drop focus to the page
 * body) and keeps its width, with the spinner laid over the hidden label, so
 * nothing in the row shifts while a page loads. It is always the list's last
 * flex item, mounted or unmounted whole: it never folds to zero width, so it
 * never holds a phantom line. `data-tap-target` grows its hit area to the
 * 44px minimum without changing the look.
 */
export function GoingAttendeesMoreButton({
  count,
  isBusy,
  onPress,
  controlsId,
  isExpanded,
  buttonRef,
  className,
}: GoingAttendeesMoreButtonProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <button
      ref={buttonRef}
      type="button"
      data-tap-target
      className={[styles.more, className].filter(Boolean).join(" ")}
      aria-label={t("gatherings:gathering.attendeesPreview.moreAriaLabel", {
        count,
      })}
      aria-expanded={isExpanded}
      aria-controls={controlsId}
      aria-busy={isBusy || undefined}
      aria-disabled={isBusy || undefined}
      onClick={() => {
        if (!isBusy) onPress();
      }}
    >
      <span className={isBusy ? styles.moreLabelHidden : undefined}>
        <Translation
          i18nKey="gatherings:gathering.attendeesPreview.moreLabel"
          values={{ count }}
          slots={{
            count: (
              <RollingNumber value={fmt.number(count)} numericValue={count} />
            ),
          }}
        />
      </span>
      {isBusy && <Spinner className={styles.moreSpinner} />}
    </button>
  );
}
