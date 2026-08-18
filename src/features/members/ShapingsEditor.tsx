import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MemberProfile } from "./data/memberProfiles";
import { SHAPING_META } from "./profileSections.data";
import { InlineText, InlineTextarea } from "./profileEditControls";
import { Section } from "./ProfileSections";
import editStyles from "./ProfileEdit.module.css";
import pageStyles from "./ProfilePage.module.css";
import styles from "./ProfileListEditors.module.css";

type ShapingKey = keyof MemberProfile["shapings"];

const SHAPING_ORDER: ShapingKey[] = ["film", "book", "song", "moment"];

/**
 * Edit-mode twin of the read-only "What shaped me" section. Unlike the other
 * list editors (Skills, Groups, Board), this isn't an open-ended add/remove
 * list — it's four fixed slots (film/book/song/moment), each with a title and
 * a short note. A slot with both fields blank is dropped from the record
 * entirely on change, so an untouched slot never round-trips as an empty card
 * on the read-only view.
 */
export function ShapingsEditor({
  shapings,
  onChange,
}: {
  shapings: MemberProfile["shapings"];
  onChange: (next: MemberProfile["shapings"]) => void;
}) {
  const { t } = useTranslation();

  function update(kind: ShapingKey, patch: Partial<{ title: string; note: string }>) {
    const current = shapings[kind] ?? { title: "", note: "" };
    const next = { ...current, ...patch };
    const nextShapings = { ...shapings };
    if (!next.title.trim() && !next.note.trim()) {
      delete nextShapings[kind];
    } else {
      nextShapings[kind] = next;
    }
    onChange(nextShapings);
  }

  return (
    <Section
      title={t("members:content.shapings.title")}
      subtitle={t("members:profileEdit.shapings.subtitle")}
    >
      <div className={styles.shapingsGrid}>
        {SHAPING_ORDER.map((kind) => {
          const item = shapings[kind];
          const meta = SHAPING_META[kind]!;
          const Icon = meta.icon;
          const label = t(meta.labelKey);
          return (
            <div key={kind} className={pageStyles.shapingCard}>
              <div className={styles.shapingLabel}>
                <Icon aria-hidden />
                &ensp;{label}
              </div>
              <InlineText
                value={item?.title ?? ""}
                onChange={(title) => update(kind, { title })}
                placeholder={t("members:profileEdit.shapings.titlePlaceholder")}
                ariaLabel={t("members:profileEdit.shapings.titleLabel", { label })}
                className={editStyles.workTitleInput}
              />
              <InlineTextarea
                value={item?.note ?? ""}
                onChange={(note) => update(kind, { note })}
                placeholder={t("members:profileEdit.shapings.notePlaceholder")}
                ariaLabel={t("members:profileEdit.shapings.noteLabel", { label })}
                rows={2}
                className={styles.shapingNoteInput}
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
