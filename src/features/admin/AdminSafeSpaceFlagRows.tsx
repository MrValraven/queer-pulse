import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { formatDate } from "../../shared/lib/date";
import { AdminChip } from "./ui";
import { FLAG_REASON_LABEL_KEY } from "./adminSafeSpaceGovernance.data";
import { AdminSafeSpaceFlagResolveModal } from "./AdminSafeSpaceFlagResolveModal";
import type { AdminSafeSpaceFlagDTO } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * The moderator flag queue.
 *
 * This is the ONLY surface in the app that receives a flagger's written
 * detail, and it never renders their id. A venue owner has no route to this
 * page, and nothing here is echoed to one.
 */
export function AdminSafeSpaceFlagRows({
  flags,
}: {
  flags: AdminSafeSpaceFlagDTO[];
}) {
  const { t } = useTranslation();
  const [resolvingFlag, setResolvingFlag] =
    useState<AdminSafeSpaceFlagDTO | null>(null);

  if (flags.length === 0) {
    return (
      <p className={styles.emptyLine}>{t("safety:governance.flags.empty")}</p>
    );
  }

  return (
    <>
      <p className={styles.privacyNote}>
        {t("safety:governance.flags.privacyNote")}
      </p>
      <div className={styles.rows}>
        {flags.map((flag, index) => (
          <FadeIn key={flag.id} delay={Math.min(index, 8) * 50}>
            <FlagRow flag={flag} onResolve={setResolvingFlag} />
          </FadeIn>
        ))}
      </div>

      {resolvingFlag && (
        <AdminSafeSpaceFlagResolveModal
          flag={resolvingFlag}
          onClose={() => setResolvingFlag(null)}
        />
      )}
    </>
  );
}

function FlagRow({
  flag,
  onResolve,
}: {
  flag: AdminSafeSpaceFlagDTO;
  onResolve: (flag: AdminSafeSpaceFlagDTO) => void;
}) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>
            {flag.listingName ?? t("safety:governance.flags.unknownSpace")}
          </span>
          <AdminChip tone="coral">
            {t(FLAG_REASON_LABEL_KEY[flag.reasonCode])}
          </AdminChip>
          {flag.state === "resolved" && flag.resolution && (
            <AdminChip tone={flag.resolution === "upheld" ? "jade" : "ghost"}>
              {t(`safety:governance.flags.resolution.${flag.resolution}`)}
            </AdminChip>
          )}
        </div>
        <div className={styles.rowMeta}>
          {formatDate(flag.createdAt, locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        {flag.detail && <p className={styles.rowQuote}>{flag.detail}</p>}
        {flag.resolutionNote && (
          <p className={styles.rowQuote}>{flag.resolutionNote}</p>
        )}
      </div>

      {flag.state === "open" && (
        <div className={styles.rowChips}>
          <Button variant="ghost" size="md" onClick={() => onResolve(flag)}>
            {t("safety:governance.flags.reviewCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
