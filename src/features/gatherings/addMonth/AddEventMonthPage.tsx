import { useState } from "react";
import { PageShell } from "../../../shared/components/layout";
import { Collapse, Eyebrow } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ActionStrip } from "../ActionStrip";
import { draftAgeText } from "../useCreateGatheringDraft";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import { AddEventMonthNoAccess } from "./AddEventMonthNoAccess";
import styles from "./AddEventMonthPage.module.css";
import { AddMonthDatesSection } from "./AddMonthDatesSection";
import { AddMonthFailurePanel } from "./AddMonthFailurePanel";
import {
  ADD_MONTH_PUBLISH_HEADING_ID,
  AddMonthPublishSection,
} from "./AddMonthPublishSection";
import { AddMonthResults } from "./AddMonthResults";
import { AddMonthRowsSection } from "./AddMonthRowsSection";
import { AddMonthTemplateSection } from "./AddMonthTemplateSection";
import {
  useAddEventMonthPage,
  type AddEventMonthPageModel,
} from "./useAddEventMonthPage";
import {
  ADD_MONTH_TEMPLATE_HEADING_ID,
  focusElementById,
  useAddMonthPublish,
} from "./useAddMonthPublish";
import { useCanAddEventMonth } from "./useCanAddEventMonth";

type AddMonthPublishing = ReturnType<typeof useAddMonthPublish>;

/** The latest non-null value, held while its panel folds away so the
 *  content stays on screen until the fold ends. */
function useLastPresent<Value>(value: Value | null): Value | null {
  const [heldValue, setHeldValue] = useState(value);
  if (value !== null && value !== heldValue) setHeldValue(value);
  return value ?? heldValue;
}

/** Moves focus to the first section once the control that had it is gone. */
function focusTemplateHeadingSoon() {
  window.setTimeout(() => focusElementById(ADD_MONTH_TEMPLATE_HEADING_ID), 0);
}

function AddEventMonthHeader() {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <Eyebrow className={styles.eyebrow}>
        {t("gatherings:addMonth.page.eyebrow")}
      </Eyebrow>
      <h1 className={styles.title}>{t("gatherings:addMonth.page.title")}</h1>
      <p className={styles.lede}>{t("gatherings:addMonth.page.lede")}</p>
    </header>
  );
}

/** "Pick up your month where you left off?" while a saved month waits. */
function AddMonthDraftOfferStrip({
  draft,
}: {
  draft: AddEventMonthPageModel["draft"];
}) {
  const { t } = useTranslation();
  const offer = useLastPresent(draft.offer);
  return (
    <Collapse isOpen={draft.offer !== null}>
      {offer && (
        <div className={styles.draftOffer}>
          <ActionStrip
            title={t("gatherings:addMonth.draft.title")}
            sub={t("gatherings:create.v2.draft.resumeSub", {
              label: t("gatherings:addMonth.draft.label", {
                count: offer.dateCount,
              }),
              age: draftAgeText(offer.ageMinutes, t),
            })}
            primaryLabel={t("gatherings:create.v2.draft.resume")}
            onPrimary={() => {
              draft.resume();
              focusTemplateHeadingSoon();
            }}
            secondaryLabel={t("gatherings:create.v2.draft.startFresh")}
            onSecondary={() => {
              draft.startFresh();
              focusTemplateHeadingSoon();
            }}
          />
        </div>
      )}
    </Collapse>
  );
}

/** Section 4: the pledges and the Publish button, then why the last
 *  publish failed, below the section's heading. */
function AddMonthPublishArea({
  page,
  publishing,
}: {
  page: AddEventMonthPageModel;
  publishing: AddMonthPublishing;
}) {
  const { state, dispatch } = page;
  const failure = useLastPresent(publishing.failure);
  return (
    <section
      id={ADD_MONTH_SECTION_IDS.publish}
      className={styles.section}
      aria-labelledby={ADD_MONTH_PUBLISH_HEADING_ID}
    >
      <AddMonthPublishSection
        count={state.rows.length}
        pledges={state.pledges}
        onTogglePledge={(index) => dispatch({ type: "togglePledge", index })}
        block={page.block}
        isPublishing={publishing.isPublishing}
        onPublish={publishing.publish}
        onBlockedPress={publishing.pressBlocked}
      />
      <Collapse isOpen={publishing.failure !== null}>
        {failure && (
          <div className={styles.failure}>
            <AddMonthFailurePanel
              failure={failure}
              hasMarkedRow={publishing.serverIssue !== null}
            />
          </div>
        )}
      </Collapse>
    </section>
  );
}

/** The four sections. The last three open once a starting event loads. The
 *  form waits, dimmed and inert, while a saved month is on offer: saving
 *  holds off until the host answers, so work typed meanwhile would be lost
 *  on a reload. */
function AddEventMonthForm({
  page,
  publishing,
}: {
  page: AddEventMonthPageModel;
  publishing: AddMonthPublishing;
}) {
  const template = page.shownTemplate;
  const isTemplateShown =
    template !== undefined && page.templateFailure === null;
  const isWaitingForDraftAnswer = page.draft.offer !== null;
  const formClassName = isWaitingForDraftAnswer
    ? `${styles.form} ${styles.formWaiting}`
    : styles.form;
  return (
    <div
      className={formClassName}
      inert={publishing.isPublishing || isWaitingForDraftAnswer}
    >
      <AddMonthTemplateSection
        page={page}
        isVenueListingRefused={publishing.isVenueListingRefused}
      />
      <Collapse isOpen={isTemplateShown}>
        {template && (
          <div className={styles.form}>
            <AddMonthDatesSection page={page} template={template} />
            <AddMonthRowsSection
              state={page.state}
              dispatch={page.dispatch}
              template={template}
              issues={page.issues}
              serverIssue={publishing.serverIssue}
              shouldShowIssues={publishing.shouldShowIssues}
            />
            <AddMonthPublishArea page={page} publishing={publishing} />
          </div>
        )}
      </Collapse>
    </div>
  );
}

function AddEventMonthContent() {
  const page = useAddEventMonthPage();
  const publishing = useAddMonthPublish({
    state: page.state,
    payload: page.payload,
    block: page.block,
    issues: page.issues,
    dispatch: page.dispatch,
    onPublished: page.draft.forget,
    openSharedEdit: page.openSharedEdit,
    closeSharedEdit: page.closeSharedEdit,
  });
  const createdEvents = useLastPresent(publishing.created);
  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.column}>
            <AddEventMonthHeader />
            <AddMonthDraftOfferStrip draft={page.draft} />
            <Collapse isOpen={publishing.created !== null}>
              <AddMonthResults
                events={createdEvents}
                timezone={page.shownTemplate?.timezone ?? ""}
                onAddAnother={publishing.startAnother}
              />
            </Collapse>
            <Collapse isOpen={publishing.created === null}>
              <AddEventMonthForm page={page} publishing={publishing} />
            </Collapse>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/**
 * "Add a month of events" (`/create-gathering/month`): one starting event,
 * up to 31 dates, one card per date, published together. A member without
 * the early access grant reads why and a way back to hosting.
 */
export function AddEventMonthPage() {
  const canAddEventMonth = useCanAddEventMonth();
  if (!canAddEventMonth) return <AddEventMonthNoAccess />;
  return <AddEventMonthContent />;
}
