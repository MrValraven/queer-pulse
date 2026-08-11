import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getStudioWorks } from "./studioWorks";
import { workMeta } from "../personaSkinRender";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Studio `end` slot: a numbered checklist of every work, opening the
 *  lightbox on click. `null` when the persona has no visual-section items.
 *  `onOpenWork` is omitted by the caller in `mode="preview"` (see
 *  `SubprofileSkinExtras`) — each row then renders as a disabled look-alike
 *  button rather than a live lightbox trigger. */
export function StudioChecklist({
  persona,
  onOpenWork,
}: {
  persona: SkinExtrasPersona;
  onOpenWork?: (index: number) => void;
}) {
  const { t } = useTranslation();
  const works = getStudioWorks(persona.sections);
  if (works.length === 0) return null;

  return (
    <div className="checklist">
      <h2>{t("subprofiles:skinExtras.studio.checklistTitle")}</h2>
      <ol>
        {works.map((item, index) => {
          const meta = workMeta(item);
          return (
            // `index` still drives the lightbox open-index (getStudioWorks is
            // the canonical index space); only the React key is made stable.
            <li key={`${item.title}|${item.date}|${item.url}`}>
              <button
                type="button"
                disabled={!onOpenWork}
                onClick={onOpenWork ? () => onOpenWork(index) : undefined}
              >
                <span className="ck-n">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ck-t">{item.title}</span>
                {meta && <span className="ck-m">{meta}</span>}
                {item.date && <span className="ck-d">{item.date}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
