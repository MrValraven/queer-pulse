import type { ReactNode } from "react";
import { MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileOwnerBadges } from "./SubprofileOwnerBadges";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileStatus, Visibility } from "./api/subprofiles.api";
import styles from "./SubprofileShowcase.module.css";

/**
 * One row of the mobile accordion ({@link SubprofileShowcaseMobile}): a
 * summary button — avatar, display name, kind label, availability — that
 * expands the row in place. `children` (the full `SubprofileFeatureCard`) is
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
  const { tint, on } = ACCENT_TOKENS[accent];

  return (
    <div className={styles.mobileRow} data-expanded={isExpanded}>
      <button
        type="button"
        className={styles.mobileSummary}
        aria-expanded={isExpanded}
        aria-controls={detailId}
        title={t("subprofiles:alsoAs.expandCard")}
        onClick={onExpand}
        style={{
          ["--accent-tint" as string]: tint,
          ["--accent-on" as string]: on,
        }}
      >
        {/* Avatar + display name + kind line reuse the shared identity block
            (fixed persona plum tint). No `to` — this row lives inside a
            `<button>`, so a nested link is disallowed; the kind label is the
            single-line secondary. Availability and the owner badges stay
            row-local siblings around it. */}
        <MemberIdentity
          person={{ name: persona.displayName, avatarUrl: persona.avatarUrl ?? undefined }}
          tint="plum"
          size={40}
          secondary={t(KIND_LABEL_KEYS[persona.kind])}
        />
        <SubprofileAvailability value={persona.availability} accent={accent} />
        <SubprofileOwnerBadges
          status={status}
          visibility={visibility}
          compact
          className={styles.mobileSummaryBadges}
        />
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
