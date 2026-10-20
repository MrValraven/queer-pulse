import { FiShield } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityGivingDTO } from "../api/communityGiving.api";
import { GivingMethodList } from "./GivingMethodList";
import styles from "./Giving.module.css";

/**
 * The Support tab's read view: the owner's intro, the ways to support, the
 * reminder that money goes straight to the community, and when the section
 * last changed.
 */
export function CommunityGivingReadView({
  giving,
  communityName,
}: {
  giving: CommunityGivingDTO;
  communityName: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const intro = giving.intro?.trim() ?? "";

  return (
    <>
      {intro && <p className={styles.intro}>{intro}</p>}
      <GivingMethodList
        methods={giving.methods}
        communityName={communityName}
      />
      <p className={styles.notice}>
        <FiShield aria-hidden />
        <span>
          {t("communities:detail.giving.footer.notice", {
            name: communityName,
          })}
        </span>
      </p>
      {giving.updatedAt && (
        <p className={styles.updated}>
          {t("communities:detail.giving.footer.updated", {
            date: format.date(new Date(giving.updatedAt)),
          })}
        </p>
      )}
    </>
  );
}
