import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  ModalShell,
  SuccessPanel,
  Sending,
  ChipSelect,
  useChipSet,
  useSubmitFlow,
} from "./CultureModalKit";
import {
  PICK_KINDS,
  PICK_KIND_OPTION_LABEL_KEY,
  PROJECT_LOOKING_FOR,
  PROJECT_LOOKING_FOR_LABEL_KEY,
  SHOWCASE_MEDIUMS,
  SHOWCASE_MEDIUM_LABEL_KEY,
  PLAYLIST_VIBES,
  PLAYLIST_VIBE_LABEL_KEY,
  replyByDate,
} from "./cultureModals.data";
import type { TFunction } from "../../shared/i18n/types";
import styles from "./CultureModals.module.css";

/** Shared submit button that swaps to a spinner while sending. */
function SubmitBtn({
  sending,
  label,
  onClick,
}: {
  sending: boolean;
  label: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button variant="primary" disabled={sending} onClick={onClick}>
      {sending ? <Sending label={t("culture:common.sending")} /> : label}
    </Button>
  );
}

/* ── Suggest a pick ──────────────────────────────────────────────────── */
export function SuggestPickModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { sending, done, submit } = useSubmitFlow();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("culture:suggestPick.success.title")}
          em={t("culture:suggestPick.success.em")}
          steps={[
            t("culture:suggestPick.success.step1"),
            <Translation
              key="step2"
              i18nKey="culture:suggestPick.success.step2"
              values={{
                date: fmt.date(replyByDate(1), {
                  day: "numeric",
                  month: "long",
                }),
              }}
              components={{ strong: <strong /> }}
            />,
          ]}
          onClose={onClose}
        >
          {t("culture:suggestPick.success.body")}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("culture:tabs.club")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="culture:suggestPick.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("culture:suggestPick.sub")}</p>
          <div className={styles.field}>
            <label htmlFor="pk-kind">
              {t("culture:suggestPick.formatLabel")}
            </label>
            <select id="pk-kind" defaultValue={PICK_KINDS[0]}>
              {PICK_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(PICK_KIND_OPTION_LABEL_KEY[k])}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="pk-title">
              {t("culture:suggestPick.titleLabel")}
            </label>
            <input
              id="pk-title"
              type="text"
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
              placeholder={t("culture:suggestPick.authorPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pk-why">{t("culture:suggestPick.whyLabel")}</label>
            <textarea
              id="pk-why"
              placeholder={t("culture:suggestPick.whyPlaceholder")}
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("culture:common.cancel")}
            </Button>
            <SubmitBtn
              sending={sending}
              label={t("culture:suggestPick.nominateCta")}
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Post a project (commission board) ───────────────────────────────── */
export function PostProjectModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { sending, done, submit } = useSubmitFlow();
  const { selected, toggle } = useChipSet();
  const lookingForLabel = makeOptionLabel(t, PROJECT_LOOKING_FOR_LABEL_KEY);
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
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
      ) : (
        <>
          <div className={styles.eyebrow}>{t("culture:tabs.commission")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="culture:postProject.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("culture:postProject.sub")}</p>
          <div className={styles.field}>
            <label htmlFor="pp-title">
              {t("culture:postProject.titleLabel")}
            </label>
            <input
              id="pp-title"
              type="text"
              placeholder={t("culture:postProject.titlePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pp-desc">
              {t("culture:postProject.descLabel")}
            </label>
            <textarea
              id="pp-desc"
              placeholder={t("culture:postProject.descPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label>{t("culture:postProject.lookingForLabel")}</label>
            <ChipSelect
              options={PROJECT_LOOKING_FOR}
              selected={selected}
              onToggle={toggle}
              optionLabel={lookingForLabel}
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("culture:common.cancel")}
            </Button>
            <SubmitBtn
              sending={sending}
              label={t("culture:postProject.postCta")}
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Submit your work (art showcase) ─────────────────────────────────── */
export function SubmitWorkModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { sending, done, submit } = useSubmitFlow();
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("culture:submitWork.success.title")}
          em={t("culture:submitWork.success.em")}
          steps={[
            t("culture:submitWork.success.step1"),
            <Translation
              key="step2"
              i18nKey="culture:submitWork.success.step2"
              values={{
                date: fmt.date(replyByDate(4), {
                  day: "numeric",
                  month: "long",
                }),
              }}
              components={{ strong: <strong /> }}
            />,
          ]}
          onClose={onClose}
        >
          {t("culture:submitWork.success.body")}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("culture:tabs.showcase")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="culture:submitWork.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("culture:submitWork.sub")}</p>
          <div className={styles.field}>
            <label htmlFor="sw-title">
              {t("culture:submitWork.titleLabel")}
            </label>
            <input
              id="sw-title"
              type="text"
              placeholder={t("culture:submitWork.titlePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-medium">
              {t("culture:submitWork.mediumLabel")}
            </label>
            <select id="sw-medium" defaultValue="">
              <option value="" disabled>
                {t("culture:submitWork.mediumPlaceholder")}
              </option>
              {SHOWCASE_MEDIUMS.map((m) => (
                <option key={m} value={m}>
                  {t(SHOWCASE_MEDIUM_LABEL_KEY[m])}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-link">{t("culture:submitWork.linkLabel")}</label>
            <input
              id="sw-link"
              type="url"
              placeholder={t("culture:submitWork.linkPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="sw-about">
              {t("culture:submitWork.aboutLabel")}
            </label>
            <textarea
              id="sw-about"
              placeholder={t("culture:submitWork.aboutPlaceholder")}
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("culture:common.cancel")}
            </Button>
            <SubmitBtn
              sending={sending}
              label={t("culture:submitWork.submitCta")}
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Submit a playlist (radio) ───────────────────────────────────────── */
export function SubmitPlaylistModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { sending, done, submit } = useSubmitFlow();
  const { selected, toggle } = useChipSet();
  const vibeLabel = makeOptionLabel(t, PLAYLIST_VIBE_LABEL_KEY);
  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("culture:submitPlaylist.success.title")}
          em={t("culture:submitPlaylist.success.em")}
          steps={[
            t("culture:submitPlaylist.success.step1"),
            <Translation
              key="step2"
              i18nKey="culture:submitPlaylist.success.step2"
              values={{
                date: fmt.date(replyByDate(3), {
                  day: "numeric",
                  month: "long",
                }),
              }}
              components={{ strong: <strong /> }}
            />,
          ]}
          onClose={onClose}
        >
          {t("culture:submitPlaylist.success.body")}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("culture:submitPlaylist.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="culture:submitPlaylist.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("culture:submitPlaylist.sub")}</p>
          <div className={styles.field}>
            <label htmlFor="pl-name">
              {t("culture:submitPlaylist.nameLabel")}
            </label>
            <input
              id="pl-name"
              type="text"
              placeholder={t("culture:submitPlaylist.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pl-link">
              {t("culture:submitPlaylist.linkLabel")}
            </label>
            <input
              id="pl-link"
              type="url"
              placeholder={t("culture:submitPlaylist.linkPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label>{t("culture:submitPlaylist.vibeLabel")}</label>
            <ChipSelect
              options={PLAYLIST_VIBES}
              selected={selected}
              onToggle={toggle}
              optionLabel={vibeLabel}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pl-note">
              {t("culture:submitPlaylist.noteLabel")}
            </label>
            <textarea
              id="pl-note"
              placeholder={t("culture:submitPlaylist.notePlaceholder")}
            />
          </div>
          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              {t("culture:common.cancel")}
            </Button>
            <SubmitBtn
              sending={sending}
              label={t("culture:submitPlaylist.submitCta")}
              onClick={() => submit()}
            />
          </div>
        </>
      )}
    </ModalShell>
  );
}

/** Build a `ChipSelect` `optionLabel` resolver from a canonical-id → key map. */
function makeOptionLabel(
  t: TFunction,
  labelKeys: Record<string, string>,
): (option: string) => string {
  return (option) => t(labelKeys[option] ?? option);
}
