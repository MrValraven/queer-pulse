import { Link } from "react-router-dom";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { RsvpConfirmationCard, RsvpCodeOfCare } from "./RsvpSections";
import { useUnrsvp } from "./api/useEventMutations";
import styles from "./RsvpPage.module.css";

/** Slug of the reading-group gathering this confirmation page is fixed to. */
const RSVP_SLUG = "reading-group-8";

export function RsvpPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const unrsvp = useUnrsvp(RSVP_SLUG);

  return (
    <>
      <div className={styles.root}>
        <div className={styles.brand}>
          <Link to={routes.homepage} className={styles.brandLink}>
            <span className={styles.pulseDot} aria-hidden />
            {"Queer"}
            <span className={styles.brandItalic}>{"Pulse"}</span>
          </Link>
        </div>

        <div className={styles.page}>
          <RsvpConfirmationCard />
        </div>

        <RsvpCodeOfCare />

        <div className={styles.footer}>
          <p>
            {t("gatherings:rsvp.footer.membership")}{" "}
            <Link
              to={routes.gatherings}
              onClick={() => {
                unrsvp.mutate();
                showToast(t("gatherings:rsvp.footer.cancelledToast"), "info");
              }}
            >
              {t("gatherings:rsvp.footer.cancelCta")}
            </Link>{" "}
            ·{" "}
            <Link to={routes.privacy}>
              {t("gatherings:rsvp.footer.privacyCta")}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
