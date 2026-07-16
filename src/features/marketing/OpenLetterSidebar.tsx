import { useState, type FormEvent } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CURRENT_MEMBER,
  VISIBILITY_OPTIONS,
  type Signature,
} from "./openLetter.data";
import s from "./OpenLetterPage.module.css";

const tintClass: Record<Signature["tint"], string | undefined> = {
  accent: s.tintAccent,
  jade: s.tintJade,
  plum: s.tintPlum,
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface SidebarProps {
  signatures: Signature[];
  signed: boolean;
  onSign: (entry: Signature) => void;
}

export function OpenLetterSidebar({
  signatures,
  signed,
  onSign,
}: SidebarProps) {
  const { t } = useTranslation();
  return (
    <aside className={s.side}>
      <SignCard signed={signed} onSign={onSign} />
      <div className={s.card}>
        <div className={s.listCard}>
          <h4>{t("marketing:openLetter.sidebar.recentSignatures")}</h4>
          {signatures.map((sig, i) => (
            <div className={s.sigRow} key={`${sig.name}-${i}`}>
              <div className={`${s.sigAv} ${tintClass[sig.tint]}`}>
                {sig.av}
              </div>
              <div className={s.sigText}>
                <b>{sig.name}</b>
                <em>
                  {sig.note
                    ? `"${sig.note}"`
                    : t("marketing:openLetter.sidebar.noNote")}
                </em>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.status}>
        <Translation
          i18nKey="marketing:openLetter.sidebar.aboutRunning"
          components={{ b: <b />, em: <em /> }}
        />
      </div>
    </aside>
  );
}

function SignCard({ signed, onSign }: Pick<SidebarProps, "signed" | "onSign">) {
  const { t } = useTranslation();
  const [name, setName] = useState(CURRENT_MEMBER.name);
  const [visibility, setVisibility] = useState("full");
  const [note, setNote] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (signed) return;
    const trimmed = name.trim() || CURRENT_MEMBER.name;
    const shown =
      visibility === "anon"
        ? t("marketing:openLetter.sign.anonName")
        : visibility === "initials"
          ? `${initials(trimmed)}.`
          : trimmed;
    onSign({
      av: initials(trimmed),
      tint: "jade",
      name: shown,
      note: note.trim() || undefined,
    });
  };

  return (
    <form className={s.card} id="sign" onSubmit={submit}>
      <div className={s.signHead}>
        <h4>{t("marketing:openLetter.sign.title")}</h4>
        <div className={s.as}>
          {t("marketing:openLetter.sign.asLabel", {
            name: CURRENT_MEMBER.name,
            pronouns: CURRENT_MEMBER.pronouns,
          })}
        </div>
      </div>
      <div className={s.signBody}>
        <div className={s.field}>
          <label htmlFor="ol-name">
            {t("marketing:openLetter.sign.nameLabel")}
          </label>
          <input
            id="ol-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={signed}
          />
        </div>
        <div className={s.field}>
          <label htmlFor="ol-vis">
            {t("marketing:openLetter.sign.visibilityLabel")}
          </label>
          <select
            id="ol-vis"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={signed}
          >
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label htmlFor="ol-note">
            {t("marketing:openLetter.sign.noteLabel")}
            <span className={s.fieldAside}>
              {t("marketing:openLetter.sign.noteCounter", {
                length: note.length,
              })}
            </span>
          </label>
          <textarea
            id="ol-note"
            placeholder={t("marketing:openLetter.sign.notePlaceholder")}
            maxLength={280}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={signed}
          />
        </div>
        <div className={s.signActions}>
          <Button
            type="submit"
            variant={signed ? "jade" : "primary"}
            disabled={signed}
          >
            {signed ? (
              <>
                <FiCheck aria-hidden />{" "}
                {t("marketing:openLetter.sign.signedCta")}
              </>
            ) : (
              t("marketing:openLetter.sign.submitCta")
            )}
          </Button>
        </div>
        <p className={s.signFoot}>{t("marketing:openLetter.sign.footer")}</p>
      </div>
    </form>
  );
}
