import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import styles from "./DsarPage.module.css";
import { Button, FormField, HubBackLink } from "../../shared/components/ui";

const PRIVACY = routes.privacy;

interface Right {
  art: number;
  label: ReactNode;
  desc: string;
  formTitle: string;
  formSub: string;
}

/**
 * i18n Pattern B — `label` carries an inline `<em>` run, so this data must be
 * a function of `t` rather than a plain-string Pattern A array.
 */
function buildRights(t: TFunction): Right[] {
  return [
    {
      art: 15,
      label: (
        <Translation
          i18nKey="marketing:dsar.rights.access.label"
          components={{ em: <em /> }}
        />
      ),
      desc: t("marketing:dsar.rights.access.desc"),
      formTitle: t("marketing:dsar.rights.access.formTitle"),
      formSub: t("marketing:dsar.rights.access.formSub"),
    },
    {
      art: 16,
      label: <>{t("marketing:dsar.rights.rectification.label")}</>,
      desc: t("marketing:dsar.rights.rectification.desc"),
      formTitle: t("marketing:dsar.rights.rectification.formTitle"),
      formSub: t("marketing:dsar.rights.rectification.formSub"),
    },
    {
      art: 17,
      label: (
        <Translation
          i18nKey="marketing:dsar.rights.erasure.label"
          components={{ em: <em /> }}
        />
      ),
      desc: t("marketing:dsar.rights.erasure.desc"),
      formTitle: t("marketing:dsar.rights.erasure.formTitle"),
      formSub: t("marketing:dsar.rights.erasure.formSub"),
    },
    {
      art: 21,
      label: (
        <Translation
          i18nKey="marketing:dsar.rights.objection.label"
          components={{ em: <em /> }}
        />
      ),
      desc: t("marketing:dsar.rights.objection.desc"),
      formTitle: t("marketing:dsar.rights.objection.formTitle"),
      formSub: t("marketing:dsar.rights.objection.formSub"),
    },
  ];
}

/** i18n Pattern A — plain-string chrome, resolved via `t()` at render. */
const SCOPES = [
  {
    bKey: "marketing:dsar.scopes.profile.b",
    sKey: "marketing:dsar.scopes.profile.s",
    checked: true,
  },
  {
    bKey: "marketing:dsar.scopes.connections.b",
    sKey: "marketing:dsar.scopes.connections.s",
  },
  {
    bKey: "marketing:dsar.scopes.activity.b",
    sKey: "marketing:dsar.scopes.activity.s",
  },
  {
    bKey: "marketing:dsar.scopes.billing.b",
    sKey: "marketing:dsar.scopes.billing.s",
  },
  {
    bKey: "marketing:dsar.scopes.moderation.b",
    sKey: "marketing:dsar.scopes.moderation.s",
  },
];

/** The "which right?" picker grid. */
function RightPicker({
  rights,
  art,
  onSelect,
}: {
  rights: Right[];
  art: number;
  onSelect: (art: number) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <div className={styles.rightGrid}>
      {rights.map((r) => (
        <button
          key={r.art}
          type="button"
          className={[
            styles.rightCard,
            art === r.art && styles.rightCardSelected,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            onSelect(r.art);
            showToast(
              t("marketing:dsar.toast.showingForm", { article: r.art }),
              "info",
            );
          }}
        >
          <div className={styles.art}>
            {t("marketing:dsar.artPrefix", { number: r.art })}
          </div>
          <h3>{r.label}</h3>
          <p>{r.desc}</p>
        </button>
      ))}
    </div>
  );
}

