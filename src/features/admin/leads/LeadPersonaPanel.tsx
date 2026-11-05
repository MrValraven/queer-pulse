import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiLink, FiXCircle } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  LeadDTO,
  LeadPersonaDTO,
  LeadStage,
  UpdateLeadBody,
} from "./api/leads.types";
import { useLeadIsWriting, useUpdateLead } from "./api/useLeadMutations";
import { useLeadPersonaSearch } from "./api/useLeadPersonaSearch";
import { leadFieldErrorOf, type LeadFieldError } from "./leadForm.model";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import { adminLeadPath } from "./leadPaths";
import { LeadPersonaCard } from "./LeadPersonaCard";
import { LeadPersonaDialog } from "./LeadPersonaDialog";
import { LeadRefusalLine } from "./LeadRefusalLine";
import adminStyles from "./AdminLead.module.css";
import styles from "./AdminLeads.module.css";

/**
 * The persona a lead is linked to. With none, a line says so and Link
 * persona opens a search of the public directory. Linked, the persona card
 * shows with Unlink persona, and keeps the last persona drawn while it folds
 * away. Right after a link, while the lead is not On board yet, a prompt
 * offers Move to On board. Refusals name their cause under the panel.
 */
export function LeadPersonaPanel({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const [isLinking, setIsLinking] = useState(false);
  const [query, setQuery] = useState("");
  const [dialogError, setDialogError] = useState<LeadFieldError | null>(null);
  const [panelError, setPanelError] = useState<LeadFieldError | null>(null);
  const [hasJustLinked, setHasJustLinked] = useState(false);
  // Once the lead is On board (by the prompt or from anywhere else) the
  // prompt is done for good, so a later stage change never brings it back.
  if (hasJustLinked && lead.stage === "on_board") setHasJustLinked(false);
  const linkedPersona = lead.linkedPersona;
  const [lastPersona, setLastPersona] = useState(linkedPersona);
  if (linkedPersona !== null && linkedPersona !== lastPersona) {
    setLastPersona(linkedPersona);
  }
  const shownPersona = linkedPersona ?? lastPersona;
  // The prompt keeps naming the stage it offered to leave while it folds.
  const [promptStage, setPromptStage] = useState<LeadStage>(lead.stage);
  if (lead.stage !== "on_board" && lead.stage !== promptStage) {
    setPromptStage(lead.stage);
  }
  const search = useLeadPersonaSearch(query);
  const updateLead = useUpdateLead(lead.id);
  const isWriting = useLeadIsWriting();
  const isBusy = updateLead.isPending || isWriting;
  // Set the moment a press is accepted, since `isPending` only flips on the
  // next render and a same-tick double press would send two writes.
  const isSendingRef = useRef(false);

  function write(
    body: UpdateLeadBody,
    onSuccess: () => void,
    onError: (cause: unknown) => void,
  ) {
    if (isBusy || isSendingRef.current) return;
    isSendingRef.current = true;
    setPanelError(null);
    setDialogError(null);
    updateLead.mutate(body, {
      onSuccess,
      onError,
      onSettled: () => {
        isSendingRef.current = false;
      },
    });
  }

  const showPanelError = (cause: unknown) =>
    setPanelError(leadFieldErrorOf(cause));

  // The search starts empty on each open; the closing dialog keeps its
  // results on screen while it fades out.
  function openDialog() {
    setQuery("");
    setDialogError(null);
    setIsLinking(true);
  }

  const closeDialog = () => setIsLinking(false);

  function choose(persona: LeadPersonaDTO) {
    write(
      { linkedSubprofileId: persona.id },
      () => {
        closeDialog();
        setHasJustLinked(true);
        showToast(
          t("admin:leads.persona.linkedToast", { name: persona.displayName }),
          "success",
        );
      },
      (cause) => setDialogError(leadFieldErrorOf(cause)),
    );
  }

  function unlink() {
    const name = linkedPersona?.displayName ?? "";
    write(
      { linkedSubprofileId: null },
      () => {
        setHasJustLinked(false);
        showToast(t("admin:leads.persona.unlinkedToast", { name }), "success");
      },
      showPanelError,
    );
  }

  function moveToOnBoard() {
    write(
      { stage: "on_board" },
      () =>
        showToast(
          t("admin:leads.details.stageSaved", {
            stage: t(LEAD_STAGE_LABEL_KEY.on_board),
          }),
          "success",
        ),
      showPanelError,
    );
  }

  return (
    <section className={adminStyles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={adminStyles.sectionHeading}>
        {t("admin:leads.persona.heading")}
      </h2>
      <Collapse isOpen={linkedPersona === null}>
        <div className={styles.personaEmpty}>
          <p className={styles.personaNone}>{t("admin:leads.persona.none")}</p>
          <Button
            variant="ghost"
            size="sm"
            className={styles.personaAction}
            onClick={openDialog}
          >
            <FiLink aria-hidden />
            {t("admin:leads.persona.linkCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={linkedPersona !== null}>
        {shownPersona !== null ? (
          <LeadPersonaCard
            persona={shownPersona}
            actions={
              <Button
                variant="ghost"
                size="sm"
                className={styles.personaAction}
                aria-disabled={isBusy || undefined}
                onClick={unlink}
              >
                <FiXCircle aria-hidden />
                {t("admin:leads.persona.unlinkCta")}
              </Button>
            }
          />
        ) : null}
      </Collapse>
      <Collapse
        isOpen={
          hasJustLinked && linkedPersona !== null && lead.stage !== "on_board"
        }
      >
        <div className={styles.personaPrompt}>
          <p className={styles.personaPromptText}>
            {t("admin:leads.persona.moveToOnBoardPrompt", {
              stage: t(LEAD_STAGE_LABEL_KEY[promptStage]),
            })}
          </p>
          <Button
            variant="primary"
            size="sm"
            className={styles.personaAction}
            aria-disabled={isBusy || undefined}
            onClick={moveToOnBoard}
          >
            {t("admin:leads.persona.moveToOnBoard")}
          </Button>
        </div>
      </Collapse>
      <LeadRefusalLine error={panelError} openLeadPath={adminLeadPath} />
      <AnimatePresence>
        {isLinking && (
          <LeadPersonaDialog
            query={query}
            onQueryChange={(nextQuery) => {
              setQuery(nextQuery);
              setDialogError(null);
            }}
            search={search}
            currentLeadId={lead.id}
            isBusy={isBusy}
            error={dialogError}
            onChoose={choose}
            onClose={closeDialog}
            openLeadPath={adminLeadPath}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
