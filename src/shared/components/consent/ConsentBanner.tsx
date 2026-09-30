import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useConsent } from "../../../app/providers/useConsent";
import styles from "./Consent.module.css";

/** CSS custom property other fixed-bottom chrome (the install nudge, the
 * settings save bars) reads to clear this banner while it's showing. Same idiom
 * as `--bottom-inset` for the installed tab bar, but transient. It holds the
 * distance from the viewport's bottom edge to the banner's top edge, so an
 * element offset by it clears the banner's padding and border as well. */
const CONSENT_INSET_PROPERTY = "--consent-inset";

/** The banner's footprint from the viewport's bottom edge: its border-box
 * height plus its CSS `bottom` offset (0 today; counted so a banner that
 * floats above the edge still publishes the right value). Read from layout
 * boxes, so the entrance animation's `translateY` never skews it. */
function measureConsentInset(
  element: HTMLElement,
  entry: ResizeObserverEntry,
): number {
  const borderBox = entry.borderBoxSize?.[0];
  const borderBoxHeight = borderBox
    ? borderBox.blockSize
    : element.getBoundingClientRect().height;
  const bottomOffset = parseFloat(getComputedStyle(element).bottom) || 0;
  return Math.ceil(borderBoxHeight + Math.max(0, bottomOffset));
}

/**
 * App-wide consent banner (spec 07). A quiet bottom sheet on cream — never a
 * full-page wall, and the app stays fully usable behind it (necessary cookies
 * need no consent). Reject is exactly as prominent as Accept. Shown only while
 * no choice has been made under the current policy version.
 */
export function ConsentBanner() {
  const { t } = useTranslation();
  const { status, prefsOpen, acceptAll, rejectAll, openPreferences } =
    useConsent();
  // Hide the banner while the preference center is open, so the bottom sheet
  // doesn't overlap the modal.
  const visible = status === "unknown" && !prefsOpen;

  const bannerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!visible) return;
    const element = bannerRef.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      root.style.setProperty(
        CONSENT_INSET_PROPERTY,
        `${measureConsentInset(element, entry)}px`,
      );
    });
    observer.observe(element, { box: "border-box" });
    return () => {
      observer.disconnect();
      root.style.removeProperty(CONSENT_INSET_PROPERTY);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      className={styles.banner}
      role="region"
      aria-label={t("shared:consent.banner.ariaLabel")}
    >
      <div className={styles.bannerInner}>
        <div className={styles.bannerText}>
          <h2 className={styles.bannerTitle}>
            <Translation
              i18nKey="shared:consent.banner.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.bannerBody}>
            <Translation
              i18nKey="shared:consent.banner.body"
              components={{
                a: <Link to={routes.privacy} className={styles.bannerLink} />,
              }}
            />
          </p>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="ghost" onClick={() => rejectAll("banner")}>
            {t("shared:consent.actions.rejectNonEssential")}
          </Button>
          <Button variant="ghost" onClick={openPreferences}>
            {t("shared:consent.actions.choose")}
          </Button>
          <Button variant="primary" onClick={() => acceptAll("banner")}>
            {t("shared:consent.actions.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
