import { useState } from "react";
import { FiBriefcase, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AffiliateCompanyModal } from "./AffiliateCompanyModal";
import styles from "./PostJobPage.module.css";

const POINT_KEYS = [
  "economy:postJob.gate.point1",
  "economy:postJob.gate.point2",
  "economy:postJob.gate.point3",
];

export function PostJobGate({
  initialCompany,
  onAffiliated,
}: {
  initialCompany?: string;
  onAffiliated: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.gate}>
        <div className={styles.gateIcon} aria-hidden>
          <FiBriefcase size={26} />
        </div>
        <h1 className={styles.gateTitle}>
          <Translation
            i18nKey="economy:postJob.gate.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.gateSub}>{t("economy:postJob.gate.sub")}</p>
        <div className={styles.gateActions}>
          <Button variant="jade" size="lg" onClick={() => setOpen(true)}>
            {t("economy:postJob.gate.affiliateCta")}
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            onClick={() => void navigate(routes.jobs)}
          >
            {t("economy:postJob.gate.backCta")}
          </Button>
        </div>
        <div className={styles.gatePoints}>
          {POINT_KEYS.map((key) => (
            <div key={key} className={styles.gatePoint}>
              <FiCheck size={16} aria-hidden />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <AffiliateCompanyModal
          initialSlug={initialCompany}
          onClose={() => setOpen(false)}
          onAffiliated={() => {
            setOpen(false);
            onAffiliated();
          }}
        />
      )}
    </>
  );
}
