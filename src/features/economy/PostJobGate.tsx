import { useState } from "react";
import { FiBriefcase, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { AffiliateCompanyModal } from "./AffiliateCompanyModal";
import styles from "./PostJobPage.module.css";

const POINTS = [
  "We confirm employers are genuinely queer-inclusive, not rainbow-washing.",
  "Roles post as your verified company, with its logo and badge.",
  "No placement fees — this is a community board, not a marketplace.",
];

export function PostJobGate({
  initialCompany,
  onAffiliated,
}: {
  initialCompany?: string;
  onAffiliated: () => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.gate}>
        <div className={styles.gateIcon} aria-hidden>
          <FiBriefcase size={26} />
        </div>
        <h1 className={styles.gateTitle}>
          Posting a role is for <em>verified employers</em>
        </h1>
        <p className={styles.gateSub}>
          To keep the job board trustworthy, only members affiliated with a
          company can post roles. Affiliate yours to continue — it takes a
          moment.
        </p>
        <div className={styles.gateActions}>
          <Button variant="jade" size="lg" onClick={() => setOpen(true)}>
            Affiliate your company
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            onClick={() => navigate(routes.jobs)}
          >
            Back to the board
          </Button>
        </div>
        <div className={styles.gatePoints}>
          {POINTS.map((p) => (
            <div key={p} className={styles.gatePoint}>
              <FiCheck size={16} aria-hidden />
              <span>{p}</span>
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
