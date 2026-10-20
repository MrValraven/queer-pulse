import { FiMapPin } from "react-icons/fi";
import { Avatar } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../../shared/lib/initials";
import { SubprofileHeroActions } from "../../SubprofileHeroActions";
import { SubprofileShare } from "../../SubprofileShare";
import {
  KIND_LABEL_KEYS,
  personaNameBesideCraft,
} from "../../subprofile-kinds";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import { TattooBookButton } from "./TattooBookButton";
import { TattooStatusPill } from "./TattooStatusPill";
import type { TattooView } from "./tattooView";
import { styleLabelKey } from "./tattooView.helpers";
import { isTattooBookShown } from "./tattooAside";
import styles from "./TattooHero.module.css";

interface TattooHeroProps {
  data: PublicSubprofileView;
  view: TattooView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}

/**
 * The tattoo hero: avatar, "{name} | Tattoo artist", the books status, up to
 * three style chips, the city, then "How to book" and the shared action row
 * (its availability pill left out, since the status pill says it here).
 * "How to book" is the row's one primary button: while it shows, the shared
 * row's message and link buttons take the ghost style.
 */
export function TattooHero({ data, view, mode, onAction }: TattooHeroProps) {
  const { t } = useTranslation();
  const name = personaNameBesideCraft({
    displayName: data.displayName,
    kind: data.kind,
    ownerName: data.ownerName,
  });
  const craft = t(KIND_LABEL_KEYS.tattoo_artist);
  const isBookShown = isTattooBookShown(view, mode);

  return (
    <header className={styles.hero}>
      <Avatar
        className={styles.avatar}
        initials={initialsFromName(data.displayName, "?")}
        src={data.avatarUrl ?? undefined}
        alt=""
        tint="plum"
        size={112}
      />

      <div className={styles.body}>
        <TattooStatusPill
          status={view.status}
          nextOpening={view.nextOpening}
          waitNote={view.waitNote}
        />

        <h1 className={styles.title}>
          {name} <span className={styles.craft}>| {craft}</span>
        </h1>
        {data.tagline && <p className={styles.tagline}>{data.tagline}</p>}

        {view.heroStyles.length > 0 && (
          <ul className={styles.chips}>
            {view.heroStyles.map((entry, index) => {
              const labelKey = styleLabelKey(entry);
              return (
                <li key={`${index}-${entry}`} className={styles.chip}>
                  {labelKey ? t(labelKey) : entry}
                </li>
              );
            })}
          </ul>
        )}

        {view.city && (
          <p className={styles.city}>
            <FiMapPin aria-hidden className={styles.cityIcon} />
            {t("subprofiles:tattoo.hero.city", { city: view.city })}
          </p>
        )}

        {data.bio && <p className={styles.bio}>{data.bio}</p>}

        <div className={styles.actions}>
          {isBookShown && <TattooBookButton isInert={mode === "preview"} />}
          {/* The owner bar above already carries "Edit page" and "View as
              visitor", so the owner's row keeps Share alone. */}
          {mode === "owner" ? (
            <div className="pp-acts">
              <SubprofileShare view={data} />
            </div>
          ) : (
            <SubprofileHeroActions
              view={data}
              mode={mode}
              onAction={onAction}
              isAvailabilityHidden
              hasHostPrimaryAction={isBookShown}
            />
          )}
        </div>
      </div>
    </header>
  );
}
