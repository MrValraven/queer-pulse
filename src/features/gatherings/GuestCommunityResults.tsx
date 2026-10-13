import type { KeyboardEvent, Ref } from "react";
import { FiUsers } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GuestCommunityCandidate } from "./useGuestCommunityCandidates";
import styles from "./GuestCommunitiesPicker.module.css";

/**
 * What the open search shows: a failed load first (an outage must not read
 * as "no community matches"), then the loading line, then the matches or
 * the empty line. Options follow the co-host picker's list pattern.
 */
export function GuestCommunityResults({
  resultsId,
  listRef,
  matches,
  isLoading,
  isError,
  onRetry,
  onPick,
  onOptionKeyDown,
}: {
  resultsId: string;
  listRef: Ref<HTMLUListElement>;
  matches: GuestCommunityCandidate[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPick: (community: GuestCommunityCandidate) => void;
  onOptionKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
}) {
  const { t } = useTranslation();
  if (isError) {
    return (
      <div id={resultsId} className={styles.error}>
        <p role="status" className={styles.errorText}>
          {t("gatherings:guestCommunities.loadError")}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
          {t("shared:loadError.retryCta")}
        </Button>
      </div>
    );
  }
  if (isLoading || matches.length === 0) {
    return (
      <p id={resultsId} role="status" className={styles.empty}>
        {t(
          isLoading
            ? "gatherings:guestCommunities.loading"
            : "gatherings:guestCommunities.noMatch",
        )}
      </p>
    );
  }
  return (
    <ul
      ref={listRef}
      id={resultsId}
      className={styles.options}
      aria-label={t("gatherings:guestCommunities.resultsLabel")}
    >
      {matches.map((community, index) => (
        <li key={community.slug}>
          <button
            type="button"
            className={styles.option}
            onClick={() => onPick(community)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
          >
            <span className={styles.optionIcon} aria-hidden>
              <FiUsers />
            </span>
            <span className={styles.optionText}>
              <span className={styles.optionName}>{community.name}</span>
              {community.typeLabel && (
                <span className={styles.optionMeta}>{community.typeLabel}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