/** The main request form: right summary, account, scope, context, submit. */
function DsarRequestForm({ right }: { right: Right }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [scopes, setScopes] = useState<boolean[]>(
    SCOPES.map((scope) => !!scope.checked),
  );

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        showToast(
          t("marketing:dsar.toast.submitted", { ref: "QP-DSAR-2026-0019" }),
          "success",
          3500,
        );
      }}
    >
      <h2>
        {t("marketing:dsar.requestLabel")} <em>{right.formTitle}</em>
      </h2>
      <p className={styles.formSub}>{right.formSub}</p>

      <FormField label={t("marketing:dsar.form.accountLabel")}>
        <input
          type="text"
          value="tomas@example.com · Tomás Mendes"
          readOnly
          style={{ opacity: 0.7 }}
        />
      </FormField>

      <FormField
        label={t("marketing:dsar.form.whatChanged.label")}
        helper={t("marketing:dsar.form.whatChanged.helper")}
      >
        <textarea
          placeholder={t("marketing:dsar.form.whatChanged.placeholder")}
        />
      </FormField>

      <div className={styles.field}>
        {/* A caption for a set of checkboxes, not a label for one control:
            a bare <label> with no control names nothing. */}
        <div className={styles.groupLabel} id="dsar-scope-label">
          {t("marketing:dsar.form.scopeLabel")}
        </div>
        <div
          className={styles.scopeList}
          role="group"
          aria-labelledby="dsar-scope-label"
        >
          {SCOPES.map((scope, index) => (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control -- the label's text (<b> + <span>) sits one level deeper than the rule's default depth of 2; the accessible name is computed correctly from the subtree.
            <label
              key={scope.bKey}
              className={[
                styles.scopeRow,
                scopes[index] && styles.scopeRowChecked,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={scopes[index]}
                onChange={() =>
                  setScopes((prev) =>
                    prev.map((value, i) => (i === index ? !value : value)),
                  )
                }
              />
              <div>
                <b>{t(scope.bKey)}</b>
                <span>{t(scope.sKey)}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* There is deliberately no file upload here. The field that used to sit
          at this point was an `<input type="file" multiple>` with no onChange,
          no ref and no state — nothing it accepted was ever read, let alone
          transmitted — under copy promising a data subject that "documents are
          deleted after verification". Promising a retention guarantee for files
          we never receive is a false statement on a GDPR page, so both the
          input and the claim are gone rather than made cosmetically honest.
          If supporting documents are ever accepted, they need a real upload
          endpoint and a real retention policy before any copy describes one. */}

      <FormField label={t("marketing:dsar.form.contextLabel")}>
        <textarea placeholder={t("marketing:dsar.form.contextPlaceholder")} />
      </FormField>

      <div className={styles.legalStrip}>
        <Translation
          i18nKey="marketing:dsar.legalStrip"
          components={{ b: <b />, link: <Link to={`${PRIVACY}#retention`} /> }}
        />
      </div>

      <div className={styles.actions}>
        <div className="info">
          <Translation
            i18nKey="marketing:dsar.actions.info"
            components={{ b: <b /> }}
          />
        </div>
        <Button variant="primary" type="submit">
          {t("marketing:dsar.actions.submit")}
        </Button>
      </div>
    </form>
  );
}

/** The member's past DSAR requests. Record specifics (ref, dates, which
 * right) are the member's own request history — in live mode this is fetched
 * per-account, so it stays untranslated content; only the surrounding
 * "submitted"/"responded"/"Resolved" chrome words are translated. */
function PastRequests() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.pastH}>{t("marketing:dsar.past.heading")}</div>
      <div className={styles.pastRow}>
        <span className={styles.num}>QP-DSAR-2026-018</span>
        <span>
          <b>{t("marketing:dsar.rights.access.formTitle")}</b> ·{" "}
          {t("marketing:dsar.past.submitted", { date: "14 Mar 2026" })} ·{" "}
          {t("marketing:dsar.past.respondedWithDuration", {
            date: "17 Mar",
            duration: "3 days",
          })}
        </span>
        <span className={`${styles.status} ${styles.statusDone}`}>
          {t("marketing:dsar.past.resolved")}
        </span>
      </div>
      <div className={styles.pastRow}>
        <span className={styles.num}>QP-DSAR-2025-184</span>
        <span>
          <b>{t("marketing:dsar.past.objectAnalytics")}</b> ·{" "}
          {t("marketing:dsar.past.submitted", { date: "11 Nov 2025" })} ·{" "}
          {t("marketing:dsar.past.responded", { date: "13 Nov" })}
        </span>
        <span className={`${styles.status} ${styles.statusDone}`}>
          {t("marketing:dsar.past.resolved")}
        </span>
      </div>
    </>
  );
}

export function DsarPage() {
  const { t } = useTranslation();
  const [art, setArt] = useState(16);
  const rights = buildRights(t);
  const right = rights.find((r) => r.art === art)!;

  return (
    <PageShell>
      <div className={styles.page}>
        <HubBackLink
          to={routes.privacy}
          label={t("marketing:dsar.backToPrivacyLabel")}
        />
        <div className={styles.eyebrow}>{t("marketing:dsar.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="marketing:dsar.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="marketing:dsar.lead"
            components={{ b: <b />, em: <em /> }}
          />
        </p>

        <div className={styles.gdprStrip}>
          <Translation
            i18nKey="marketing:dsar.gdprStrip"
            components={{ b: <b /> }}
          />
        </div>

        <div className={styles.rightLabel}>
          {t("marketing:dsar.rightLabel")}
        </div>
        <RightPicker rights={rights} art={art} onSelect={setArt} />

        <DsarRequestForm right={right} />

        <PastRequests />
      </div>
    </PageShell>
  );
}
