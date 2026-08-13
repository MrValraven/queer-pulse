import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Avatar } from "../../shared/components/ui";
import { Select } from "../../shared/components/ui/Select";
import type {
  SelectOption,
  SelectOptionState,
} from "../../shared/components/ui/Select";
import { initialsOf } from "../../shared/api/refs";
import { useMemberSuggestions } from "../../shared/mentions/useMemberSuggestions";
import type { CollaboratorDTO } from "./api/subprofiles.api";
import { MAX_COLLABORATORS } from "./collaborators.data";
import styles from "./CollaboratorSelect.module.css";

interface CollaboratorSelectProps {
  collaborators: CollaboratorDTO[];
  onChange: (collaborators: CollaboratorDTO[]) => void;
}

/** Display data an option row needs, keyed by the collaborator's handle. For a
 *  member the handle is their slug, so member picks and already-saved member
 *  credits collapse onto the same option. */
interface OptionMeta {
  handle: string;
  name: string;
  avatarUrl?: string | null;
  initials: string;
}

/** First+rest initials from a display name (existing credits carry a name, not
 *  the first/last split `initialsOf` wants). */
function initialsFromName(name: string): string {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return initialsOf(first, rest.join(" "));
}

/**
 * Member-crediting picker for an item's collaborators, built on the shared
 * searchable `<Select>` (multi-select + typeahead). Options come from the same
 * dual-mode member corpus the @-mention system searches, so typing a name or
 * `@handle` finds real people instead of the old free-text field that resolved
 * nothing. Already-saved credits (including personas or members not in the
 * loaded page) are merged in as options so they stay visible and removable.
 *
 * On save only `.handle` is meaningful — `itemsToInputDto` maps it to the input
 * DTO's `collaborators: string[]`; the rest of each `CollaboratorDTO` is the
 * resolved card the picker already knows, or a stand-in the next read replaces.
 */
export function CollaboratorSelect({
  collaborators,
  onChange,
}: CollaboratorSelectProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const helperId = `${labelId}-helper`;
  const memberSuggestions = useMemberSuggestions();

  const atCap = collaborators.length >= MAX_COLLABORATORS;
  const selectedHandles = collaborators.map((collaborator) => collaborator.handle);
  const selectedSet = new Set(selectedHandles);

  // Members already credited on this item, so a toggle preserves their resolved
  // card (type/name/avatar/slug) rather than rebuilding a stand-in.
  const existingByHandle = new Map(
    collaborators.map((collaborator) => [collaborator.handle, collaborator]),
  );
  const memberByHandle = new Map(
    memberSuggestions.map((member) => [member.slug, member]),
  );

  // One option per handle: every searchable member, plus any current credit not
  // in the loaded member list (a persona, or a member on an unloaded page).
  const optionMeta = new Map<string, OptionMeta>();
  for (const member of memberSuggestions) {
    optionMeta.set(member.slug, {
      handle: member.slug,
      name: member.name,
      avatarUrl: member.avatarUrl,
      initials: member.initials,
    });
  }
  for (const collaborator of collaborators) {
    if (optionMeta.has(collaborator.handle)) continue;
    const name = collaborator.name || collaborator.handle;
    optionMeta.set(collaborator.handle, {
      handle: collaborator.handle,
      name,
      avatarUrl: collaborator.avatarUrl,
      initials: initialsFromName(name),
    });
  }

  const options: SelectOption[] = [...optionMeta.values()].map((meta) => ({
    value: meta.handle,
    label: meta.name,
    // Filter matches on name OR handle; keywords replaces the label as the
    // match target when present, so the name has to be repeated in here.
    keywords: `${meta.name} @${meta.handle} ${meta.handle}`,
    // At the cap, block adding more while still allowing removal of chosen ones.
    disabled: atCap && !selectedSet.has(meta.handle),
  }));

  function handleChange(nextHandles: string[]) {
    // Cap defensively — disabled options already stop additions past the cap.
    const next = nextHandles.slice(0, MAX_COLLABORATORS).map<CollaboratorDTO>((handle) => {
      const existing = existingByHandle.get(handle);
      if (existing) return existing;
      const member = memberByHandle.get(handle);
      if (member) {
        return {
          handle,
          type: "member",
          name: member.name,
          avatarUrl: member.avatarUrl ?? null,
          slug: handle,
        };
      }
      return { handle, type: "member", name: handle, avatarUrl: null, slug: null };
    });
    onChange(next);
  }

  function renderOption(option: SelectOption, state: SelectOptionState) {
    const meta = optionMeta.get(option.value);
    return (
      <span className={styles.optionRow}>
        <Avatar
          size={30}
          initials={meta?.initials ?? "?"}
          src={meta?.avatarUrl ?? undefined}
        />
        <span className={styles.optionText}>
          <span className={styles.optionName}>{meta?.name ?? option.value}</span>
          <span className={styles.optionHandle}>@{option.value}</span>
        </span>
        {state.selected && <FiCheck className={styles.optionCheck} aria-hidden />}
      </span>
    );
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label} id={labelId}>
        {t("subprofiles:itemEditor.collaboratorsLabel")}
      </span>
      <Select
        multiple
        value={selectedHandles}
        onChange={handleChange}
        options={options}
        labelledBy={labelId}
        aria-describedby={helperId}
        searchable
        placeholder={t("subprofiles:itemEditor.collaboratorsPlaceholder")}
        searchPlaceholder={t("subprofiles:itemEditor.collaboratorsSearchPlaceholder")}
        emptyText={t("subprofiles:itemEditor.collaboratorsEmpty")}
        renderOption={renderOption}
      />
      <span className={styles.helper} id={helperId}>
        {atCap
          ? t("subprofiles:itemEditor.collaboratorsCapHint")
          : t("subprofiles:itemEditor.collaboratorsHelper")}
      </span>
    </div>
  );
}
