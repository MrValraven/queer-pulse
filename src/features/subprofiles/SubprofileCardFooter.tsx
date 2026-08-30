import type { ReactNode } from "react";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFollow } from "./SubprofileFollow";
import { SubprofileEndorse } from "./SubprofileEndorse";
import { personaAddressName } from "./subprofile-kinds";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShowcase.module.css";

/**
 * The hero's footer: social proof (follow/endorse counts) on the left, the
 * card's actions on the right — the owner-only Edit control (when the viewer
 * owns the persona), the always-present "Visit" link, and an optional external
 * CTA button. Every action the card offers lives on this one line, so an owner
 * reads the card the same way a visitor does instead of hunting for Edit up
 * beside the name. Edit leads so Visit and the CTA keep the same trailing
 * position they hold on the public path. Extracted from
 * `SubprofileFeatureCard` to keep it under the 200-line cap.
 */
export function SubprofileCardFooter({
  persona,
  href,
  ctaHref,
  isOwnerViewing,
  ownerControls,
}: {
  persona: PublicSubprofileView;
  href: string;
  ctaHref: string | null;
  isOwnerViewing: boolean;
  /** Owner-only controls (Edit) from `SubprofileFeatureCard`; `undefined` on
   *  the public path, where the row is just Visit (+ CTA). */
  ownerControls?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <SubprofileFollow
          subprofileId={persona.id}
          followerCount={persona.followerCount}
          viewerFollowing={persona.viewerFollowing}
          isOwnerViewing={isOwnerViewing}
        />
        <SubprofileEndorse
          subprofileId={persona.id}
          endorsementCount={persona.endorsementCount}
          viewerEndorsed={persona.viewerEndorsed}
          isOwnerViewing={isOwnerViewing}
          personaName={personaAddressName({
            displayName: persona.displayName,
            kind: persona.kind,
            ownerName: persona.ownerName,
          })}
          personaAvatarUrl={persona.avatarUrl}
        />
      </div>
      <div className={styles.footerRight}>
        {ownerControls}
        <Button variant="ghost" size="md" to={href}>
          {t("subprofiles:alsoAs.viewPersona")}
          <FiArrowRight aria-hidden />
        </Button>
        {ctaHref && persona.ctaLabel && (
          <Button
            variant="primary"
            size="md"
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {persona.ctaLabel} <FiExternalLink aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
