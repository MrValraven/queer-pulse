import { FiUsers } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminModal } from "./ui";
import { routes } from "../../app/routeMap";
import { CARE_DIFF, type DiffLine } from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

const SIGN: Record<DiffLine["kind"], string> = {
  ctx: " ",
  removed: "−",
  added: "+",
};

export function AdminGovernanceDiffModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <AdminModal
      wide
      eyebrow={t("admin:governance.diff.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.diff.title"
          components={{ em: <em /> }}
        />
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:governance.diff.closeCta")}
          </Button>
          <Button variant="primary" to={routes.governance} onClick={onClose}>
            {t("admin:governance.diff.readFullCta")} →
          </Button>
        </>
      }
    >
      <p className={styles.diffIntro}>
        <strong>{t("admin:governance.diff.introTitle")}</strong>{" "}
        {t("admin:governance.diff.introDate")}
      </p>

      {/* CARE_DIFF line text: versioned policy-change content, mirrors an
          API-fetched diff in live mode — left in English per scope rule. */}
      <div className={styles.diff} role="list">
        {CARE_DIFF.map((line, i) => (
          <div
            key={i}
            role="listitem"
            className={[styles.diffLine, styles[`diff_${line.kind}`]].join(" ")}
          >
            <span className={styles.diffSign} aria-hidden>
              {SIGN[line.kind]}
            </span>
            <span className={styles.diffText}>{line.text}</span>
          </div>
        ))}
      </div>

      <p className={styles.diffNote}>
        <FiUsers className={styles.diffNoteIco} aria-hidden />
        {t("admin:governance.diff.note")}
      </p>
    </AdminModal>
  );
}
