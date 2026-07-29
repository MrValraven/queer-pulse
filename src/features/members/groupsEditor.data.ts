/**
 * Common roles offered as a free-text `<datalist>` in the groups editor. Like
 * LOOKING_FOR in the interests data, these are the literal stored values —
 * untranslated on purpose, since a member's role is their own words. The
 * datalist only suggests; anything the member types is kept verbatim.
 */
export const GROUP_ROLE_SUGGESTIONS: readonly string[] = [
  "Member",
  "Regular",
  "Organiser",
  "Host",
  "Facilitator",
  "Co-founder",
  "Mentor",
  "Volunteer",
];
