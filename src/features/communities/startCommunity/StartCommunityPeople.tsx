import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Avatar, Button } from "../../../shared/components/ui";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/**
 * Chapter 7 — People: invite a few to be there on day one. You can only invite
 * people you're already connected to, so the picker is your real connections
 * (`useConnectionsList("all")` — the mock relationships in demo, the server's
 * connection list in live), never a hardcoded roster.
 */
export function StepPeople({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, toggleInvite } = form;
  // The picker pages through the whole connections list: with only the first
  // page loaded, a member with more connections than fit on it simply could
  // not invite the rest.
  const {
    views: connections,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConnectionsList("all");
  return (
    <div>
      <div className={styles.field}>
        <label>{t("communities:start.people.label")}</label>
        <span className={styles.hint}>
          {t("communities:start.people.hint")}
        </span>
        {connections.length === 0 ? (
          <p className={styles.hint}>{t("communities:start.people.empty")}</p>
        ) : (
          <div className={styles.inviteList}>
            {connections.map((connection) => {
              const isOn = draft.invites.includes(connection.slug);
              return (
                <button
                  key={connection.slug}
                  type="button"
                  className={[styles.inviteChip, isOn && styles.inviteOn]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isOn}
                  onClick={() => toggleInvite(connection.slug)}
                >
                  <Avatar
                    src={connection.photo}
                    initials={connection.initials}
                    tint={connection.tint}
                    size={28}
                  />
                  <span className={styles.icName}>{connection.name}</span>
                  {isOn && (
                    <span className={styles.icCheck}>
                      <FiCheck size={14} aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage
              ? t("communities:common.loading")
              : t("communities:start.people.loadMore")}
          </Button>
        )}
      </div>
      <p className={styles.seedNote}>
        {t("communities:start.people.seedNote")}
      </p>
    </div>
  );
}
