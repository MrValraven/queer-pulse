import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending } from "./ModalKit";
import { useEmployerAffiliation } from "../../app/providers/EmployerAffiliationProvider";
import { COMPANY_PROFILES } from "./companies.data";
import { AFFILIATION_ROLES } from "./postJob.data";
import styles from "./PostJobPage.module.css";

const COMPANIES = Object.values(COMPANY_PROFILES);

export function AffiliateCompanyModal({
  initialSlug,
  onClose,
  onAffiliated,
}: {
  initialSlug?: string;
  onClose: () => void;
  onAffiliated: () => void;
}) {
  const { affiliate } = useEmployerAffiliation();
  const [slug, setSlug] = useState(
    initialSlug && COMPANY_PROFILES[initialSlug] ? initialSlug : "",
  );
  const [role, setRole] = useState<string>(
    AFFILIATION_ROLES[0] ?? "Team member",
  );
  const [verifying, setVerifying] = useState(false);

  function confirm() {
    if (!slug) return;
    setVerifying(true);
    // Simulate the verification step, then grant access (create-it-live).
    window.setTimeout(() => {
      affiliate(slug, role);
      onAffiliated();
    }, 900);
  }

  return (
    <ModalShell onClose={onClose} ariaLabel="Affiliate your company">
      <div className={styles.eyebrow}>Employer access</div>
      <h2 className={styles.mlTitle} style={{ fontSize: 24 }}>
        Which company are you{" "}
        <em style={{ color: "var(--accent)" }}>posting for?</em>
      </h2>
      <p className={styles.cardSub}>
        Pick the organisation you&apos;re authorised to hire for. We confirm
        employer affiliations to keep the board trustworthy.
      </p>

      <div className={styles.affList}>
        {COMPANIES.map((c) => {
          const on = c.slug === slug;
          return (
            <button
              key={c.slug}
              type="button"
              className={[styles.affItem, on && styles.affItemSel]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSlug(c.slug)}
            >
              <span className={styles.affLogo}>{c.logo}</span>
              <span>
                <span className={styles.affName}>{c.nameText}</span>
                <span className={styles.affMeta}>
                  {c.badges[0]?.label ?? "Employer"}
                </span>
              </span>
              <span className={styles.affRadio} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className={styles.field} style={{ marginTop: 16 }}>
        <div className={styles.label}>Your role there</div>
        <select
          className={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {AFFILIATION_ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className={styles.stepNav}>
        <button type="button" className={styles.back} onClick={onClose}>
          Cancel
        </button>
        <span className={styles.spacerFlex} />
        <Button
          variant="primary"
          size="lg"
          disabled={!slug || verifying}
          onClick={confirm}
        >
          {verifying ? <Sending label="Verifying…" /> : "Confirm & continue"}
        </Button>
      </div>
    </ModalShell>
  );
}
