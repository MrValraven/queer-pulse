import { useState, type ReactNode } from "react";
import { Button, ChipSelect, Select, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { ModalShell, SuccessPanel } from "./CultureModalKit";
import { useChipSet, useSubmitFlow } from "./cultureModalKit.hooks";
import {
  PICK_KINDS,
  PICK_KIND_OPTION_LABEL_KEY,
  PROJECT_LOOKING_FOR,
  PROJECT_LOOKING_FOR_LABEL_KEY,
  SHOWCASE_MEDIUMS,
  SHOWCASE_MEDIUM_LABEL_KEY,
  PLAYLIST_VIBES,
  PLAYLIST_VIBE_LABEL_KEY,
} from "./cultureModals.data";
import styles from "./CultureModals.module.css";

/**
 * Runs a culture form's submit: the prototype's simulated beat in demo mode,
 * a real `POST /intakes/:kind` in live mode. Mirrors how
 * `useCreateCommissionInterest` splits demo/live, but these four forms share
 * one generic intake kind pipeline instead of a dedicated endpoint each (see
 * `src/shared/api/intakes.ts`).
 */
function useCultureIntakeSubmit(
  flow: ReturnType<typeof useSubmitFlow>,
  kind: Parameters<typeof submitIntake>[0],
) {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  return async (payload: Record<string, unknown>) => {
    if (demoMode) {
      flow.submit();
      return;
    }
    try {
      await flow.run(async () => {
        await submitIntake(kind, payload);
      });
    } catch {
      showToast(t("shared:intake.errorToast"), "error");
    }
  };
}

/** Shared submit button that swaps to a spinner while sending. */
export function SubmitBtn({
  sending,
  disabled = false,
  label,
  onClick,
}: {
  sending: boolean;
  /** Disables the button without switching to the spinner, e.g. a required
   *  field is still empty. */
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button variant="primary" disabled={sending || disabled} onClick={onClick}>
      {sending ? <Sending label={t("culture:common.sending")} /> : label}
    </Button>
  );
}

/**
 * The one skeleton every culture form modal shares: a plum-panel success state
 * once `done`, otherwise the eyebrow + serif title + sub, the caller's fields,
 * and a Cancel / Submit footer. Callers pass the ready-made `success` node so
 * each flow keeps its own copy and next-steps.
 */
export function CultureFormModal({
  onClose,
  sending,
  done,
  disabled = false,
  eyebrow,
  title,
  sub,
  submitLabel,
  onSubmit,
  success,
  children,
}: {
  onClose: () => void;
  sending: boolean;
  done: boolean;
  /** Keeps Submit disabled while a required field is still empty. */
  disabled?: boolean;
  eyebrow: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  /** The plum-panel confirmation shown once the flow completes. */
  success: ReactNode;
  /** The form fields between the header and the footer. */
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        success
      ) : (
        <>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.sub}>{sub}</p>
          {children}
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("culture:common.cancel")}
            </Button>
            <SubmitBtn
              sending={sending}
              disabled={disabled}
              label={submitLabel}
              onClick={onSubmit}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Suggest a pick ──────────────────────────────────────────────────── */
export function SuggestPickModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const flow = useSubmitFlow();
  const { sending, done } = flow;
  const [kind, setKind] = useState<string>(PICK_KINDS[0]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [why, setWhy] = useState("");
  const submitToServer = useCultureIntakeSubmit(flow, "culture_suggest_pick");
  const canSubmit = title.trim().length > 0;
  return (
    <CultureFormModal
      onClose={onClose}
      sending={sending}
      done={done}
      disabled={!canSubmit}
      eyebrow={t("culture:tabs.club")}
      title={
        <Translation
          i18nKey="culture:suggestPick.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("culture:suggestPick.sub")}
      submitLabel={t("culture:suggestPick.nominateCta")}
      onSubmit={() => {
        if (!canSubmit) return;
        void submitToServer({
          format: kind,
          title: title.trim(),
          author: author.trim(),
          why: why.trim(),
        });
      }}
      success={
        <SuccessPanel
          title={t("culture:suggestPick.success.title")}
          em={t("culture:suggestPick.success.em")}
          steps={[
            t("culture:suggestPick.success.step1"),
            t("culture:suggestPick.success.step2"),
          ]}
          onClose={onClose}
        >
          {t("culture:suggestPick.success.body")}
        </SuccessPanel>
      }
    >
      <div className={styles.field}>
        <label htmlFor="pk-kind">{t("culture:suggestPick.formatLabel")}</label>
        <Select
          id="pk-kind"
          value={kind}
          onChange={(value) => setKind(value ?? PICK_KINDS[0])}
          options={PICK_KINDS.map((k) => ({
            value: k,
            label: t(PICK_KIND_OPTION_LABEL_KEY[k]),
          }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pk-title">{t("culture:suggestPick.titleLabel")}</label>
        <input
          id="pk-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("culture:suggestPick.titlePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pk-author">
          {t("culture:suggestPick.authorLabel")}
        </label>
        <input
          id="pk-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={t("culture:suggestPick.authorPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pk-why">{t("culture:suggestPick.whyLabel")}</label>
        <textarea
          id="pk-why"
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder={t("culture:suggestPick.whyPlaceholder")}
        />
      </div>
    </CultureFormModal>
  );
}

/* ── Post a project (commission board) ───────────────────────────────── */
export function PostProjectModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const flow = useSubmitFlow();
  const { sending, done } = flow;
  const { selected, toggle } = useChipSet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const lookingForOptions = PROJECT_LOOKING_FOR.map((value) => ({
    value,
    label: t(PROJECT_LOOKING_FOR_LABEL_KEY[value] ?? value),
  }));
  const submitToServer = useCultureIntakeSubmit(flow, "culture_post_project");
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;
  return (
    <CultureFormModal
      onClose={onClose}
      sending={sending}
      done={done}
      disabled={!canSubmit}
      eyebrow={t("culture:tabs.commission")}
      title={
        <Translation
          i18nKey="culture:postProject.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("culture:postProject.sub")}
      submitLabel={t("culture:postProject.postCta")}
      onSubmit={() => {
        if (!canSubmit) return;
        void submitToServer({
          title: title.trim(),
          description: description.trim(),
          lookingFor: [...selected],
        });
      }}
      success={
        <SuccessPanel
          title={t("culture:postProject.success.title")}
          em={t("culture:postProject.success.em")}
          steps={[
            t("culture:postProject.success.step1"),
            t("culture:postProject.success.step2"),
          ]}
          onClose={onClose}
        >
          {t("culture:postProject.success.body")}
        </SuccessPanel>
      }
    >
      <div className={styles.field}>
        <label htmlFor="pp-title">{t("culture:postProject.titleLabel")}</label>
        <input
          id="pp-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("culture:postProject.titlePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pp-desc">{t("culture:postProject.descLabel")}</label>
        <textarea
          id="pp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("culture:postProject.descPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label id="pp-looking-for-label">
          {t("culture:postProject.lookingForLabel")}
        </label>
        <ChipSelect
          labelledBy="pp-looking-for-label"
          options={lookingForOptions}
          selected={selected}
          onToggle={toggle}
        />
      </div>
    </CultureFormModal>
  );
}

/* ── Submit your work (art showcase) ─────────────────────────────────── */
export function SubmitWorkModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const flow = useSubmitFlow();
  const { sending, done } = flow;
  const [medium, setMedium] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [about, setAbout] = useState("");
  const submitToServer = useCultureIntakeSubmit(flow, "culture_submit_work");
  const canSubmit = title.trim().length > 0 && !!medium;
  return (
    <CultureFormModal
      onClose={onClose}
      sending={sending}
      done={done}
      disabled={!canSubmit}
      eyebrow={t("culture:tabs.showcase")}
      title={
        <Translation
          i18nKey="culture:submitWork.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("culture:submitWork.sub")}
      submitLabel={t("culture:submitWork.submitCta")}
      onSubmit={() => {
        if (!canSubmit) return;
        void submitToServer({
          title: title.trim(),
          medium,
          link: link.trim(),
          about: about.trim(),
        });
      }}
      success={
        <SuccessPanel
          title={t("culture:submitWork.success.title")}
          em={t("culture:submitWork.success.em")}
          steps={[
            t("culture:submitWork.success.step1"),
            t("culture:submitWork.success.step2"),
          ]}
          onClose={onClose}
        >
          {t("culture:submitWork.success.body")}
        </SuccessPanel>
      }
    >
      <div className={styles.field}>
        <label htmlFor="sw-title">{t("culture:submitWork.titleLabel")}</label>
        <input
          id="sw-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("culture:submitWork.titlePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="sw-medium">{t("culture:submitWork.mediumLabel")}</label>
        <Select
          id="sw-medium"
          placeholder={t("culture:submitWork.mediumPlaceholder")}
          value={medium}
          onChange={setMedium}
          options={SHOWCASE_MEDIUMS.map((m) => ({
            value: m,
            label: t(SHOWCASE_MEDIUM_LABEL_KEY[m]),
          }))}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="sw-link">{t("culture:submitWork.linkLabel")}</label>
        <input
          id="sw-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t("culture:submitWork.linkPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="sw-about">{t("culture:submitWork.aboutLabel")}</label>
        <textarea
          id="sw-about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder={t("culture:submitWork.aboutPlaceholder")}
        />
      </div>
    </CultureFormModal>
  );
}

/* ── Submit a playlist (radio) ───────────────────────────────────────── */
export function SubmitPlaylistModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const flow = useSubmitFlow();
  const { sending, done } = flow;
  const { selected, toggle } = useChipSet();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const vibeOptions = PLAYLIST_VIBES.map((value) => ({
    value,
    label: t(PLAYLIST_VIBE_LABEL_KEY[value] ?? value),
  }));
  const submitToServer = useCultureIntakeSubmit(
    flow,
    "culture_submit_playlist",
  );
  const canSubmit = name.trim().length > 0 && link.trim().length > 0;
  return (
    <CultureFormModal
      onClose={onClose}
      sending={sending}
      done={done}
      disabled={!canSubmit}
      eyebrow={t("culture:submitPlaylist.eyebrow")}
      title={
        <Translation
          i18nKey="culture:submitPlaylist.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("culture:submitPlaylist.sub")}
      submitLabel={t("culture:submitPlaylist.submitCta")}
      onSubmit={() => {
        if (!canSubmit) return;
        void submitToServer({
          name: name.trim(),
          link: link.trim(),
          vibes: [...selected],
          note: note.trim(),
        });
      }}
      success={
        <SuccessPanel
          title={t("culture:submitPlaylist.success.title")}
          em={t("culture:submitPlaylist.success.em")}
          steps={[
            t("culture:submitPlaylist.success.step1"),
            t("culture:submitPlaylist.success.step2"),
          ]}
          onClose={onClose}
        >
          {t("culture:submitPlaylist.success.body")}
        </SuccessPanel>
      }
    >
      <div className={styles.field}>
        <label htmlFor="pl-name">{t("culture:submitPlaylist.nameLabel")}</label>
        <input
          id="pl-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("culture:submitPlaylist.namePlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pl-link">{t("culture:submitPlaylist.linkLabel")}</label>
        <input
          id="pl-link"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder={t("culture:submitPlaylist.linkPlaceholder")}
        />
      </div>
      <div className={styles.field}>
        <label id="pl-vibe-label">
          {t("culture:submitPlaylist.vibeLabel")}
        </label>
        <ChipSelect
          labelledBy="pl-vibe-label"
          options={vibeOptions}
          selected={selected}
          onToggle={toggle}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pl-note">{t("culture:submitPlaylist.noteLabel")}</label>
        <textarea
          id="pl-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("culture:submitPlaylist.notePlaceholder")}
        />
      </div>
    </CultureFormModal>
  );
}
