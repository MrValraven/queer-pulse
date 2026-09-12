import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { formatRelative } from "../../../shared/lib/date";
import type { MemberProfile } from "../data/memberProfiles";
import type { NowInsights } from "../api/nowInsights.api";
import { NowBoundaryNote } from "./NowBoundaryNote";
import { NowHistoryDisclosure } from "./NowHistoryDisclosure";
import { NowOpenToChips } from "./NowOpenToChips";
import styles from "./NowCard.module.css";

export interface NowCardProps {
  profile: MemberProfile;
  isSelf: boolean;
  /** Owner-only figures. Null for a visitor, and null for the owner whenever
   *  the request failed: the card must read correctly without them. */
  insights: NowInsights | null;
  onUpdate: () => void;
}

/**
 * The Now card: a plum ground that stays plum in BOTH themes, carrying the
 * member's status, their boundary note, the doors they are open to, and how
 * fast they usually reply.
 *
 * The card owns the colour contract for everything inside it. `.card` defines
 * the `--now-*` steps (ink, muted ink, edge, fill) that every child stylesheet
 * in this folder reads, so a child never re-derives cream-on-plum for itself
 * and the four later tasks cannot drift apart on contrast.
 */
export function NowCard({ profile, isSelf, insights, onUpdate }: NowCardProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  // `NowSection`'s gate lets a member through on a status alone, or on a
  // boundary note alone, so the doors row can legitimately be empty. Without
  // these gates the card would draw a hairline, then the chip row's own
  // vertical space, then an empty flex box.
  const hasOpenTo = profile.openTo.length > 0;
  // A live dot is a claim that something current is on screen. With only a
  // boundary note there is nothing for it to mark, and a green "live" pip over
  // a negation misreads. The eyebrow word stays either way: it still labels
  // the card.
  const hasStatus = Boolean(profile.now?.trim());
  // The explainer's words are literally about the chips ("the doors people can
  // tap to reach you"), so it goes when they do. That state is reachable now
  // that a boundary note alone opens the section: the owner would otherwise
  // read a sentence describing a row that is not on their card.
  const hasExplainer = isSelf && hasOpenTo;
  const hasFooter = hasExplainer || Boolean(profile.respondsWithin);
  return (
    <div className={styles.card}>
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowGroup}>
          {hasStatus && <span className={styles.liveDot} aria-hidden />}
          <span className={styles.eyebrow}>
            {t("members:content.now.eyebrow")}
          </span>
        </span>
        {isSelf && hasStatus && insights?.nowUpdatedAt && (
          <span className={styles.updated}>
            {t("members:content.now.updated", {
              relative: formatRelative(insights.nowUpdatedAt, formatters),
            })}
          </span>
        )}
        {isSelf && (
          <Button
            variant="ghost-dark"
            size="sm"
            className={styles.updateButton}
            onClick={onUpdate}
            /* "Update" alone is the whole visible label, which reads as an
               orphan out of context in a screen-reader's control list. This is
               a DEDICATED key, not the modal's `edit.title`: the accessible
               name has to contain the visible label (WCAG 2.5.3 Label in Name)
               and the PT heading "Atualiza o teu Agora" does not contain the PT
               label "Atualizar", so a voice-control user saying the word on
               screen could not activate the button. */
            aria-label={t("members:content.now.updateAction")}
          >
            {t("members:content.now.update")}
          </Button>
        )}
      </div>
      {hasStatus && <p className={styles.status}>{profile.now}</p>}
      <NowBoundaryNote notHereFor={profile.notHereFor} />
      {isSelf && insights && (
        <NowHistoryDisclosure history={insights.history} />
      )}
      {hasOpenTo && <hr className={styles.rule} />}
      <NowOpenToChips profile={profile} isSelf={isSelf} insights={insights} />
      {hasFooter && (
        <div className={styles.footer}>
          {hasExplainer && (
            <span className={styles.explainer}>
              {t("members:content.now.explainer")}
            </span>
          )}
          {profile.respondsWithin && (
            <span className={styles.responds}>
              <span className={styles.respondsDot} aria-hidden />
              {t(
                `members:content.now.respondsWithin.${profile.respondsWithin}`,
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
