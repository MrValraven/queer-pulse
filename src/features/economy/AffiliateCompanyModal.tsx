import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ModalShell, Sending } from "./ModalKit";
import { useEmployerAffiliationActions } from "./api/useEmployerAffiliation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { COMPANY_PROFILES } from "./companies.data";
import { useCompanies } from "./api/useCompanies";
import { useCreateCompany } from "./api/useCompanyMutations";
import { AFFILIATION_ROLES } from "./postJob.data";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PostJobPage.module.css";

interface PickerCompany {
  slug: string;
  nameText: string;
  logo: string;
  badge: string;
}

interface NewCompany {
  name: string;
  tagline: string;
  about: string;
}

/** Live-only block to add a company that isn't in the directory yet. */
function AddCompanyBlock({
  adding,
  setAdding,
  draft,
  setDraft,
}: {
  adding: boolean;
  setAdding: (b: boolean) => void;
  draft: NewCompany;
  setDraft: (patch: Partial<NewCompany>) => void;
}) {
  const { t } = useTranslation();
  if (!adding) {
    return (
      <button
        type="button"
        className={styles.affItem}
        style={{ marginTop: 12 }}
        onClick={() => setAdding(true)}
      >
        <span className={styles.affLogo} aria-hidden>
          <FiPlus />
        </span>
        <span>
          <span className={styles.affName}>
            {t("economy:affiliateCompanyModal.notListed.name")}
          </span>
          <span className={styles.affMeta}>
            {t("economy:affiliateCompanyModal.notListed.meta")}
          </span>
        </span>
      </button>
    );
  }
  return (
    <>
      <div className={styles.field} style={{ marginTop: 16 }}>
        <div className={styles.label}>
          {t("economy:affiliateCompanyModal.addCompany.nameLabel")}
        </div>
        <input
          className={styles.input}
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ name: e.target.value })}
          placeholder={t(
            "economy:affiliateCompanyModal.addCompany.namePlaceholder",
          )}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.label}>
          {t("economy:affiliateCompanyModal.addCompany.taglineLabel")}
        </div>
        <input
          className={styles.input}
          type="text"
          value={draft.tagline}
          onChange={(e) => setDraft({ tagline: e.target.value })}
          placeholder={t(
            "economy:affiliateCompanyModal.addCompany.taglinePlaceholder",
          )}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.label}>
          {t("economy:affiliateCompanyModal.addCompany.aboutLabel")}
        </div>
        <textarea
          className={styles.textarea}
          rows={3}
          value={draft.about}
          onChange={(e) => setDraft({ about: e.target.value })}
          placeholder={t(
            "economy:affiliateCompanyModal.addCompany.aboutPlaceholder",
          )}
        />
      </div>
      <button
        type="button"
        className={styles.back}
        onClick={() => setAdding(false)}
      >
        {t("economy:affiliateCompanyModal.addCompany.pickExisting")}
      </button>
    </>
  );
}

export function AffiliateCompanyModal({
  initialSlug,
  onClose,
  onAffiliated,
}: {
  initialSlug?: string;
  onClose: () => void;
  onAffiliated: () => void;
}) {
  const { t } = useTranslation();
  const { affiliate } = useEmployerAffiliationActions();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { items: liveCompanies } = useCompanies();
  const createCompany = useCreateCompany();

  // Demo shows the mock profiles (unchanged); live shows API companies.
  const companies: PickerCompany[] = demoMode
    ? Object.values(COMPANY_PROFILES).map((c) => ({
        slug: c.slug,
        nameText: c.nameText,
        logo: c.logo,
        badge: c.badges[0]?.label ?? "Employer",
      }))
    : liveCompanies
        .filter((c) => c.slug)
        .map((c) => ({
          slug: c.slug as string,
          nameText: c.name,
          logo: c.logo,
          badge: c.badge,
        }));

  const [slug, setSlug] = useState(
    initialSlug && companies.some((c) => c.slug === initialSlug)
      ? initialSlug
      : "",
  );
  const [role, setRole] = useState<string>(
    AFFILIATION_ROLES[0]?.value ?? "Team member",
  );
  const [verifying, setVerifying] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<NewCompany>({
    name: "",
    tagline: "",
    about: "",
  });

  const canCreate =
    draft.name.trim() !== "" &&
    draft.tagline.trim() !== "" &&
    draft.about.trim() !== "";
  const busy = verifying || createCompany.isPending;

  async function confirm() {
    if (adding) {
      if (!canCreate) return;
      try {
        const res = await createCompany.mutateAsync({
          nameText: draft.name.trim(),
          tagline: draft.tagline.trim(),
          about: draft.about.trim(),
        });
        if (res?.slug) {
          affiliate(res.slug, role);
          onAffiliated();
        }
      } catch {
        showToast(t("economy:affiliateCompanyModal.createErrorToast"), "error");
      }
      return;
    }
    if (!slug) return;
    setVerifying(true);
    // Simulate the verification step, then grant access (create-it-live).
    window.setTimeout(() => {
      affiliate(slug, role);
      onAffiliated();
    }, 900);
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:affiliateCompanyModal.ariaLabel")}
    >
      <div className={styles.eyebrow}>
        {t("economy:affiliateCompanyModal.eyebrow")}
      </div>
      <h2 className={styles.mlTitle} style={{ fontSize: 24 }}>
        <Translation
          i18nKey="economy:affiliateCompanyModal.title"
          components={{ em: <em style={{ color: "var(--accent)" }} /> }}
        />
      </h2>
      <p className={styles.cardSub}>{t("economy:affiliateCompanyModal.sub")}</p>

      {!adding && (
        <div className={styles.affList}>
          {companies.map((c) => {
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
                  <span className={styles.affMeta}>{c.badge}</span>
                </span>
                <span className={styles.affRadio} aria-hidden />
              </button>
            );
          })}
        </div>
      )}

      {!demoMode && (
        <AddCompanyBlock
          adding={adding}
          setAdding={setAdding}
          draft={draft}
          setDraft={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        />
      )}

      <div className={styles.field} style={{ marginTop: 16 }}>
        <div className={styles.label}>
          {t("economy:affiliateCompanyModal.roleLabel")}
        </div>
        <select
          className={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {AFFILIATION_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {t(r.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.stepNav}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:affiliateCompanyModal.cancel")}
        </button>
        <span className={styles.spacerFlex} />
        <Button
          variant="primary"
          size="lg"
          disabled={busy || (adding ? !canCreate : !slug)}
          onClick={confirm}
        >
          {busy ? (
            <Sending
              label={
                adding
                  ? t("economy:affiliateCompanyModal.creating")
                  : t("economy:affiliateCompanyModal.verifying")
              }
            />
          ) : adding ? (
            t("economy:affiliateCompanyModal.createCta")
          ) : (
            t("economy:affiliateCompanyModal.confirmCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
