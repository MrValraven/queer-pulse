import { FiAward } from "react-icons/fi";
import type { StaffBadgeSize } from "../components/ui/StaffBadge";
import { useFormat } from "../i18n/format";
import { useTranslation } from "../i18n/useTranslation";
import { AMBASSADOR_FOCUS_LABEL_KEY } from "./ambassadorFocusAreas.data";
import type { AmbassadorIdentity } from "./ambassadors.api";
import styles from "./AmbassadorTag.module.css";

/** The staff badge's two labelled sizes: `lg` is the profile hero, `sm` is
 *  everywhere else. The tag has no icon-only form. */
export type AmbassadorTagSize = Exclude<StaffBadgeSize, "icon">;

/** Month and year of the grant: "September 2026", "setembro de 2026". The
 *  long month because `pt-PT` renders a short month as "09/2026". */
const SINCE_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

/**
 * Marks a member QueerPulse partners with, who publicly backs the platform.
 *
 * A sibling of `StaffBadge`: same sizes, pill and type, in a tone of its own so
 * it never reads as a staff tier. Ambassadors hold no powers, and the tag must
 * not suggest they do.
 *
 * Inert text with no link, for the reason `StaffBadge` gives: most bylines
 * already wrap the name in a `<Link>`, and an anchor inside an anchor is
 * invalid HTML.
 *
 * Both sizes carry a visible label. At `lg` the since date and focus area sit
 * on a visible meta line beside the pill, because `title` does not fire on
 * touch and phone users would otherwise never see them.
 *
 * Presentational: `MemberAmbassadorTag` resolves the roster and the
 * staff-wins rule lives in `MemberStaffBadge` and `MemberIdentity`.
 */
export function AmbassadorTag({
  identity,
  size = "sm",
  className,
}: {
  identity: AmbassadorIdentity;
  size?: AmbassadorTagSize;
  className?: string;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const longLabel = t("shared:ambassador.tag.long");
  const label = size === "lg" ? longLabel : t("shared:ambassador.tag.short");
  const pill = (
    <span
      className={[styles.tag, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      title={size === "lg" ? undefined : longLabel}
    >
      <FiAward aria-hidden />
      {label}
    </span>
  );
  if (size !== "lg") return pill;
  const meta = t("shared:ambassador.tag.meta", {
    since: formatters.date(new Date(identity.since), SINCE_DATE_FORMAT),
    focus: t(AMBASSADOR_FOCUS_LABEL_KEY[identity.focusArea]),
  });
  return (
    <>
      {pill}
      <span className={styles.meta}>{meta}</span>
    </>
  );
}
