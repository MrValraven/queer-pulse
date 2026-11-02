import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FiCalendar } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import {
  Button,
  Collapse,
  EmptyState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { LoadMoreFooter } from "../../../shared/components/ui/LoadMoreFooter";
import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EventBatchTemplateOption } from "../api/eventBatch.api";
import styles from "./AddMonthTemplate.module.css";
import { templateOptionDate } from "./addMonthSummary";

const KEY_PREFIX = "gatherings:addMonth.template.";
const LOADING_ROW_COUNT = 3;

export interface AddMonthTemplatePickerProps {
  options: EventBatchTemplateOption[];
  selectedSlug: string | null;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onPick: (slug: string) => void;
  /** The picked event as the page knows it, shown when it is not among the
   *  loaded options. */
  selectedFallback?: EventBatchTemplateOption;
  /** Id of the section heading that names the list. */
  labelledBy: string;
}

/** Cover thumbnail, title, start day and place of one event. */
function TemplateOptionContent({
  option,
}: {
  option: EventBatchTemplateOption;
}) {
  const { t, language } = useTranslation();
  const placeText = option.isOnline ? t(`${KEY_PREFIX}online`) : option.place;
  const metaText = [templateOptionDate(option, language), placeText]
    .filter((part) => part !== "")
    .join(" · ");
  return (
    <>
      {option.coverImageUrl ? (
        <img
          className={styles.thumbnail}
          src={option.coverImageUrl}
          alt=""
          width={48}
          height={48}
          loading="lazy"
        />
      ) : (
        <span className={styles.thumbnailEmpty} aria-hidden="true">
          <FiCalendar />
        </span>
      )}
      <span className={styles.optionText}>
        <span className={styles.optionTitle}>{option.title}</span>
        {metaText && <span className={styles.optionMeta}>{metaText}</span>}
      </span>
    </>
  );
}

/** Loading rows, the load failure, or the empty state with its way out. */
function PickerStatus({
  isLoading,
  isError,
  onRetry,
}: Pick<AddMonthTemplatePickerProps, "isLoading" | "isError" | "onRetry">) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className={styles.loadingList} aria-busy="true">
        <span role="status" className="visuallyHidden">
          {t(`${KEY_PREFIX}loadingList`)}
        </span>
        {Array.from({ length: LOADING_ROW_COUNT }, (_, rowIndex) => (
          <SkeletonLine key={rowIndex} height={64} />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.failure} role="alert">
        <p className={styles.failureText}>{t(`${KEY_PREFIX}loadFailed`)}</p>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {t(`${KEY_PREFIX}retry`)}
        </Button>
      </div>
    );
  }
  return (
    <EmptyState
      compact
      icon={<FiCalendar />}
      title={t(`${KEY_PREFIX}empty.title`)}
      description={t(`${KEY_PREFIX}empty.body`)}
      action={{
        label: t(`${KEY_PREFIX}empty.cta`),
        to: routes.createGathering,
      }}
    />
  );
}

/**
 * The host's events as one radio group. The arrow keys move the checked
 * option inside the picker only, so walking the list never resets the host's
 * edits or loads an event; a click, Enter or Space picks it and folds the list.
 */
function TemplateOptionList({
  options,
  checkedSlug,
  labelledBy,
  onMove,
  onCommit,
}: {
  options: EventBatchTemplateOption[];
  /** The checked option: the arrow position, else the picked event. */
  checkedSlug: string | null;
  labelledBy: string;
  onMove: (slug: string) => void;
  onCommit: (slug: string) => void;
}) {
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: options.length,
    checkedIndex: options.findIndex((option) => option.slug === checkedSlug),
    onSelect: (index) => {
      const option = options[index];
      if (option) onMove(option.slug);
    },
  });
  return (
    <div
      className={styles.options}
      role="radiogroup"
      aria-labelledby={labelledBy}
    >
      {options.map((option, index) => {
        const radioProps = getRadioProps(index);
        const isChecked = option.slug === checkedSlug;
        const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCommit(option.slug);
            return;
          }
          radioProps.onKeyDown(event);
        };
        return (
          <button
            key={option.slug}
            type="button"
            role="radio"
            aria-checked={isChecked}
            ref={radioProps.ref}
            tabIndex={radioProps.tabIndex}
            onKeyDown={handleKeyDown}
            onClick={() => onCommit(option.slug)}
            className={[styles.option, isChecked && styles.optionChecked]
              .filter(Boolean)
              .join(" ")}
          >
            <TemplateOptionContent option={option} />
          </button>
        );
      })}
    </div>
  );
}

