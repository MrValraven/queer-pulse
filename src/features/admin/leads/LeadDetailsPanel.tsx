import { useId, useRef, useState } from "react";
import { FiMail, FiPhone, FiXCircle } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { useLeadIsWriting, useUpdateLead } from "./api/useLeadMutations";
import {
  isLeadFormDirty,
  leadFieldErrorOf,
  leadFormValuesOf,
  leadUpdateBodyOf,
  sentLinksOf,
  type LeadFieldError,
  type LeadFormValues,
  type LeadLinkRow,
} from "./leadForm.model";
import { LeadFormFields } from "./LeadFormFields";
import { adminLeadPath } from "./leadPaths";
import { LeadRefusalLine } from "./LeadRefusalLine";
import { LeadStageControl } from "./LeadStageControl";
import styles from "./AdminLead.module.css";

/** A dialable number: digits and a leading plus, nothing else. */
const telHrefOf = (phone: string): string =>
  `tel:${phone.replace(/[^\d+]/g, "")}`;

const textsOf = (rows: readonly LeadLinkRow[]): string[] =>
  rows.map((row) => row.text);

const hasSameTexts = (first: readonly string[], second: readonly string[]) =>
  first.length === second.length &&
  first.every((text, index) => text === second[index]);

/**
 * The form after the stored lead moved from `previousLead` to `nextLead`
 * (a colleague's save reaching us with any write, or our own). Each field
 * this viewer left as seeded takes the new stored value; each field they
 * changed keeps their text. A form that ends up matching the stored lead is
 * seeded from it whole, so it reads exactly as stored. Link rows whose
 * texts did not change keep their keys, so an input never remounts under
 * the caret.
 */
function rebasedValuesOf(
  previousLead: LeadDTO,
  nextLead: LeadDTO,
  values: LeadFormValues,
): LeadFormValues {
  const seeded = leadFormValuesOf(previousLead);
  const stored = leadFormValuesOf(nextLead);
  const isLinksTouched = !hasSameTexts(
    textsOf(values.links),
    textsOf(seeded.links),
  );
  const rebased: LeadFormValues = {
    ...values,
    name: values.name === seeded.name ? stored.name : values.name,
    type: values.type === seeded.type ? stored.type : values.type,
    location:
      values.location === seeded.location ? stored.location : values.location,
    email: values.email === seeded.email ? stored.email : values.email,
    phone: values.phone === seeded.phone ? stored.phone : values.phone,
    links: isLinksTouched ? values.links : stored.links,
    followUpOn:
      values.followUpOn === seeded.followUpOn
        ? stored.followUpOn
        : values.followUpOn,
  };
  const settled = isLeadFormDirty(nextLead, rebased) ? rebased : stored;
  return hasSameTexts(textsOf(settled.links), textsOf(values.links))
    ? { ...settled, links: values.links }
    : settled;
}

/** True when focus sits on the page itself or inside `container`, a part
 *  that is folding away. Focus the viewer moved elsewhere is left alone. */
function isFocusLostOrWithin(container: HTMLElement | null): boolean {
  const focused = document.activeElement;
  if (focused === null || focused === document.body) return true;
  return container?.contains(focused) === true;
}

/** Email and Call, each folding in while the lead has that contact. Each
 *  fold may shrink to the row, so a long name wraps on a phone. */
function LeadQuickActions({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.quickActions}>
      <Collapse isOpen={lead.email !== null} className={styles.quickActionSlot}>
        <Button
          variant="ghost"
          size="sm"
          href={`mailto:${lead.email ?? ""}`}
          className={styles.quickAction}
        >
          <FiMail aria-hidden />
          {t("admin:leads.details.emailAction", { name: lead.name })}
        </Button>
      </Collapse>
      <Collapse isOpen={lead.phone !== null} className={styles.quickActionSlot}>
        <Button
          variant="ghost"
          size="sm"
          href={telHrefOf(lead.phone ?? "")}
          className={styles.quickAction}
        >
          <FiPhone aria-hidden />
          {t("admin:leads.details.phoneAction", { name: lead.name })}
        </Button>
      </Collapse>
    </div>
  );
}

/** Clear follow-up: one press empties the stored date at once. The
 *  button folds away under the finger, so `onCleared` hears whether focus
 *  was left there (or on the page) and should move on. */
