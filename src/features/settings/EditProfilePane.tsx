import { useState, type KeyboardEvent } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BioSection,
  IdentitySection,
  PronounsSection,
  SkillsSection,
  VisibilitySection,
} from "./EditProfileSections";
import { LinksSection } from "./LinksSection";
import { UsernameSection } from "./UsernameSection";

/** Section id of a change, so the host can list what was edited on save. */
export type ProfileSection =
  "identity" | "pronouns" | "bio" | "links" | "skills" | "visibility";

/**
 * Full profile editor — the rich Identity / Pronouns / Bio / Skills / Visibility
 * sections. Reads and writes the logged-in member's real profile draft via
 * `useProfile()`; local state is only for the transient skill/interest text
 * inputs and avatar object-URL cleanup. Reports any change via `onChange`
 * (with the section that changed) so the host can drive its save bar.
 */
export function EditProfilePane({
  onChange,
}: {
  onChange: (section: ProfileSection) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { draft, updateDraft } = useProfile();
  const { user } = useAuth();
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  // The avatar we received from the member's social login (Google), offered as a
  // one-tap restore whenever they have no photo set.
  const googlePhoto = user?.profile.avatarUrl ?? undefined;

  function handleRemovePhoto() {
    updateDraft({ photo: undefined });
    showToast(t("settings:editProfile.toast.photoRemoved"), "info");
    onChange("identity");
  }

  function handleUseGooglePhoto() {
    if (!googlePhoto) return;
    updateDraft({ photo: googlePhoto });
    showToast(t("settings:editProfile.toast.photoRestored"), "success");
    onChange("identity");
  }

  const selectedPronouns = draft.pronouns
    ? draft.pronouns
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  function togglePronoun(p: string) {
    const next = selectedPronouns.includes(p)
      ? selectedPronouns.filter((x) => x !== p)
      : [...selectedPronouns, p];
    updateDraft({ pronouns: next.join(", ") });
    onChange("pronouns");
  }

  function setName(displayName: string) {
    const trimmed = displayName.trimStart();
    const idx = trimmed.indexOf(" ");
    const first = idx === -1 ? trimmed : trimmed.slice(0, idx);
    const last = idx === -1 ? "" : trimmed.slice(idx + 1);
    updateDraft({ first, last });
    onChange("identity");
  }

  function addTag(key: "skills" | "interests", val: string) {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (key === "skills") {
      if (!draft.skills.some((s) => s.name === trimmed)) {
        updateDraft({ skills: [...draft.skills, { name: trimmed, meta: "" }] });
      }
      setSkillInput("");
    } else {
      if (!draft.tags.includes(trimmed)) {
        updateDraft({ tags: [...draft.tags, trimmed] });
      }
      setInterestInput("");
    }
    onChange("skills");
  }

  function removeTag(key: "skills" | "interests", val: string) {
    if (key === "skills") {
      updateDraft({ skills: draft.skills.filter((s) => s.name !== val) });
    } else {
      updateDraft({ tags: draft.tags.filter((t) => t !== val) });
    }
    onChange("skills");
  }

  function handleTagKey(
    e: KeyboardEvent<HTMLInputElement>,
    key: "skills" | "interests",
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(key, key === "skills" ? skillInput : interestInput);
    }
  }

  return (
    <>
      <IdentitySection
        displayName={`${draft.first} ${draft.last}`.trim()}
        location={draft.hood}
        photo={draft.photo}
        googlePhoto={googlePhoto}
        onNameChange={setName}
        onLocationChange={(v) => {
          updateDraft({ hood: v });
          onChange("identity");
        }}
        onUseGooglePhoto={handleUseGooglePhoto}
        onRemove={handleRemovePhoto}
      />
      <UsernameSection />
      <PronounsSection selected={selectedPronouns} onToggle={togglePronoun} />
      <BioSection
        bioText={draft.bio}
        occupation={draft.role}
        onBioChange={(v) => {
          updateDraft({ bio: v });
          onChange("bio");
        }}
        onOccupationChange={(v) => {
          updateDraft({ role: v });
          onChange("bio");
        }}
      />
      <LinksSection
        links={draft.socials}
        onChange={(socials) => {
          updateDraft({ socials });
          onChange("links");
        }}
      />
      <SkillsSection
        skills={draft.skills.map((s) => s.name)}
        interests={draft.tags}
        skillInput={skillInput}
        interestInput={interestInput}
        onSkillInputChange={setSkillInput}
        onInterestInputChange={setInterestInput}
        onAdd={addTag}
        onRemove={removeTag}
        onKeyDown={handleTagKey}
      />
      <VisibilitySection />
    </>
  );
}