/** Section 1 of the month page: which event every date copies. Once one is
 *  picked the list folds to it, and "Use a different event" opens it again. */
export function AddMonthTemplatePicker(props: AddMonthTemplatePickerProps) {
  const { t } = useTranslation();
  const { options, selectedSlug, isLoading, isError, hasNextPage } = props;
  const [isHeldOpen, setIsHeldOpen] = useState(false);
  /** Where the arrow keys rest while the list is open. Picker-local, so it
   *  never reaches the page until the host picks. */
  const [arrowSlug, setArrowSlug] = useState<string | null>(null);
  /** Where focus goes after the next render, once the folded control is gone. */
  const pendingFocusRef = useRef<"list" | "change" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  const fallbackOption =
    props.selectedFallback?.slug === selectedSlug
      ? props.selectedFallback
      : null;
  // The picked event can sit beyond the loaded pages (a `from` link or a
  // resumed draft), so the page's own copy of it stands in.
  const chosenOption =
    options.find((option) => option.slug === selectedSlug) ??
    (selectedSlug === null ? null : fallbackOption);
  const isListOpen = chosenOption === null || isHeldOpen;

  // The control that had focus folds away, so focus follows to the control
  // that took its place.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target === null) return;
    pendingFocusRef.current = null;
    if (target === "change") changeButtonRef.current?.focus();
    else
      listRef.current
        ?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')
        ?.focus();
  });

  const commitPick = (slug: string) => {
    setIsHeldOpen(false);
    setArrowSlug(null);
    pendingFocusRef.current = "change";
    props.onPick(slug);
  };
  const reopenList = () => {
    setIsHeldOpen(true);
    setArrowSlug(null);
    pendingFocusRef.current = "list";
  };
  const hasOptions = options.length > 0;
  // A page of cancelled events can arrive with zero options and a next page
  // behind it, so the footer shows whenever more can load.
  const isFooterShown = hasNextPage || (hasOptions && isError);

  return (
    <div className={styles.picker}>
      <Collapse isOpen={chosenOption !== null && !isListOpen}>
        {chosenOption && (
          <div className={styles.chosen}>
            <div className={`${styles.option} ${styles.optionChecked}`}>
              <TemplateOptionContent option={chosenOption} />
            </div>
            <Button
              ref={changeButtonRef}
              variant="quiet"
              size="sm"
              aria-expanded={false}
              onClick={reopenList}
            >
              {t(`${KEY_PREFIX}changeTemplate`)}
            </Button>
          </div>
        )}
      </Collapse>
      <Collapse isOpen={isListOpen}>
        <div ref={listRef} className={styles.listArea}>
          <Collapse isOpen={hasOptions}>
            <TemplateOptionList
              options={options}
              checkedSlug={arrowSlug ?? selectedSlug}
              labelledBy={props.labelledBy}
              onMove={setArrowSlug}
              onCommit={commitPick}
            />
          </Collapse>
          <Collapse isOpen={!hasOptions && !hasNextPage}>
            <PickerStatus
              isLoading={isLoading}
              isError={isError}
              onRetry={props.onRetry}
            />
          </Collapse>
          <Collapse isOpen={isFooterShown}>
            <LoadMoreFooter
              className={styles.footer}
              isFetchingNextPage={props.isFetchingNextPage}
              isFetchNextPageError={isError}
              errorMessage={t(`${KEY_PREFIX}loadFailed`)}
              onLoadMore={hasNextPage ? props.onLoadMore : props.onRetry}
              label={t(`${KEY_PREFIX}loadMore`)}
              loadingLabel={t(`${KEY_PREFIX}loadingMore`)}
            />
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
