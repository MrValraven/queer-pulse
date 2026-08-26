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
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useSubmitDsar, useListDsar } from "../settings/api/useDsar";
import type { DsarArticle, DsarStatus } from "../settings/api/account.api";

const PRIVACY = routes.privacy;

interface Right {
  art: number;
  label: ReactNode;
  description: string;
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
      description: t("marketing:dsar.rights.access.desc"),
      formTitle: t("marketing:dsar.rights.access.formTitle"),
      formSub: t("marketing:dsar.rights.access.formSub"),
    },
    {
      art: 16,
      label: <>{t("marketing:dsar.rights.rectification.label")}</>,
      description: t("marketing:dsar.rights.rectification.desc"),
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
      description: t("marketing:dsar.rights.erasure.desc"),
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
      description: t("marketing:dsar.rights.objection.desc"),
      formTitle: t("marketing:dsar.rights.objection.formTitle"),
      formSub: t("marketing:dsar.rights.objection.formSub"),
    },
  ];
}

/** i18n Pattern A — plain-string chrome, resolved via `t()` at render. */
const SCOPES = [
  {
    id: "profile",
    bKey: "marketing:dsar.scopes.profile.b",
    sKey: "marketing:dsar.scopes.profile.s",
    checked: true,
  },
  {
    id: "connections",
    bKey: "marketing:dsar.scopes.connections.b",
    sKey: "marketing:dsar.scopes.connections.s",
  },
  {
    id: "activity",
    bKey: "marketing:dsar.scopes.activity.b",
    sKey: "marketing:dsar.scopes.activity.s",
  },
  {
    // Was "billing". There is no member billing or payment history anywhere in
    // the backend, so the scope now names what the account actually holds. The
    // id travels to `POST /account/dsar` as a free string, so renaming it only
    // changes what a reviewing human reads on the request.
    id: "membership",
    bKey: "marketing:dsar.scopes.membership.b",
    sKey: "marketing:dsar.scopes.membership.s",
  },
  {
    id: "moderation",
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
          <p>{r.description}</p>
        </button>
      ))}
    </div>
  );
}

/** The main request form: right summary, account, scope, context, submit. */
function DsarRequestForm({ right }: { right: Right }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const submitDsarRequest = useSubmitDsar();
  const [scopes, setScopes] = useState<boolean[]>(
    SCOPES.map((scope) => !!scope.checked),
  );
  const [details, setDetails] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // The account a live request is filed against IS the signed-in session — the
  // backend derives the subject from the cookie and the page never sends an
  // address. Demo has no real session, so it shows the prototype persona; live
  // shows the actual account email and never lets the demo identity leak in.
  const accountValue = demoMode
    ? "tomas@example.com · Tomás Mendes"
    : (user?.email ?? "");

  const detailsValid = details.trim().length > 0;

  const handleSubmit = async () => {
    if (!detailsValid || submitting) return;
    const selectedScopes = SCOPES.filter((_, index) => scopes[index]).map(
      (scope) => scope.id,
    );
    setSubmitting(true);
    try {
      const created = await submitDsarRequest({
        article: right.art as DsarArticle,
        scopes: selectedScopes,
        details: details.trim(),
        context: context.trim() || undefined,
      });
      showToast(
        t("marketing:dsar.toast.submitted", { ref: created.reference }),
        "success",
        3500,
      );
    } catch {
      // Never fake success on failure: keep the form exactly as the member left
      // it and say plainly that nothing was recorded.
      showToast(t("marketing:dsar.toast.submitError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      <h2>
        {t("marketing:dsar.requestLabel")} <em>{right.formTitle}</em>
      </h2>
      <p className={styles.formSub}>{right.formSub}</p>

      <FormField label={t("marketing:dsar.form.accountLabel")}>
        <input
          type="text"
          value={accountValue}
          readOnly
          style={{ opacity: 0.7 }}
        />
      </FormField>

      <FormField
        label={t("marketing:dsar.form.whatChanged.label")}
        helper={t("marketing:dsar.form.whatChanged.helper")}
      >
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
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
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t("marketing:dsar.form.contextPlaceholder")}
        />
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
        <Button
          variant="primary"
          type="submit"
          disabled={!detailsValid || submitting}
        >
          {submitting
            ? t("marketing:dsar.actions.submitting")
            : t("marketing:dsar.actions.submit")}
        </Button>
      </div>
    </form>
  );
}

/** Which right each DSAR was filed under, resolved from the article number the
 * backend stores — the live rows carry no free-text label, so the label is
 * always derived here rather than sent. */
const ARTICLE_TITLE_KEY: Record<DsarArticle, string> = {
  15: "marketing:dsar.rights.access.formTitle",
  16: "marketing:dsar.rights.rectification.formTitle",
  17: "marketing:dsar.rights.erasure.formTitle",
  21: "marketing:dsar.rights.objection.formTitle",
};

const STATUS_LABEL_KEY: Record<DsarStatus, string> = {
  received: "marketing:dsar.past.status.received",
  in_review: "marketing:dsar.past.status.inReview",
  resolved: "marketing:dsar.past.resolved",
  rejected: "marketing:dsar.past.status.rejected",
};

/**
 * The member's own DSAR history. Live mode renders the real
 * `GET /account/dsar` rows (references, statuses, dates the backend recorded);
 * demo renders the colocated sample. A live member never sees fabricated
 * reference numbers as their history, and the same renderer covers both modes
 * because demo and live share the `DsarRequest` shape. Loading / empty / error
 * states are spoken plainly, matching the honest-failure stance of the form. */
function PastRequests() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { requests, loading, failed } = useListDsar();

  const statusClass: Record<DsarStatus, string | undefined> = {
    received: styles.statusPending,
    in_review: styles.statusPending,
    resolved: styles.statusDone,
    rejected: styles.statusRejected,
  };

  return (
    <>
      <div className={styles.pastH}>{t("marketing:dsar.past.heading")}</div>

      {loading && (
        <div className={styles.pastNote}>
          {t("marketing:dsar.past.loading")}
        </div>
      )}
      {failed && (
        <div className={styles.pastNote}>{t("marketing:dsar.past.error")}</div>
      )}
      {!loading && !failed && requests.length === 0 && (
        <div className={styles.pastNote}>{t("marketing:dsar.past.empty")}</div>
      )}

      {!loading &&
        !failed &&
        requests.map((request) => (
          <div key={request.reference} className={styles.pastRow}>
            <span className={styles.num}>{request.reference}</span>
            <span>
              <b>{t(ARTICLE_TITLE_KEY[request.article])}</b> ·{" "}
              {t("marketing:dsar.past.submitted", {
                date: fmt.date(new Date(request.submittedAt), {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              })}
              {request.respondedAt && (
                <>
                  {" · "}
                  {t("marketing:dsar.past.responded", {
                    date: fmt.date(new Date(request.respondedAt), {
                      day: "numeric",
                      month: "short",
                    }),
                  })}
                </>
              )}
            </span>
            <span className={`${styles.status} ${statusClass[request.status]}`}>
              {t(STATUS_LABEL_KEY[request.status])}
            </span>
          </div>
        ))}
    </>
  );
}

export function DsarPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
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

        {/* History is per-account: shown in demo, or to a signed-in member in
            live. A logged-out live visitor has no history to fetch (and the
            endpoint is auth-gated), so the section is simply omitted for them. */}
        {(demoMode || user) && <PastRequests />}
      </div>
    </PageShell>
  );
}