function LeadClearFollowUp({
  lead,
  onCleared,
}: {
  lead: LeadDTO;
  onCleared: (shouldMoveFocus: boolean) => void;
}) {
  const { t } = useTranslation();
  const clearFollowUp = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const [refusal, setRefusal] = useState<LeadFieldError | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    if (isWriting) return;
    setRefusal(null);
    clearFollowUp.mutate(
      { followUpOn: null },
      {
        onSuccess: () => onCleared(isFocusLostOrWithin(rowRef.current)),
        onError: (cause) => setRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  return (
    <Collapse isOpen={lead.followUpOn !== null}>
      <div ref={rowRef} className={styles.followUpRow}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.phoneTarget}
          aria-disabled={isWriting || undefined}
          onClick={clear}
        >
          <FiXCircle aria-hidden />
          {t("admin:leads.details.clearFollowUp")}
        </Button>
        <LeadRefusalLine error={refusal} openLeadPath={adminLeadPath} />
      </div>
    </Collapse>
  );
}

/**
 * The lead's details. The stage saves on its own at the top; the other
 * fields are edited in place and saved together with Save changes, which
 * folds in once something differs from the stored lead. Fields the viewer
 * has not touched follow the stored lead, so a change saved elsewhere (a
 * colleague's edit, a cleared follow-up) shows at once and is never sent
 * back over.
 */
export function LeadDetailsPanel({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const saveBarRef = useRef<HTMLDivElement>(null);
  const saveDetails = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const idPrefix = `lead-${lead.id}-details`;
  const [values, setValues] = useState<LeadFormValues>(() =>
    leadFormValuesOf(lead),
  );
  const [seededLead, setSeededLead] = useState(lead);
  const [fieldError, setFieldError] = useState<LeadFieldError | null>(null);

  // The stored lead changed: untouched fields follow it, edits stay.
  if (lead.updatedAt !== seededLead.updatedAt) {
    setSeededLead(lead);
    setValues(rebasedValuesOf(seededLead, lead, values));
  }
  const isDirty = isLeadFormDirty(lead, values);

  const changeValues = (next: LeadFormValues) => {
    setValues(next);
    setFieldError(null);
  };

  // Save changes and Discard changes fold away with the bar, so focus goes
  // to the panel's heading. Discard is at once; a save lands later, so it
  // moves focus only when focus was left in the bar or on the page.
  const discard = () => {
    setValues(leadFormValuesOf(lead));
    setFieldError(null);
    headingRef.current?.focus();
  };

  const save = () => {
    if (isWriting || !isDirty) return;
    const sentLinks = sentLinksOf(values.links);
    setFieldError(null);
    saveDetails.mutate(leadUpdateBodyOf(lead, values), {
      onSuccess: () => {
        showToast(t("admin:leads.details.saved"), "success");
        if (isFocusLostOrWithin(saveBarRef.current)) {
          headingRef.current?.focus();
        }
      },
      onError: (cause) => setFieldError(leadFieldErrorOf(cause, sentLinks)),
    });
  };

  const followUpCleared = (shouldMoveFocus: boolean) => {
    setValues((current) => ({ ...current, followUpOn: null }));
    // The date field's opener carries the field's id.
    if (shouldMoveFocus) {
      document.getElementById(`${idPrefix}-follow-up`)?.focus();
    }
  };

  const formRefusal = fieldError?.field === null ? fieldError : null;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.sectionHeading}
      >
        {t("admin:leads.details.heading")}
      </h2>
      <LeadStageControl lead={lead} />
      <LeadQuickActions lead={lead} />
      <LeadFormFields
        idPrefix={idPrefix}
        values={values}
        onChange={changeValues}
        fieldError={fieldError}
        openLeadPath={adminLeadPath}
        shouldShowStage={false}
        shouldShowNote={false}
      />
      <LeadClearFollowUp lead={lead} onCleared={followUpCleared} />
      <Collapse isOpen={isDirty}>
        <div ref={saveBarRef} className={styles.saveBar}>
          <LeadRefusalLine error={formRefusal} openLeadPath={adminLeadPath} />
          <div className={styles.saveActions}>
            <Button
              variant="primary"
              aria-disabled={isWriting || undefined}
              onClick={save}
            >
              {t("admin:leads.details.save")}
            </Button>
            <Button variant="ghost" onClick={discard}>
              {t("admin:leads.details.discard")}
            </Button>
          </div>
        </div>
      </Collapse>
    </section>
  );
}
