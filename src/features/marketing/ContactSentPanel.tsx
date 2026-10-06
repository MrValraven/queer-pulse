import { Link } from "react-router-dom";
import { SuccessPanel } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./ContactPage.module.css";

/** The Wellbeing page's crisis lines section, open to signed-out visitors. */
const CRISIS_LINES_HREF = `${routes.wellbeing}#crisis`;

/**
 * The Contact form's confirmation, on the shared plum `SuccessPanel`.
 *
 * Its one action reopens the form for another message: the page outro below
 * already carries the way home. PRD-452: a safety concern is stored as
 * priority on the backend, sorted first in the admin inbox and announced to
 * staff, so its confirmation says exactly that, names no reply time, and
 * points to 112 and the crisis lines for anything urgent.
 */
export function ContactSentPanel({
  isSafety,
  onWriteAnother,
}: {
  isSafety: boolean;
  onWriteAnother: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SuccessPanel
      title={t("marketing:contact.sent.heading")}
      em={t("marketing:contact.sent.headingEm")}
      onClose={onWriteAnother}
      closeLabel={t("marketing:contact.sent.writeAnotherCta")}
      footer={
        isSafety ? (
          <Translation
            i18nKey="marketing:contact.sent.urgentHelp"
            components={{
              b: <b />,
              link: <Link className={s.urgentLink} to={CRISIS_LINES_HREF} />,
            }}
          />
        ) : undefined
      }
    >
      {isSafety
        ? t("marketing:contact.sent.safetyBody")
        : t("marketing:contact.sent.body")}
    </SuccessPanel>
  );
}
