import type { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";
import { MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { accentStyle, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileOwnerBadges } from "./SubprofileOwnerBadges";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileStatus, Visibility } from "./api/subprofiles.api";
import styles from "./SubprofileShowcase.module.css";

/**
 * One row of the mobile accordion ({@link SubprofileShowcaseMobile}): a
 * summary button — avatar, display name, "kind · tagline", availability —
 * that expands the row in place. `children` (the full `SubprofileFeatureCard`) is
 * only mounted while `isExpanded`, so collapsed rows never pay for the
 * card's follow/endorse network calls, and there is nothing to animate a
 * height on — the detail region simply mounts with a fade/translate reveal.
 */
export function SubprofileMobileRow({
  persona,
  isExpanded,
  detailId,
  onExpand,
  status,
  visibility,
  children,
}: {
  persona: PublicSubprofileView;
  isExpanded: boolean;
  detailId: string;
  onExpand: () => void;
  /** Self view only: shown `compact` (via `SubprofileOwnerBadges`) right in
   *  the collapsed summary, so an owner can see draft/unlisted state
   *  without expanding the row. `undefined` on the public path. */
  status?: SubprofileStatus;
  visibility?: Visibility;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const accent = persona.accent ?? DEFAULT_ACCENT;
  // "kind · tagline" — the aka-card secondary line. Falls back to the kind
  // alone when the persona has no tagline set.
  const kindLabel = t(KIND_LABEL_KEYS[persona.kind]);
  const secondary = persona.tagline ? `${kindLabel} · ${persona.tagline}` : kindLabel;

  return (
    <div className={styles.mobileRow} data-expanded={isExpanded}>
      <button
        type="button"
        className={styles.mobileSummary}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        title={t("subprofiles:alsoAs.expandCard")}
        onClick={onExpand}
        style={accentStyle(accent)}
      >
        {/* Avatar + display name + "kind · tagline" line reuse the shared
            identity block (fixed persona plum tint). No `to` — this row lives
            inside a `<button>`, so a nested link is disallowed. Availability,
            the owner badges, and the trailing expand chevron stay row-local
            siblings around it. */}
        <MemberIdentity
          person={{ name: persona.displayName, avatarUrl: persona.avatarUrl ?? undefined }}
          tint="plum"
          size={40}
          secondary={secondary}
        />
        <SubprofileAvailability value={persona.availability} accent={accent} />
        <SubprofileOwnerBadges
          status={status}
          visibility={visibility}
          compact
          className={styles.mobileSummaryBadges}
        />
        <FiChevronRight className={styles.mobileChevron} aria-hidden />
      </button>

      {/* The id itself stays mounted at all times so `aria-controls` above
          always resolves to a real element, even collapsed. The animated
          inner wrapper — and `children` (the persona's full feature card,
          with its own follow/endorse network calls) — only mounts while
          expanded, so collapsed rows cost nothing beyond the summary. */}
      <div id={detailId}>
        {isExpanded && (
          <div className={styles.mobileDetail}>{children}</div>
        )}
      </div>
    </div>
  );
}
