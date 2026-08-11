import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DIETARY } from "../personaSkinRender";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Table `top` slot: the menu-card header (`skinData.menuMeta`). `null` when
 *  the persona hasn't set one. */
export function TableMenuHeader({ persona }: { persona: SkinExtrasPersona }) {
  const meta = persona.skinData?.menuMeta;
  if (!meta) return null;

  return (
    <div className="menuhead">
      <span className="menuhead-no">{meta.no}</span>
      <span className="menuhead-when">{meta.when}</span>
      {meta.practical.length > 0 && (
        <span className="menuhead-practical">
          {meta.practical.join(" · ")}
        </span>
      )}
    </div>
  );
}

/** Table `spotlight` slot: the featured menu, printed as a menu card
 *  (`featured.structured.courses`). `null` when there's no featured item or
 *  it has no courses. */
export function TableMenuCard({
  featured,
}: {
  featured: SubprofileItemView | null | undefined;
}) {
  const courses = featured?.structured?.courses;
  if (!featured || !courses || courses.length === 0) return null;
  const line = featured.subtitle || featured.description;

  // `<h2>`, not `<h3>`: the table skin's featured menu stands in for the
  // Spotlight, so it sits at the same heading level (h1 name → h2).
  return (
    <div className="menucard">
      <h2>{featured.title}</h2>
      {line && <p className="menucard-line">{line}</p>}
      {courses.map((course) => (
        <div className="course" key={course.n}>
          <span className="course-name">{course.name}</span>
          {course.dishes.map((dish) => (
            <div className="dish" key={`${dish.title}|${dish.note ?? ""}`}>
              <b>
                {dish.title}
                {dish.marks && dish.marks.length > 0 && (
                  <sup>{dish.marks.map((mark) => mark.toUpperCase()).join(", ")}</sup>
                )}
              </b>
              {dish.note && <em>{dish.note}</em>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Every dietary mark actually used across the persona's menu items, in
 *  `DIETARY`'s declared order (v, ve, gf) rather than discovery order. */
function collectDietaryMarks(sections: SubprofileSectionView[]): string[] {
  const found = new Set<string>();
  for (const section of sections) {
    for (const item of section.items) {
      for (const course of item.structured?.courses ?? []) {
        for (const dish of course.dishes) {
          for (const mark of dish.marks ?? []) {
            if (mark in DIETARY) found.add(mark);
          }
        }
      }
    }
  }
  return Object.keys(DIETARY).filter((mark) => found.has(mark));
}

/** Table `end` slot: the legend for the dietary marks used on this persona's
 *  menus. `null` when no dish carries a recognised mark. */
export function TableDietaryLegend({
  persona,
}: {
  persona: SkinExtrasPersona;
}) {
  const { t } = useTranslation();
  const marks = collectDietaryMarks(persona.sections);
  if (marks.length === 0) return null;

  return (
    <div className="legend">
      {marks.map((mark) => (
        <span key={mark}>
          <sup>{mark.toUpperCase()}</sup>
          {t(DIETARY[mark] ?? mark)}
        </span>
      ))}
    </div>
  );
}
