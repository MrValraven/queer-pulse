import { Avatar, type AvatarTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STAGE_DTO_TO_VIEW } from "../api/pieces.adapters";
import type { DeskSummaryView } from "../api/useDeskSummary";
import { stripEm } from "../data/desk.copy";
import type { Editor } from "../data/desk.data";
import styles from "./DeskSidebar.module.css";

export interface DeskSidebarProps {
  summary: DeskSummaryView | undefined;
  editors: Editor[];
}

const EDITOR_TINT_TO_AVATAR_TINT: Record<Editor["tint"], AvatarTint> = {
  coral: "coral",
  jade: "jade",
  // Avatar has no "violet" tint; the closest repo tint for a deep purple is plum.
  violet: "plum",
};

/** First one or two initials from a free-form label ("Sara Pinheiro" → "SP",
 * a bare id → its first two characters), for rows with no matched `Editor`. */
function initialsFromLabel(label: string): string {
  const [firstWord, secondWord] = label.trim().split(/\s+/).filter(Boolean);
  if (!firstWord) return "?";
  if (!secondWord) return firstWord.slice(0, 2).toUpperCase();
  return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
}

/**
 * The desk's right rail: where the issue stands (stage load), editor load
 * (flagging anyone over their cap), and a recent-activity feed. Reads the
 * server-aggregated summary — never raw pieces — so demo and live mode share
 * the exact same rendering path. Activity rows arrive already resolved to a
 * name and a human phrase naming the piece by its title, so no uuid or
 * `action` enum is ever rendered here. Renders no phase badges.
 */
export function DeskSidebar({ summary, editors }: DeskSidebarProps) {
  const { t } = useTranslation();
  const stageLoad = summary?.stageLoad ?? [];
  const editorLoad = summary?.editorLoad ?? [];
  const activity = summary?.activity ?? [];
  const maxStageCount = Math.max(1, ...stageLoad.map((entry) => entry.count));

  return (
    <aside className={styles.side}>
      <div className={styles.card}>
        <h3>{t("magazine:desk.sidebar.issueStanding")}</h3>
        {stageLoad.length === 0 ? (
          <span className={styles.emptyNote}>
            {t("magazine:desk.sidebar.noPiecesYet")}
          </span>
        ) : (
          <div className={styles.load}>
            {stageLoad.map((entry) => (
              <div className={styles.row} key={entry.stage}>
                <span className={styles.rowLabel}>{STAGE_DTO_TO_VIEW[entry.stage]}</span>
                <div className={styles.bar}>
                  <i style={{ width: `${(entry.count / maxStageCount) * 100}%` }} />
                </div>
                <b>{entry.count}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:desk.sidebar.editorLoad")}</h3>
        {editorLoad.length === 0 ? (
          <span className={styles.emptyNote}>
            {t("magazine:desk.sidebar.noEditorsYet")}
          </span>
        ) : (
          <div className={styles.load}>
            {editorLoad.map((entry) => {
              const editor = editors.find((candidate) => candidate.id === entry.editorId);
              const label = editor ? editor.name.split(" ")[0] : entry.editorId;
              const overCap = entry.count > entry.cap;
              const widthPercent = entry.cap > 0 ? Math.min(100, (entry.count / entry.cap) * 100) : 100;
              return (
                <div className={styles.row} key={entry.editorId}>
                  <Avatar
                    initials={editor?.initials ?? initialsFromLabel(entry.editorId)}
                    tint={editor ? EDITOR_TINT_TO_AVATAR_TINT[editor.tint] : "default"}
                    size={26}
                  />
                  <span className={styles.rowLabel}>{label}</span>
                  <div className={styles.bar}>
                    <i
                      className={overCap ? styles.over : undefined}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <b>{entry.count}</b>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:desk.sidebar.activity")}</h3>
        {activity.length === 0 ? (
          <span className={styles.emptyNote}>
            {t("magazine:desk.sidebar.nothingHereYet")}
          </span>
        ) : (
          <div className={styles.feed}>
            {activity.map((entry) => {
              const editor = editors.find((candidate) => candidate.id === entry.actorId);
              const who = entry.who || t("magazine:desk.sidebar.someone");
              return (
                <div className={styles.feedRow} key={entry.id}>
                  <Avatar
                    initials={editor?.initials ?? initialsFromLabel(who)}
                    tint={editor ? EDITOR_TINT_TO_AVATAR_TINT[editor.tint] : "default"}
                    size={26}
                  />
                  <span>
                    <b className={styles.actor}>{who}</b> {stripEm(entry.what)}{" "}
                    <time>{entry.when}</time>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
