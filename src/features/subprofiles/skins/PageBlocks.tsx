import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Page `afterBio` slot: a pull-quote excerpt (`skinData.excerpt`). `null`
 *  when the persona hasn't set one. */
export function PageExcerpt({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const excerpt = persona.skinData?.excerpt;
  // `lines` is typed required, but the block editor persists partial objects
  // (e.g. only `from` filled, `lines` never added), so guard the sub-field —
  // reading `.length` off an absent `lines` white-screened the whole page.
  if (!excerpt || !excerpt.lines || excerpt.lines.length === 0) return null;

  return (
    <div className="excerpt">
      <div className="excerpt-lines">
        {excerpt.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <span className="excerpt-from">
        {t("subprofiles:skinExtras.page.excerptFrom")} <em>{excerpt.from}</em>
      </span>
    </div>
  );
}

/** Page `end` slot: the colophon note (`skinData.colophon`). `null` when the
 *  persona hasn't set one. */
export function PageColophon({ persona }: { persona: SkinExtrasPersona }) {
  const colophon = persona.skinData?.colophon;
  if (!colophon) return null;
  return <p className="colophon">{colophon}</p>;
}
