import { useEffect, useId } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { FiCreditCard } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, Select, tabPanelProps } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioSalesPendingCount } from "./api/useStudioSalesPendingCount";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioNoPersonaState } from "./StudioNoPersonaState";
import { StudioPaymentsInbox } from "./StudioPaymentsInbox";
import { StudioPaymentsSales } from "./StudioPaymentsSales";
import { STUDIO_PAYMENTS_TABS, type StudioPaymentsTab } from "./studioPaths";
import { StudioTablist } from "./StudioTablist";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import badgeStyles from "./StudioCredits.module.css";
import css from "./StudioPayments.module.css";

const isPaymentsTab = (value: string | null): value is StudioPaymentsTab =>
  STUDIO_PAYMENTS_TABS.some((tab) => tab === value);

/** The To confirm count beside the tab, in the shared pill style. It springs
 *  in and fades out like the credits badge. */
function StudioPaymentsTabBadge({ count }: { count: number }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="payments-to-confirm"
          className={badgeStyles.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <span aria-hidden>{count}</span>
          <span className="visuallyHidden">
            {", "}
            <span>{t("studio:purchase.inbox.badge", { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** /studio/payments: the payments members say they made to one of the
 *  member's artist pages (To confirm, oldest first) and the confirmed sales
 *  with their totals. The persona comes from `?persona=`, else the first one
 *  with a payment waiting, else the first, with a line naming it when the
 *  `?persona=` id is none of theirs; the tab from `?tab=`. Amounts show
 *  here only, to the persona's own members. */
export function StudioPaymentsPage() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:purchase.inbox.pageTitle"));
  const idPrefix = useId();
  const selectId = useId();
  const { uploadablePersonas } = useStudioAccess();
  const { countFor } = useStudioSalesPendingCount();
  const [searchParams, setSearchParams] = useSearchParams();
  const personaParam = searchParams.get("persona");
  const tabParam = searchParams.get("tab");
  const tab: StudioPaymentsTab = isPaymentsTab(tabParam) ? tabParam : "confirm";
  const persona: StudioArtistRefView | null =
    uploadablePersonas.find((candidate) => candidate.id === personaParam) ??
    uploadablePersonas.find((candidate) => countFor(candidate.id) > 0) ??
    uploadablePersonas[0] ??
    null;
  const personaId = persona?.id ?? null;
  // A `?persona=` that names none of the member's artist pages says which
  // page shows in its place.
  const isPersonaParamUnknown =
    personaParam !== null &&
    persona !== null &&
    !uploadablePersonas.some((candidate) => candidate.id === personaParam);
  // Once the pending count has answered, the persona picked without a
  // `?persona=` is written into the URL, so confirming its last claim never
  // moves the page to another persona.
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const pendingCountKey = studioKeys.salesPendingCount(demoMode);
  const isPendingCountFetching =
    useIsFetching({ queryKey: pendingCountKey }) > 0;
  const pendingCountStatus = queryClient.getQueryState(pendingCountKey)?.status;
  const shouldPinPersona =
    personaParam === null &&
    personaId !== null &&
    !isPendingCountFetching &&
    (pendingCountStatus === "success" || pendingCountStatus === "error");
  useEffect(() => {
    if (!shouldPinPersona || personaId === null) return;
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        params.set("persona", personaId);
        return params;
      },
      { replace: true },
    );
  }, [shouldPinPersona, personaId, setSearchParams]);

  function updateParams(next: { persona?: string; tab?: StudioPaymentsTab }) {
    const params = new URLSearchParams(searchParams);
    if (next.persona) params.set("persona", next.persona);
    if (next.tab === "sales") params.set("tab", "sales");
    else if (next.tab === "confirm") params.delete("tab");
    setSearchParams(params, { replace: true });
  }

  return (
    <StudioCreatorShell persona={persona}>
      <div className={css.body}>
        <header className={css.head}>
          <div className={css.eyebrow}>
            {t("studio:purchase.inbox.eyebrow")}
          </div>
          <h1 className={css.title}>
            <Translation
              i18nKey="studio:purchase.inbox.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={css.dek}>{t("studio:purchase.inbox.dek")}</p>
          <Collapse isOpen={persona !== null && uploadablePersonas.length > 1}>
            {persona && (
              <div className={css.personaField}>
                <label htmlFor={selectId}>
                  {t("studio:purchase.inbox.personaLabel")}
                </label>
                <Select
                  id={selectId}
                  className={css.select}
                  label={t("studio:purchase.inbox.personaLabel")}
                  size="sm"
                  searchable={false}
                  value={persona.id}
                  options={uploadablePersonas.map((candidate) => ({
                    value: candidate.id,
                    label: candidate.name,
                  }))}
                  onChange={(subprofileId) => {
                    if (subprofileId) updateParams({ persona: subprofileId });
                  }}
                />
              </div>
            )}
          </Collapse>
        </header>
        <Collapse isOpen={persona === null}>
          <StudioNoPersonaState icon={<FiCreditCard />} />
        </Collapse>
        <Collapse isOpen={isPersonaParamUnknown}>
          <p className={css.personaNote}>
            {t("studio:purchase.inbox.unknownPersona", {
              name: persona?.name ?? "",
            })}
          </p>
        </Collapse>
        <Collapse isOpen={persona !== null}>
          {persona && (
            <StudioTablist
              tabs={[
                {
                  id: "confirm",
                  labelKey: "studio:purchase.inbox.tab.confirm",
                  badge: (
                    <StudioPaymentsTabBadge count={countFor(persona.id)} />
                  ),
                },
                { id: "sales", labelKey: "studio:purchase.inbox.tab.sales" },
              ]}
              activeId={tab}
              idPrefix={idPrefix}
              label={t("studio:purchase.inbox.tabsLabel", {
                name: persona.name,
              })}
              onChange={(nextTab) => updateParams({ tab: nextTab })}
            />
          )}
          {persona && (
            <Collapse isOpen={tab === "confirm"}>
              <div
                {...tabPanelProps(idPrefix, "confirm")}
                className={css.panel}
              >
                <StudioPaymentsInbox key={persona.id} persona={persona} />
              </div>
            </Collapse>
          )}
          {persona && (
            <Collapse isOpen={tab === "sales"}>
              <div {...tabPanelProps(idPrefix, "sales")} className={css.panel}>
                <StudioPaymentsSales key={persona.id} persona={persona} />
              </div>
            </Collapse>
          )}
        </Collapse>
      </div>
    </StudioCreatorShell>
  );
}
