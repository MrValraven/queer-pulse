import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type GlanceRow } from "./safeSpaces";
import styles from "./SafeSpaceDetailPage.module.css";

/**
 * The slice of `VerifiedSpace` this aside actually reads. Deliberately
 * narrower than the full `VerifiedSpace` (interface-segregation: the
 * safe-spaces hub's own detail page passes a full `VerifiedSpace` — which
 * satisfies this structurally — but the directory detail page's inline trust
 * section (`DirectorySpaceTrust`) only has `name`/`address` from its own
 * `DirectoryPlace` and no `glance` facts from the directory's trust DTO, so it
 * builds this minimal shape directly instead of faking out an entire
 * `VerifiedSpace`.
 */
export interface VerifiedSpaceAsideData {
  name: string;
  address: string;
  glance: GlanceRow[];
}

/** The right-hand sidebar of a verified safe space: address, at-a-glance
 *  facts (when there are any), and the copy-link share card.
 *
 *  `showBackLink` (default `true`) controls the "back to all safe spaces"
 *  CTA — on by default for the safety hub, but set to `false` when this
 *  aside is embedded elsewhere (e.g. the directory detail page's inline
 *  trust section), where a link back to the safe-spaces hub is off-context. */
export function SafeSpaceVerifiedAside({
  space,
  showBackLink = true,
}: {
  space: VerifiedSpaceAsideData;
  showBackLink?: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const share = () => {
    if (navigator.clipboard)
      void navigator.clipboard.writeText(window.location.href);
    showToast(t("safety:spaces.detail.linkCopiedToast"), "success");
  };

  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <h4>{t("safety:spaces.detail.whereTitle")}</h4>
        <div className={styles.addr}>
          <b>{space.name}</b>
          {space.address}
        </div>
        {showBackLink && (
          <Button
            variant="ghost"
            className={styles.sideFull}
            to={routes.safeSpaces}
          >
            {t("safety:spaces.detail.backAllCta")}
          </Button>
        )}
      </div>

      {space.glance.length > 0 && (
        <div className={styles.sideCard}>
          <h4>{t("safety:spaces.detail.glanceTitle")}</h4>
          {space.glance.map((g) => (
            <div className={styles.sideRow} key={g.label}>
              <span>{g.label}</span>
              <b className={g.accent ? styles.accentV : undefined}>
                {g.value}
              </b>
            </div>
          ))}
        </div>
      )}

      <div className={[styles.sideCard, styles.sharePlum].join(" ")}>
        <h4>{t("safety:spaces.detail.shareTitle")}</h4>
        <p>{t("safety:spaces.detail.shareBody")}</p>
        <Button variant="ghost-dark" className={styles.sideFull} onClick={share}>
          {t("safety:spaces.detail.copyLinkCta")}
        </Button>
      </div>
    </aside>
  );
}
