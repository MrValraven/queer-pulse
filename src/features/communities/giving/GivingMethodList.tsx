import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityGivingMethodDTO } from "../api/communityGiving.api";
import { GivingCopyRow } from "./GivingCopyRow";
import { GivingLinkRow } from "./GivingLinkRow";
import styles from "./Giving.module.css";

/** A community's ways to support, read-only, in the owner's order: links
 *  open in a new tab, MB WAY and IBAN rows copy their value. Each method's
 *  note sits under its row. */
export function GivingMethodList({
  methods,
  communityName,
}: {
  methods: CommunityGivingMethodDTO[];
  communityName: string;
}) {
  const { t } = useTranslation();
  const orderedMethods = [...methods].sort(
    (first, second) => first.position - second.position,
  );
  return (
    <ul
      className={styles.list}
      aria-label={t("communities:detail.giving.listLabel", {
        name: communityName,
      })}
    >
      {orderedMethods.map((method) => {
        const note = method.note?.trim() ?? "";
        return (
          <li key={method.id} className={styles.item}>
            {method.kind === "link" ? (
              <GivingLinkRow method={method} />
            ) : (
              <GivingCopyRow method={method} />
            )}
            {note && <p className={styles.note}>{note}</p>}
          </li>
        );
      })}
    </ul>
  );
}
