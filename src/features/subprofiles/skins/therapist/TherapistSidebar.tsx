import { useId } from "react";
import { FiFlag, FiShare2 } from "react-icons/fi";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { personaPublicPathOrNull } from "../../personaLinks.data";
import { shareSubprofile } from "../../shareSubprofile";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { TherapistContactCard } from "./TherapistContactCard";
import { TherapistEditLink } from "./TherapistEditLink";
import type { TherapistEditTarget } from "./therapistEditLinks.data";
import { TherapistSocialLinks } from "./TherapistSocialLinks";
import { TherapistSimilar } from "./TherapistSimilar";
import styles from "./TherapistSidebar.module.css";

interface TherapistSidebarProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}

const GOOD_TO_KNOW_EDIT: TherapistEditTarget = {
  pane: "skinBlocks",
  chapter: "contact",
  field: "therapist.goodToKnow",
};

/** The owner's note for visitors. Empty text renders only for the owner,
 *  as a quiet "Add …" link in the card's place. */
function GoodToKnowCard({ text }: { text: string }) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <div className={styles.headRow}>
        <h2 id={headingId} className={styles.label}>
          {t("subprofiles:therapist.side.goodToKnow.label")}
        </h2>
        {text && <TherapistEditLink target={GOOD_TO_KNOW_EDIT} />}
      </div>
      {text ? (
        <p className={styles.body}>{text}</p>
      ) : (
        <TherapistEditLink
          target={GOOD_TO_KNOW_EDIT}
          label={t("subprofiles:therapist.side.add.goodToKnow")}
        />
      )}
    </section>
  );
}

/** Report and Share rows. Share reuses the hero's `shareSubprofile` (native
 *  share sheet, else copy link with a toast) and works for everyone once the
 *  persona has a public address; the editor preview gets a look-alike.
 *  Report is live for a stranger only: inert while the owner reads the page
 *  as a visitor, and absent in owner mode, since nobody reports themselves. */
function LinksCard({
  data,
  mode,
  onAction,
}: Omit<TherapistSidebarProps, "view">) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isReportShown = mode !== "owner";
  const isReportLive = mode === "public";
  const isShareLive =
    mode !== "preview" && personaPublicPathOrNull(data) !== null;

  return (
    <div className={styles.card}>
      <div className={styles.links}>
        {isReportShown && (
          <button
            type="button"
            className={styles.linkRow}
            disabled={!isReportLive}
            onClick={() => onAction("report")}
          >
            <FiFlag aria-hidden className={styles.linkIcon} />
            {t("subprofiles:therapist.side.links.report")}
            <span className={styles.linkHint}>
              {t("subprofiles:therapist.side.links.reportHint")}
            </span>
          </button>
        )}
        <button
          type="button"
          className={styles.linkRow}
          disabled={!isShareLive}
          onClick={() => void shareSubprofile(data, t, showToast)}
        >
          <FiShare2 aria-hidden className={styles.linkIcon} />
          {t("subprofiles:therapist.side.links.share")}
        </button>
      </div>
    </div>
  );
}

/**
 * The therapist page's right column: contact (inert with Edit links for the
 * owner), social links, good to know, other therapists, then report and
 * share. T2's aside owns the sticky placement; this is only the stack of
 * cards.
 */
export function TherapistSidebar({
  data,
  view,
  mode,
  onAction,
}: TherapistSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <TherapistContactCard
        data={data}
        view={view}
        mode={mode}
        onAction={onAction}
      />
      <TherapistSocialLinks
        links={data.socialLinks}
        name={view.firstName || data.displayName}
        mode={mode}
      />
      {(view.goodToKnow || mode === "owner") && (
        <GoodToKnowCard text={view.goodToKnow} />
      )}
      <TherapistSimilar data={data} mode={mode} />
      <LinksCard data={data} mode={mode} onAction={onAction} />
    </div>
  );
}
