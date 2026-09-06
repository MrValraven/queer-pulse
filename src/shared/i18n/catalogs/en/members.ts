import type { Catalog } from "../../types";

/**
 * Members — the member directory + profile pages: browsing/search/filters,
 * a member's own profile (view + edit), the public-profile opt-in, badges &
 * perks (recognition), collections/saved items, vouching, the QR scanner,
 * and the drafts dashboard.
 *
 * Scope: platform chrome only. Mock member names, bios, pronouns,
 * self-described skills/tags, and the self-declared directory-filter
 * vocabulary (professions, disciplines, identities, neighbourhoods,
 * languages) stay in English — in live mode all of that comes over the wire
 * as somebody's own words or their own structured profile data, never
 * translated. The recognition/gamification domain (badge names, level
 * names, perk copy) is likewise content: it's fetched wholesale via
 * `useRecognition()` in live mode. See `docs/i18n/extraction-brief.md` §1.
 */
export const members: Catalog = {
  // ── Directory card (MemberCardBody) ───────────────────────────────────────
  "card.you": "You",
  "card.vouchCount_one": "{count} vouch",
  "card.vouchCount_other": "{count} vouches",
  "card.mutualsCount_one": "{count} mutual",
  "card.mutualsCount_other": "{count} mutuals",

  // ── Coarse "recently active" band (ActivityBandPill) ──────────────────────
  // Three buckets over a value stored as a MONTH. Never a date, never a time,
  // never a live-presence phrasing: the copy must not imply the platform knows
  // more than the month. A member with nothing recorded shows no line at all.
  "activityBand.thisMonth": "Active this month",
  "activityBand.last3Months": "Active in the last 3 months",
  "activityBand.dormant": "Not active recently",

  // ── Upload pipeline error messages (api/uploadProcessing.ts, api/useUploadImage.ts) ──
  "upload.error.unsupportedType":
    "That image type isn't supported. Use a JPEG, PNG, WebP or GIF.",
  "upload.error.tooLarge": "That image is too large. Keep it under {maxLabel}.",
  "upload.error.decodeFailed":
    "We couldn't read that image. Try a different file.",
  "upload.error.tooSmall":
    "This image is too small ({minWidth} × {minHeight}px minimum). Screenshots and photos saved from messaging apps are often shrunk. Try uploading the original photo from your camera roll instead.",
  "upload.error.stripFailed":
    "We couldn't safely process that image, so we didn't upload it. Try a different file.",
  "upload.error.retry": "We couldn't upload that image. Please try again.",

  // ── AvatarEditor ───────────────────────────────────────────────────────────
  "avatar.error.generic": "We couldn't add that photo. Please try again.",
  "avatar.uploading": "Uploading… {percent}%",
  "avatar.change": "Change photo",
  "avatar.add": "Add photo",
  "avatar.remove": "Remove photo",
  "avatar.useGoogle": "Use Google photo",
  "avatar.googleAdded": "Added your Google photo.",

  // ── AvatarEditor · photo picker modal (PhotoPickerModal) ───────────────────
  "avatar.picker.title": "Choose a photo",
  "avatar.picker.upload": "Upload from device",
  "avatar.picker.retry": "Try again",
  "avatar.picker.yourPhotos": "Your photos",
  "avatar.picker.empty":
    "No uploads yet. Upload one from your device or use your Google photo.",
  "avatar.picker.loadError": "We couldn't load your photos. Please try again.",
  "avatar.picker.inUse": "In use",
  "avatar.picker.useThis": "Use this photo",
  "avatar.picker.delete": "Delete photo",
  "avatar.picker.deleteConfirmTitle": "Delete this photo?",
  "avatar.picker.deleteConfirmBody":
    "This removes the upload for good. This can't be undone.",
  "avatar.picker.deleteConfirmBodyInUse":
    "This photo is currently used as your {usedAs}. Deleting it removes it there too. This can't be undone.",
  "avatar.picker.deleteConfirmCta": "Delete photo",
  "avatar.picker.deleted": "Photo deleted.",
  "avatar.picker.deleteError":
    "We couldn't delete that photo. Please try again.",

  // ── WorkItemEditor ─────────────────────────────────────────────────────────
  "workItem.error.generic": "We couldn't add that image. Please try again.",
  "workItem.imagePlaceholder": "Work",
  "workItem.uploading": "Uploading…",
  "workItem.change": "Change",
  "workItem.add": "Add image",
  "workItem.removeImage": "Remove image",
  "workItem.categoryPlaceholder": "Category (e.g. Identity)",
  "workItem.categoryLabel": "Work category",
  "workItem.titlePlaceholder": "Title",
  "workItem.titleLabel": "Work title",
  "workItem.yearPlaceholder": "Year",
  "workItem.yearLabel": "Work year",
  "workItem.linkPlaceholder": "Link (optional, e.g. https://bandcamp.com/…)",
  "workItem.linkLabel": "Work link",
  "workItem.secondLinkPlaceholder":
    "Second link (optional, e.g. https://bandcamp.com/…)",
  "workItem.secondLinkLabel": "Second work link",
  "workItem.linkedNote": "Links to a QueerPulse page. Not editable here.",
  "workItem.addSecondLink": "Add a second link",
  "workItem.removeSecondLink": "Remove second link",
  "workItem.remove": "Remove",

  // ── Profile page states (ProfilePage) ──────────────────────────────────────
  "profile.loading": "Loading profile…",
  "profile.blocked.title": "This profile isn't available",
  "profile.blocked.description":
    "You've blocked this member, so their profile is hidden. You can unblock them from your connections at any time.",
  "profile.blocked.manageAction": "Manage blocked members",
  "profile.goBack": "Go back",
  "profile.notFound.title": "This profile isn't here",
  "profile.notFound.description":
    "It may have been set to private, the member might have left, or this link could be out of date. Nothing's wrong on your end.",
  "profile.notFound.backAction": "Back to Members",
  "profile.loadError.title": "We couldn't load your profile",
  "profile.loadError.description":
    "Something went wrong fetching your profile. Check your connection and try again.",
  "profile.loadError.retryAction": "Try again",
  "profile.backToRoom": "Back to the room",
  // Back-link labels for every other page a profile can be opened from (see
  // profileBackTarget.ts); "generic" covers anything unmapped.
  "profile.backTo.generic": "Back",
  "profile.backTo.home": "Back to the homepage",
  "profile.backTo.communities": "Back to communities",
  "profile.backTo.community": "Back to the community",
  "profile.backTo.forum": "Back to the forum",
  "profile.backTo.thread": "Back to the conversation",
  "profile.backTo.gatherings": "Back to gatherings",
  "profile.backTo.gathering": "Back to the gathering",
  "profile.backTo.events": "Back to events",
  "profile.backTo.event": "Back to the event",
  "profile.backTo.feed": "Back to the feed",
  "profile.backTo.messages": "Back to messages",
  "profile.backTo.search": "Back to search",
  "profile.backTo.directory": "Back to the directory",
  "profile.backTo.connections": "Back to your connections",
  "profile.backTo.calendar": "Back to the calendar",
  "profile.backTo.changemakers": "Back to changemakers",
  "profile.previewBanner":
    "You're previewing your profile as a <strong>visitor</strong>.",
  "profile.exitPreview": "Exit preview",

  // ── Profile hero (ProfileSections) ─────────────────────────────────────────
  "profile.hero.verifiedBadge": "Verified member",
  "profile.hero.viewPhotoAria": "View photo of {name}",
  "profile.hero.curatorLink": "Cinema curator: view programming profile",
  "profile.hero.memberSince": "Member since {since}",
  "profile.hero.location": "{hood}, Lisbon",
  "profile.hero.editCta": "Edit profile",
  "profile.hero.previewCta": "View as visitor",
  "profile.hero.sayHelloCta": "Say hello",
  // PRD-03. When this member has already asked to connect, the hero answers
  // them instead of offering another hello the server would refuse.
  "profile.hero.acceptRequestCta": "Accept {first}'s request",
  "profile.hero.declineRequestCta": "Politely decline",
  "profile.hero.vouchedFor": "Vouched for {first}",
  "profile.hero.vouchedShort": "Vouched",
  "profile.hero.withdrawVouchCta": "Withdraw vouch",
  "profile.hero.vouchForCta": "Vouch for {first}",
  // The limited-profile note (PRD-203). ProfilesService.canViewFull limits
  // for exactly two reasons, carried to the client as ProfileCard.visibility,
  // so they get two different sets of words. A boundary being respected, and
  // never a rebuke to the viewer. The private branch must NOT promise more
  // content, because a private profile stays private to connections too: the
  // honest payoff there is messaging.
  // The forwarded-from-an-old-username note (PRD-204). Says BOTH usernames,
  // because the point is that the visitor can tell the address changed under
  // them: someone scanning a months-old membership card would otherwise read
  // the landing address as the one that was always printed. It never promises
  // the old link keeps working, since the forwarding expires with the 30-day
  // reclaim cooldown. `{oldSlug}` is the dead username, `{slug}` the live one;
  // neither carries an @ of its own, so the sigil is in the copy and a
  // translator can move it.
  "profile.moved.body":
    "You followed a link to @{oldSlug}. That username has changed, and this is where it now leads: @{slug}.",
  "profile.moved.announcement": "Forwarded from @{oldSlug} to @{slug}.",
  "profile.moved.ariaLabel": "Forwarded from an old username",
  "profile.moved.dismiss": "Dismiss this note",
  "profile.limited.ariaLabel": "About this profile",
  "profile.limited.network.title": "{name} shares more with their connections",
  "profile.limited.network.body":
    "The rest of this profile opens up once the two of you are connected.",
  "profile.limited.private.title": "{name} keeps their profile private",
  "profile.limited.private.body":
    "This is what everyone sees. Connecting will not open the rest, though it does let the two of you message each other.",
  // Defensive fallback for an unexpected visibility value. Deliberately
  // vague, because in this branch the client does not know which boundary
  // applies.
  "profile.limited.generic.title": "There is more to this profile",
  "profile.limited.generic.body":
    "{name} shares the rest with a smaller circle.",
  "profile.limited.askToConnect": "Ask to connect",
  "profile.limited.answerRequest": "Answer {name}'s request",
  "profile.limited.requestSent":
    "You have asked to connect. {name} will see it next time they are here.",
  "profile.hero.levelLabel": "Level {number}",
  "profile.hero.badgesChip": "{earned} / {total} badges",
  "profile.hero.perksChip": "{count} perks",
  "profile.hero.perksTitle": "Member perks",
  "profile.hero.hearPronunciation": "Hear how to say {name}'s name",
  "profile.hero.notHereFor.label": "Not here for",
  "profile.hero.writtenBy.en": "{name} wrote this in English",
  "profile.hero.writtenBy.pt": "{name} wrote this in Portuguese",

  // ── Mutual connections card (ProfileMutualsCard) ────────────────────────────
  "profile.mutuals.title": "Mutual connections",
  "profile.mutuals.one": "You both know <strong>{nameA}</strong>.",
  "profile.mutuals.two":
    "You both know <strong>{nameA}</strong> and <strong>{nameB}</strong>.",
  "profile.mutuals.many":
    "You both know <strong>{nameA}</strong>, <strong>{nameB}</strong> and {othersCount} more.",

  // ── "Say hello" modal (ProfileHelloModal) ───────────────────────────────────
  "profile.hello.title": "Say hello to {first}",
  "profile.hello.intro": "Pick what drew you in, or just start typing.",
  "profile.hello.reasonsLabel": "What drew you in",
  "profile.hello.draftTemplate":
    'Hi {first}, I saw you\'re open to "{reason}" and wanted to say hello. ',
  "profile.hello.draftLabel": "Your message",
  "profile.hello.draftPlaceholder": "Say what's on your mind.",
  "profile.hello.cancel": "Cancel",
  "profile.hello.send": "Send",
  "profile.hello.sentToast": "Sent. {first} usually replies soon.",
  "profile.hello.errorToast": "Couldn't open the message. Try again.",

  // ── Profile rail (ProfileRail, Task 3) ──────────────────────────────────────
  "profile.railLabel": "{name}'s profile summary",
  "profile.nav.title": "Sections",
  "profile.nav.label": "Jump to a section",
  "profile.nav.openTo": "Open to",
  "profile.nav.board": "On the board",
  "profile.nav.work": "Selected work",
  "profile.nav.subprofiles": "Also working as",
  "profile.nav.communities": "Communities",
  "profile.nav.places": "Places",
  "profile.nav.skills": "Skills & offerings",
  "profile.nav.groups": "Groups & circles",
  "profile.nav.shapings": "What shaped me",
  "profile.nav.related": "Also in the room",

  // ── Trust signals row + explainer (ProfileTrustSignals, ProfileTrustModal — Task 4) ──
  "profile.trust.verified": "Verified",
  "profile.trust.staff": "Staff",
  "profile.trust.vouchCount_one": "{count} vouch",
  "profile.trust.vouchCount_other": "{count} vouches",
  "profile.trust.modalTitle": "Trust signals",
  "profile.trust.modalIntro":
    "A quick guide to what you'll see on someone's profile.",
  "profile.trust.verifiedDescription":
    "This member's identity has been confirmed by QueerPulse.",
  "profile.trust.staffDescription":
    "This member is part of the QueerPulse team.",
  "profile.trust.vouchesTerm": "Vouches",
  "profile.trust.vouchesDescription":
    "Other members who have personally vouched for this person joining the community.",

  // ── Owner profile settings menu (ProfileSettingsMenu) ───────────────────────
  "profile.rail.settingsMenuAria": "Profile settings",
  "profile.rail.whoSeesWhat": "Who sees what",
  "profile.rail.bringMeBack": "Bring me back",
  "profile.rail.hideMe24h": "Hide me for 24h",
  "profile.rail.yourData": "Your data",
  "profile.rail.showQr": "Show QR code",

  // ── Profile QR modal (ProfileQrModal) ───────────────────────────────────────
  "profile.qr.title": "Your profile QR code",
  "profile.qr.intro": "Scan this to open your profile.",
  "profile.qr.save": "Save to photos",
  "profile.qr.doneCta": "Done",
  "profile.qr.mobileTriggerAria": "Show your profile QR code",

  // ── Profile stat row + content tabs (ProfileStatsRow, ProfileTabBar) ───────
  "profile.stats.vouches": "Vouches",
  "profile.stats.communities": "Communities",
  "profile.stats.personas": "Also as",
  "profile.tabs.about": "About",
  "profile.tabs.work": "Work",
  "profile.tabs.community": "Community",
  "profile.tabs.activity": "Activity",
  "profile.tabs.ariaLabel": "Profile sections",
  // Fallback shown inside a mobile profile tab whose sections all rendered
  // nothing (MobileProfileTabEmptyState). Deliberately tab-agnostic: it backs
  // all four tabs from one set of keys, and only the owner is offered a way
  // to act on it.
  "profile.tabs.empty.title": "Nothing here yet",
  "profile.tabs.empty.descriptionSelf":
    "Anything you add here will show up on your profile.",
  "profile.tabs.empty.descriptionPublic":
    "{first} hasn't added anything to this section yet.",
  "profile.tabs.empty.cta": "Edit profile",

  // ── Communities section (ProfileCommunities) ────────────────────────────────
  "profile.communities.title": "Communities",
  "profile.communities.subtitleSelf":
    "Communities you're featuring on your profile.",
  "profile.communities.subtitlePublic": "Communities {first} is part of.",
  "profile.communities.role.owner": "Owner",
  "profile.communities.role.coOwner": "Co-owner",
  "profile.communities.role.mod": "Moderator",
  "profile.communities.role.member": "Member",
  "profile.communities.empty.title": "Feature your communities",
  "profile.communities.empty.description":
    "Show the communities you own or belong to. Pick which ones to highlight in Edit profile.",
  "profile.communities.empty.cta": "Choose communities",

  // ── Profile content sections (ProfileContentSections, WorkEditor) ─────────
  "content.now.title": "Now",
  "content.now.subtitle": "What {first} is in the middle of",
  "content.now.openLabel": "Open to",
  "content.work.title": "Selected work",
  "content.work.subtitle": "A few things, handpicked",
  "content.work.viewLink": "View",
  "content.work.visitLink": "Visit",
  "content.board.title": "On the board",
  "content.board.subtitle": "What {first} is asking for and offering right now",
  "content.board.looking": "Looking",
  "content.board.offering": "Offering",

  // ── Barter board row (BoardRow) ────────────────────────────────────────
  "profile.board.postedAgo": "Posted {time}",
  "profile.board.expiresWarning_one": "Expires in {count} day",
  "profile.board.expiresWarning_other": "Expires in {count} days",
  "profile.board.foundIt": "Found, closed",
  "profile.board.foundItWithNote": "Found. {note}",
  "profile.board.markFoundCta": "Mark as found",
  "profile.board.markFoundCancel": "Cancel",
  "profile.board.markFoundConfirm": "Confirm",
  "profile.board.foundNoteLabel": "Note about how it was found",
  "profile.board.foundNotePlaceholder": "Add a note (optional)",
  "content.skills.title": "Skills & offerings",
  "content.skills.subtitle":
    "What {first} can help with, and swap on the barter board",
  "content.skills.barterCta": "See the full barter board",
  "content.groups.title": "Groups & circles",
  "content.groups.subtitle": "Where {first} shows up in the community",
  "content.shapings.title": "What shaped me",
  "content.shapings.subtitle":
    "Not interests. Formative texts, films, moments.",
  "content.activity.title": "Recent activity",
  "content.activity.subtitle": "Public moments from around the platform",
  "content.related.title": "Also in the room",
  "content.related.subtitle": "People nearby in craft or neighbourhood",

  // ── Shaping-meta labels + visibility labels (profileSections.data) ─────────
  "shaping.film": "A film",
  "shaping.book": "A book or text",
  "shaping.song": "A song or album",
  "shaping.moment": "A moment",
  "visibility.open": "Open to connect",
  "visibility.network": "Network only",
  "visibility.private": "Private",
  "visibility.hint.open": "Anyone on QueerPulse can say hello.",
  "visibility.hint.network": "Only people you're connected to.",
  "visibility.hint.private": "Members must request an intro first.",

  // ── Profile edit fields (EditableProfileHero, profileEditControls) ────────
  "profileEdit.field.statusVisibility": "Status & visibility",
  "profileEdit.field.name": "Name",
  "profileEdit.field.firstNameLabel": "First name",
  "profileEdit.field.firstPlaceholder": "First",
  "profileEdit.field.lastNameLabel": "Last name",
  "profileEdit.field.lastPlaceholder": "Last",
  "profileEdit.field.pronouns": "Pronouns",
  "profileEdit.field.neighbourhood": "Neighbourhood",
  "profileEdit.field.neighbourhoodPlaceholder": "e.g. Arroios",
  "profileEdit.field.bio": "Bio",
  "profileEdit.field.bioHelp":
    "The longer version, on your profile page. If you leave your short bio empty, your directory card borrows the opening of this.",
  "profileEdit.field.tags": "Tags",
  // ── Field of work / profession picker (WorkFieldPicker) ─────────────────────
  // Rendered in three places — the profile editor, onboarding's "what do you
  // do" step, and Settings → Interests — so the chip vocabulary reads the same
  // wherever a member meets it.
  "profileEdit.work.label": "What you do",
  "profileEdit.work.help":
    "Public. Shown on your profile, and how people find you under “What they do” and “Profession” in the member directory.",
  "workPicker.fieldHeading": "Your field",
  "workPicker.professionHeading": "Your role",
  "workPicker.professionPrompt":
    "Pick a field above to see the roles within it.",
  "profileEdit.field.addSkillPlaceholder": "Search skills…",
  "profileEdit.field.links": "Links",
  "profileEdit.field.photo": "Photo",
  "profileEdit.field.lookingFor": "Looking for",
  "profileEdit.customPronounPlaceholder": "custom…",
  "profileEdit.customPronounsLabel": "Custom pronouns",
  "profileEdit.searchTagPlaceholder": "Search skills…",
  "profileEdit.popularTagsLabel": "Popular",

  // ── Browse-all-tags modal (ProfileTagBrowserModal) ────────────────────────
  "profileEdit.tagBrowser.open": "Browse all",
  "profileEdit.tagBrowser.title": "All tags",
  "profileEdit.tagBrowser.selectedCount_one": "{count} tag on your profile",
  "profileEdit.tagBrowser.selectedCount_other": "{count} tags on your profile",
  "profileEdit.tagBrowser.searchLabel": "Search tags",
  "profileEdit.tagBrowser.searchPlaceholder": "Search tags…",
  "profileEdit.tagBrowser.noMatches": "No tags match “{query}”.",
  "profileEdit.tagBrowser.done": "Done",
  "profileEdit.tagCategory.design": "Design & visual craft",
  "profileEdit.tagCategory.words": "Words & communication",
  "profileEdit.tagCategory.tech": "Tech",
  "profileEdit.tagCategory.community": "Community, care & organising",
  "profileEdit.tagCategory.practical": "Practical & professional",
  "profileEdit.tagCategory.performance": "Music & performance",
  "profileEdit.addTagLabel": "Add a tag",
  "profileEdit.removeTagLabel": "Remove {tag}",
  "profileEdit.visibilityGroupLabel": "Profile visibility",
  "profileEdit.discardConfirm":
    "You have unsaved changes. Discard them and leave editing?",
  "profileEdit.validation.nameRequired": "Please enter your first name.",
  "profileEdit.validation.invalidUrl":
    "That doesn't look like a valid link or handle.",

  // ── Pronunciation, Portuguese bio, boundary note (ProfileEditDetailFields) ──
  "profileEdit.pronunciation.label": "Name pronunciation",
  "profileEdit.pronunciation.help":
    "Spell it out phonetically so people get it right. Shown next to your name with a 'hear it' button.",
  "profileEdit.pronunciation.placeholder": "e.g. kuh-tuh-REE-nuh",
  "profileEdit.bioPt.label": "Bio in Portuguese",
  "profileEdit.bioPt.help":
    "An optional Portuguese version of your bio. Add one and visitors can switch between languages.",
  "profileEdit.bioPt.placeholder":
    "Write it in Portuguese if you'd like people to be able to switch.",
  "profileEdit.notHereFor.label": "Not here for",
  "profileEdit.notHereFor.help":
    "A boundary you'd like people to know about before they reach out.",
  "profileEdit.notHereFor.placeholder": "e.g. Networking for my day job",

  // ── Short bio field (ProfileShortBioField) ─────────────────────────────────
  "profileEdit.shortBio.label": "Short bio",
  "profileEdit.shortBio.help":
    "The line people read in the members directory, before they open your profile.",
  "profileEdit.shortBio.placeholder":
    "A line or two on who you are and what you're around for.",
  "profileEdit.shortBio.counter": "{length} / {max}",
  // Appended after the "{length} / {max}" counter, so it opens with its own
  // separator rather than an em dash.
  "profileEdit.shortBio.overLimit": "· your card shows the first two lines",

  // ── Now status + Open to (ProfileNowField, OpenToEditor) ───────────────────
  "profileEdit.now.label": "Now",
  "profileEdit.now.help":
    "What you're in the middle of. Change it as often as you like. Leave it empty and this section stays off your profile.",
  "profileEdit.now.placeholder":
    "Finishing a zine, learning to weld, looking for a rehearsal room…",
  "profileEdit.openTo.label": "Open to",
  "profileEdit.openTo.help":
    "What you'd welcome right now. People can tap these to reach you about that thing specifically.",
  "profileEdit.openTo.presetsLabel": "Things you're open to",
  "profileEdit.openTo.addPlaceholder": "Or say it your own way…",
  "profileEdit.openTo.addLabel": "Add something you're open to",
  "profileEdit.openTo.removeLabel": "Remove {label}",

  // ── Looking for (LookingForEditor) ──────────────────────────────────────────
  "profileEdit.lookingFor.heading": "What are you looking for here?",
  "profileEdit.lookingFor.helper": "Select as many as you like.",
  "profileEdit.lookingFor.toggleLabel":
    "Show what I'm looking for on my profile",

  // ── Edit bar (ProfileEditBar) ───────────────────────────────────────────────
  "profileEdit.bar.unsaved": "You're editing your profile, unsaved changes",
  "profileEdit.bar.unsavedIn": "Unsaved changes in {sections}",
  "profileEdit.bar.discard": "Discard",
  "profileEdit.bar.saving": "Saving…",
  "profileEdit.bar.tryAgain": "Try again",
  "profileEdit.bar.save": "Save profile",
  "profileEdit.bar.savedBanner":
    "Saved. <strong>Your profile is live.</strong>",

  // ── Social links (SocialLinksRow, SocialLinksEditor) ───────────────────────
  "social.addLinks": "Add links",
  "social.editLinksLabel": "Edit your links",
  "social.editLinks": "Edit",
  "social.platformLabel": "Link platform",
  "social.linkFor": "{platform} link",
  "social.removeLinkFor": "Remove {platform} link",
  "social.addLink": "Add a link",
  "social.other": "Other link",

  // ── Work editor (WorkEditor) ────────────────────────────────────────────────
  "profileEdit.work.add": "Add work",

  // ── Board editor (BoardEditor) ──────────────────────────────────────────────
  "profileEdit.board.subtitle": "What you're asking for and offering right now",
  "profileEdit.board.add": "Add to the board",
  "profileEdit.board.kindLabel": "Looking or offering",
  "profileEdit.board.titlePlaceholder": "e.g. A studio to borrow",
  "profileEdit.board.titleLabel": "What you're looking for or offering",
  "profileEdit.board.removeLabel": "Remove {title}",

  // ── Skills editor (SkillsEditor) ────────────────────────────────────────────
  "profileEdit.skills.subtitle":
    "What you can help with, and swap on the barter board",
  "profileEdit.skills.add": "Add",
  "profileEdit.skills.namePlaceholder": "A skill or service…",
  "profileEdit.skills.nameLabel": "Skill or service",
  "profileEdit.skills.metaPlaceholder": "Detail (optional)",
  "profileEdit.skills.metaLabel": "Skill detail",
  "profileEdit.skills.removeLabel": "Remove {name}",

  // ── Groups editor (GroupsEditor) ────────────────────────────────────────────
  "profileEdit.groups.subtitle":
    "Groups, circles and collectives you're part of",
  "profileEdit.groups.add": "Add a group",
  "profileEdit.groups.namePlaceholder": "Group or circle name",
  "profileEdit.groups.nameLabel": "Group name",
  "profileEdit.groups.rolePlaceholder": "Your role",
  "profileEdit.groups.roleLabel": "Your role",
  "profileEdit.groups.removeLabel": "Remove {name}",

  // ── Shapings editor (ShapingsEditor) ────────────────────────────────────────
  "profileEdit.shapings.subtitle":
    "Up to one film, book, song and moment that shaped you",
  "profileEdit.shapings.titlePlaceholder": "Title",
  "profileEdit.shapings.titleLabel": "{label} title",
  "profileEdit.shapings.notePlaceholder": "Why it stuck with you",
  "profileEdit.shapings.noteLabel": "{label} note",

  // ── Hero vouch row (HeroVouchRow) ───────────────────────────────────────────
  "hero.vouch.namesPlusYou": "{names}, plus you",
  "hero.vouch.youOnly": "you",
  "hero.vouch.anonymous": "Anonymous",
  "hero.vouch.by": "Vouched for by <b>{names}</b>.",
  "hero.vouch.onlyNumberMatters": "A familiar face vouched for them.",
  "hero.vouch.onlyNumberMattersSelf": "A familiar face vouched for you.",
  // The count-only branch (PRD-201). A member who hides their voucher roster is
  // still served the true count, so the hero states the number rather than
  // falling into the empty branch and telling the viewer there are none while
  // ProfileTrustSignals prints the real figure a few lines below.
  "hero.vouch.countOnly_one": "Vouched for by <b>{count} member</b>.",
  "hero.vouch.countOnly_other": "Vouched for by <b>{count} members</b>.",
  // Shown to a VISITOR. This member has vouches; the viewer simply cannot see
  // who. It must not read as an apology or as a prompt to vouch.
  "hero.vouch.namesHidden": "The names are private. Only the number is public.",
  // Shown to the OWNER, whom the backend exempts from their own roster gate, so
  // they see faces a visitor never will. This is what tells them the row is not
  // what a stranger reads.
  "hero.vouch.namesHiddenSelf":
    "Only you can see who vouched for you. Visitors see the number.",
  "hero.vouch.emptySelf":
    "No vouches yet. They'll appear here as people who know you add their name. The only number that matters.",
  "hero.vouch.emptyOther":
    "No vouches for {first} yet. If you know them, yours could be the first.",
  // The viewer-relative trust cue. Shown only when the count is one or more,
  // and the backend withholds it entirely when this member has hidden their
  // voucher roster.
  "hero.vouch.mutualVouchers_one": "{count} member you know vouched",
  "hero.vouch.mutualVouchers_other": "{count} members you know vouched",

  // ── "Here for" intent line (ProfileHero) ────────────────────────────────────
  "hero.hereFor.label": "Here for",
  "hero.hereFor.hintPublic": "shown on your profile",
  "hero.hereFor.hintPrivate": "only you can see this",

  // ── Hero tags row (ProfileHeroMain) ─────────────────────────────────────────
  "hero.tags.label": "Tags",

  // ── Hero "works in" row (ProfileWorkRow) ────────────────────────────────────
  "hero.worksIn.label": "Works in",

  // ── Public profile page (PublicProfilePage) ─────────────────────────────────
  // ── /public-profile/:slug — the logged-out, indexable public profile ──────
  // The not-found copy is load-bearing: an unpublished profile, a deactivated
  // member and a slug that never existed must all read identically. Nothing
  // here may hint that someone is here but hidden — that would make this page
  // a way to confirm a person is on QueerPulse. It reads like any dead link.
  "publicBySlug.meta.title": "{name} · QueerPulse",
  "publicBySlug.aboutHeading": "About",
  "publicBySlug.linksHeading": "Elsewhere",
  "publicBySlug.workHeading": "Work",
  "publicBySlug.activityHeading": "Recent activity",
  "publicBySlug.activityEmpty": "Nothing public just yet.",
  "publicBySlug.joinTitle": "QueerPulse is invite-only",
  "publicBySlug.joinBody":
    "A place queer Lisbon gathers: no ads, no algorithm. You need someone to bring you in, or you can ask us directly.",
  "publicBySlug.notFound.metaTitle": "Not found · QueerPulse",
  "publicBySlug.notFound.title": "Nothing at this link",
  "publicBySlug.notFound.description":
    "There's nothing here to show. Worth double-checking the address you followed.",
  "publicBySlug.notFound.backCta": "Go to QueerPulse",

  "publicProfile.hereForTitle": "What I'm <em>here for</em>",
  "publicProfile.visiblePublicly": "Visible publicly",
  "publicProfile.writing.heading": "Public <em>writing</em>",
  "publicProfile.writing.meta_one": "{count} piece · QueerPulse Magazine",
  "publicProfile.writing.meta_other": "{count} pieces · QueerPulse Magazine",
  "publicProfile.hosting.heading": "Public <em>hosting</em>",
  "publicProfile.hosting.meta": "Open events anyone can RSVP to",
  "publicProfile.locked.postsHeading": "Posts & <em>messages</em>",
  "publicProfile.membersOnly": "Members only",
  "publicProfile.locked.postsTitle":
    "Posts, replies, and DMs are <em>members-only.</em>",
  "publicProfile.locked.postsBody":
    "QueerPulse keeps day-to-day community life behind a sign-in to protect members. Become one and {first}'s feed unlocks immediately, including the ability to message {first}.",
  "publicProfile.requestInviteArrow": "Request an invite",
  "publicProfile.locked.connectionsHeading": "Connections",
  "publicProfile.locked.connectionsTitle":
    "Who {first} knows, <em>privately.</em>",
  "publicProfile.locked.connectionsBody":
    "To protect members' networks, we don't show connection lists publicly. Sign in to see your mutuals with {first}.",
  "publicProfile.bottomCta.title": "Want the <em>full picture?</em>",
  "publicProfile.bottomCta.body":
    "QueerPulse is invite-based. {firstName} can vouch for you if you've met in person. Or request an invite from us directly.",

  // ── Public profile sections (PublicProfileSections) ─────────────────────────
  "publicProfile.preview.ownerLabel":
    "Preview of your public profile · this is how non-members would see you",
  "publicProfile.preview.notYet":
    "Public profiles aren't open yet. This preview is only visible to you.",
  "publicProfile.pill.live": "On",
  "publicProfile.pill.off": "Off",
  "publicProfile.preview.backToProfile": "Back to your profile",
  "publicProfile.preview.guestLabel":
    "You're not signed in · viewing the <b>public version</b> of this profile",
  "publicProfile.head.eyebrow": "Public profile · @{slug}",
  "publicProfile.head.location": "<b>{hood}</b>, Lisbon",
  "publicProfile.head.memberSince": "Member since <b>{since}</b>",
  "publicProfile.head.vouchedFor": "<b>Vouched-for</b> by {count} members",
  "publicProfile.head.requestInviteCta": "Request an invite to connect",
  "publicProfile.head.ctaNote":
    "{firstName}'s full profile, posts, and direct-message access open up once you're a member.",

  // ── Public profile control (PublicProfileModal) ──────────────────────────
  "publicProfile.control.locked.eyebrow": "Public profile · locked",
  "publicProfile.control.locked.title":
    "A public profile is something you <em>grow into.</em>",
  "publicProfile.control.locked.lede":
    "Public profiles are for members who help carry the public side of QueerPulse: writers, hosts, organisers. Here's where you are:",
  "publicProfile.control.unlocked.eyebrow": "Public profile · unlocked",
  "publicProfile.control.unlocked.title":
    "You can share a <em>public profile.</em>",
  "publicProfile.control.unlocked.lede":
    "A public profile will let people who aren't members yet find your writing, your events, and a way to reach you, without opening the rest of the community.",
  "publicProfile.control.notYet":
    "Public profiles aren't open yet, so nothing here is published anywhere and nobody outside QueerPulse can see you. We're remembering what you choose, and it's what we'll turn on for you the day they open.",
  "publicProfile.control.switchLabel": "Show a public profile",
  "publicProfile.control.statusOn": "On: saved for when public profiles open.",
  "publicProfile.control.statusOff": "Off: nothing of yours goes public.",
  "publicProfile.control.viewCta": "Preview your public profile",
  "publicProfile.control.toast.hidden":
    "Saved: your profile stays members-only",
  "publicProfile.control.toast.live":
    "Saved: we'll turn this on when public profiles open",
  "publicProfile.control.toast.failed":
    "We couldn't save that. Your preference is unchanged. Try again in a moment.",
  "publicProfile.control.checking.title": "Checking <em>where you are</em>",
  "publicProfile.control.checking.body":
    "One moment. We're totting up your contributions, vouches, and time here.",
  "publicProfile.control.error.title": "We couldn't check just now",
  "publicProfile.control.error.body":
    "Something got in the way of loading your progress. It's not you. Try again in a moment.",
  "publicProfile.control.error.retry": "Try again",

  // ── Public-profile hero badge (PublicProfileBadge) ──────────────────────────
  "publicProfile.badge.label": "Go public",

  // ── Public-eligibility criteria (publicFigure.ts) ───────────────────────────
  "publicProfile.eligibility.verified.hint":
    "Confirm your identity so people know it's really you.",
  "publicProfile.eligibility.tenure.label": "A season on QueerPulse",
  "publicProfile.eligibility.tenure.hint":
    "Public profiles open up after your first 90 days here.",
  "publicProfile.eligibility.tenure.remaining_one": "{count} day to go",
  "publicProfile.eligibility.tenure.remaining_other": "{count} days to go",
  "publicProfile.eligibility.family.contribution.label": "Public contribution",
  "publicProfile.eligibility.family.contribution.hint":
    "Publishing pieces, hosting open events & personas",
  "publicProfile.eligibility.family.trust.label": "Community trust",
  "publicProfile.eligibility.family.trust.hint":
    "Vouches, endorsements & connections from other members",
  "publicProfile.eligibility.family.participation.label":
    "Sustained participation",
  "publicProfile.eligibility.family.participation.hint":
    "Attending gatherings, posting & staying active recently",
  "publicProfile.eligibility.progress.pct":
    "{pct}% of the way to a public profile",
  "publicProfile.eligibility.gates.heading": "First, the essentials",
  "publicProfile.eligibility.families.heading": "Then, how it adds up",
  "publicProfile.eligibility.actions.heading": "What moves you forward",
  "publicProfile.eligibility.action.verify": "Verify your identity",
  "publicProfile.eligibility.action.tenure":
    "Keep showing up. Time does this one",
  "publicProfile.eligibility.action.host":
    "Publish a piece or host an open event",
  "publicProfile.eligibility.action.vouch":
    "Ask a member who knows you to vouch",
  "publicProfile.eligibility.action.attend": "Come to a gathering or two",
  "publicProfile.eligibility.action.points": "+{points}",
  "publicProfile.eligibility.family.amount": "{points} / {cap}",
  "publicProfile.eligibility.standing.blocked":
    "This can't open right now. Nothing else to do here. It'll sort itself out.",

  // ── Public-profile contribution stat labels (currentUserPublic.data) ──────
  "publicProfile.stat.poemsPublished": "Poems published",
  "publicProfile.stat.eventsHosted": "Events hosted",
  "publicProfile.stat.yearsOnPlatform": "Year on QueerPulse",
  "publicProfile.stat.membersReached": "Members reached",

  // ── Public-profile preview, live mode: nothing is published yet ─────────────
  //    (`GET /public/profiles/:slug` answers 404 until the member turns the
  //    public profile on, so this is the ordinary state, never an error).
  "publicProfile.previewOff.title": "Your public profile isn't on yet",
  "publicProfile.previewOff.description":
    "Turn it on and the open web sees your name, pronouns, tagline, bio, the links and work you chose to show, and your recent public activity. Nothing else leaves the members' side.",
  "publicProfile.previewOff.cta": "Open profile settings",

  // ── Global search (SearchPage) ──────────────────────────────────────────────
  "search.type.member": "Members",
  "search.type.community": "Communities",
  "search.type.event": "Events",
  "search.type.forum": "Forum",
  // Reply BODIES, kept apart from thread titles: a hit here is an answer
  // someone already wrote, which is a different thing to find (SOC-08).
  "search.type.forumPost": "Forum replies",
  "search.type.business": "Businesses",
  "search.type.magazine": "Magazine",
  "search.type.job": "Jobs",
  "search.type.housing": "Housing",
  "search.type.resource": "Resources",
  "search.type.subprofile": "Subprofiles",
  "search.type.board": "Board",
  "search.type.topic": "Topics",
  "search.type.page": "Pages",
  "search.type.all": "All",
  // ── Sign-in prompt (SearchResults) — shown to logged-out members in live mode ──
  "search.signInRequired.badge": "Sign in",
  "search.signInRequired.title": "Search is for <em>members</em>",
  "search.signInRequired.body":
    "Sign in to search people, communities, events, the forum, and local businesses.",
  "search.recentSearches": "Recent searches",
  "search.browseTopics": "Browse topics",
  "search.upcomingEvents": "Upcoming events",
  "search.jumpTo": "Jump to <b>{name}</b>",
  "search.seeAllIn": "See all in {category}",
  // ── Paging one category past the first page (SearchLoadMore, SOC-08) ──
  "search.loadMore.action": "Load more results",
  "search.loadMore.loading": "Loading…",
  "search.loadMore.retry": "Try again",
  "search.loadMore.failed": "That page did not load.",
  "search.loadMore.end": "That is everything for this search.",
  "search.resultCount_one": `<b>{count}</b> result for "<b>{query}</b>"`,
  "search.resultCount_other": `<b>{count}</b> results for "<b>{query}</b>"`,
  "search.empty.title": "Nothing found",
  "search.empty.body":
    "Try a different word: member name, neighbourhood, skill, or type of gathering.",
  "search.loadError.title": "We couldn't run <em>that search</em>",
  "search.loadError.body":
    "The request didn't come back. This is on our side, and your words were fine. Try again in a moment.",
  "search.hero.label": "Search",
  "search.hero.title": "Find anyone, anything <em>in the community.</em>",
  "search.hero.placeholder": "Members, gatherings, communities, board posts…",

  // ── Member directory filter (MemberDirectoryFilterPage) ────────────────────
  "directory.eyebrow": "Members · advanced filter",
  "directory.findPrefix": "Find",
  "directory.memberCountSuffix_one": "member,",
  "directory.memberCountSuffix_other": "members,",
  "directory.findSuffix": "exactly.",
  "directory.lead":
    "Filter by what they offer, where they're based, what they're <b>open to</b>. The same data goes both ways. Members appear here because they opted in to be findable for these reasons.",
  "directory.toast.filtersCleared": "Filters cleared",
  "directory.showingPrefix": "Showing",
  "directory.showingOf": "of",
  "directory.memberCountLabel_one": "member",
  "directory.memberCountLabel_other": "members",
  "directory.sortLabel": "Sort",
  "directory.sort.recentlyJoined": "Recently joined",
  "directory.sort.recentlyActive": "Recently active",
  "directory.sort.closestMutuals": "Closest mutuals",
  "directory.sort.aToZ": "A to Z",
  "directory.sort.mostVouched": "Most vouched",
  "directory.removeChipLabel": "Remove {label}",
  // The field's ACCESSIBLE NAME (PRD-205). SearchInput renders no visible
  // <label>, so this is the only name a screen reader and the BUDGET=0 a11y
  // gate ever see. It must read as a label, never as a hint, and must not be
  // shortened to "Search". The placeholder deliberately says something else.
  "directory.searchLabel": "Search members by name",
  "directory.searchPlaceholder": "Name, or part of one",
  // Reworded because the name search now feeds hasActiveFilters, so this is
  // also where a search matching nobody lands. The old copy said "your
  // filters" to a member who may have typed a name and touched no filter.
  // The backend matches a substring, so "fewer letters" is real advice.
  "directory.emptyFiltered.title": "Nothing matches yet",
  "directory.emptyFiltered.description":
    "Nobody matches that name and those filters right now. Try fewer letters, or loosen a filter, and more people will show up.",
  "directory.clearFiltersCta": "Clear filters",
  "directory.emptyAll.title": "No members here yet",
  "directory.emptyAll.description":
    "This directory is still filling up. As people join QueerPulse and opt in to being findable, they'll show up here. Check back soon.",
  "directory.error.title": "We couldn't load the directory",
  "directory.error.description":
    "Something went wrong finding members just now. This isn't an empty directory. Give it another try in a moment.",
  "directory.error.retry": "Try again",
  "directory.loadingMore": "Loading…",
  "directory.loadMoreCta": "Load more members",
  "directory.filtersCta": "Filters",
  "directory.hideFiltersCta": "Hide filters",
  "directory.filtersSheetLabel": "Filter members",
  "directory.showResultsCta_one": "Show {count} member",
  "directory.showResultsCta_other": "Show {count} members",

  // ── Directory filter sidebar (MemberFilterCards) ────────────────────────────
  "directory.filter.openToTitle": "What they're open to",
  "directory.filter.hoodTitle": "Where they're based",
  "directory.filter.identityTitle": "Identity · self-declared",
  "directory.filter.ageTitle": "Member age",
  "directory.filter.fromPlaceholder": "From",
  "directory.filter.yearsPlaceholder": "Years",
  "directory.filter.ageNote":
    'Years on QueerPulse. <em>Newer members appear with a "first year" badge by default.</em>',
  "directory.filter.languagesTitle": "Languages",
  // The accessible name of a filter option that carries an availability count.
  // The visible badge is aria-hidden precisely so this can be a sentence: a
  // screen reader hearing the raw markup would get "Mentoring 7", which reads
  // as a quantity of Mentorings rather than as how many members are there.
  "directory.filter.optionWithCount_one": "{label}, {count} member",
  "directory.filter.optionWithCount_other": "{label}, {count} members",
  "directory.clearAllFiltersCta": "Clear all filters",
  "directory.appliedCount_one": "{count} applied",
  "directory.appliedCount_other": "{count} applied",

  // ── Profession filter (FilterProfessions) ───────────────────────────────────
  "directory.filter.whatTheyDoTitle": "What they do",
  "directory.filter.searchPlaceholder": "Search a field or profession…",
  "directory.filter.searchAriaLabel": "Search fields and professions",
  "directory.filter.noFieldMatch": 'No field matches "{query}".',
  "directory.filter.professionTitle": "Profession",
  "directory.filter.noProfessionMatch": 'No profession matches "{query}".',
  "directory.filter.matchingSearch": "Matching your search across every field.",
  "directory.filter.showingWithinField_one":
    "Showing professions within your selected field.",
  "directory.filter.showingWithinField_other":
    "Showing professions within your selected fields.",
  "directory.filter.pickField":
    "Pick a field above, or search to find any profession.",

  // ── "What they do" field chips (memberDirectoryFilter.data → DISCIPLINES).
  //    The chip's *stored* value is the stable id (`design`, `tech`, …); this
  //    label is resolved at render only — never compared against or stored
  //    (i18n §5.1: translating these must never change what a member matches).
  "directory.discipline.design": "Design",
  "directory.discipline.editorial": "Editorial",
  "directory.discipline.healthcare": "Healthcare",
  "directory.discipline.legal": "Legal",
  "directory.discipline.education": "Education",
  "directory.discipline.tech": "Tech",
  "directory.discipline.photo": "Photo",
  "directory.discipline.film": "Film",
  "directory.discipline.performance": "Performance",
  "directory.discipline.music": "Music",
  "directory.discipline.architecture": "Architecture",
  "directory.discipline.community": "Community",
  "directory.discipline.curation": "Curation",
  "directory.discipline.food": "Food",
  "directory.discipline.craft": "Craft",
  "directory.discipline.science": "Science",

  // ── "Profession" chips (memberDirectoryFilter.data → PROFESSIONS_BY_FIELD).
  //    Same stored-id / rendered-label split as the disciplines above.
  "directory.profession.graphicDesigner": "Graphic Designer",
  "directory.profession.uxDesigner": "UX Designer",
  "directory.profession.illustrator": "Illustrator",
  "directory.profession.artDirector": "Art Director",
  "directory.profession.editor": "Editor",
  "directory.profession.journalist": "Journalist",
  "directory.profession.copywriter": "Copywriter",
  "directory.profession.translator": "Translator",
  "directory.profession.poet": "Poet",
  "directory.profession.therapist": "Therapist",
  "directory.profession.psychologist": "Psychologist",
  "directory.profession.nurse": "Nurse",
  "directory.profession.gp": "GP",
  "directory.profession.physiotherapist": "Physiotherapist",
  "directory.profession.peerCounsellor": "Peer Counsellor",
  "directory.profession.communityHealthWorker": "Community Health Worker",
  "directory.profession.immigrationLawyer": "Immigration Lawyer",
  "directory.profession.familyLawyer": "Family Lawyer",
  "directory.profession.paralegal": "Paralegal",
  "directory.profession.legalAdvocate": "Legal Advocate",
  "directory.profession.teacher": "Teacher",
  "directory.profession.workshopFacilitator": "Workshop Facilitator",
  "directory.profession.researcher": "Researcher",
  "directory.profession.tutor": "Tutor",
  "directory.profession.softwareEngineer": "Software Engineer",
  "directory.profession.backendEngineer": "Backend Engineer",
  "directory.profession.dataScientist": "Data Scientist",
  "directory.profession.productManager": "Product Manager",
  "directory.profession.portraitPhotographer": "Portrait Photographer",
  "directory.profession.photojournalist": "Photojournalist",
  "directory.profession.retoucher": "Retoucher",
  "directory.profession.documentaryFilmmaker": "Documentary Filmmaker",
  "directory.profession.filmmaker": "Filmmaker",
  "directory.profession.cinematographer": "Cinematographer",
  "directory.profession.filmEditor": "Film Editor",
  "directory.profession.choreographer": "Choreographer",
  "directory.profession.dancer": "Dancer",
  "directory.profession.theatreMaker": "Theatre Maker",
  "directory.profession.performanceArtist": "Performance Artist",
  "directory.profession.musicProducer": "Music Producer",
  "directory.profession.dj": "DJ",
  "directory.profession.sessionMusician": "Session Musician",
  "directory.profession.soundDesigner": "Sound Designer",
  "directory.profession.musicIndustryAR": "Music Industry A&R",
  "directory.profession.architect": "Architect",
  "directory.profession.urbanDesigner": "Urban Designer",
  "directory.profession.interiorArchitect": "Interior Architect",
  "directory.profession.communityOrganiser": "Community Organiser",
  "directory.profession.housingOrganiser": "Housing Organiser",
  "directory.profession.housingAdvocate": "Housing Advocate",
  "directory.profession.supportCoordinator": "Support Coordinator",
  "directory.profession.accessibilityAdvocate": "Accessibility Advocate",
  "directory.profession.activist": "Activist",
  "directory.profession.curator": "Curator",
  "directory.profession.archivist": "Archivist",
  "directory.profession.galleryDirector": "Gallery Director",
  "directory.profession.chef": "Chef",
  "directory.profession.barista": "Barista",
  "directory.profession.baker": "Baker",
  "directory.profession.supperClubHost": "Supper Club Host",
  "directory.profession.ceramicist": "Ceramicist",
  "directory.profession.woodworker": "Woodworker",
  "directory.profession.textileArtist": "Textile Artist",
  "directory.profession.biologist": "Biologist",
  "directory.profession.ecologist": "Ecologist",
  "directory.profession.labResearcher": "Lab Researcher",

  // ── Shared "open to" vocabulary (openTo.data → OPEN_TO_PRESETS). One id →
  //    label, reused by the profile chips (content.now.openLabel), the
  //    directory filter's checkbox rows (directory.filter.openToTitle), and
  //    the connect form's reason select (connect:form.reasonOpenToGroup).
  //    Phrased as the member would say it, not a marketplace category.
  "openTo.collaborating": "Collaborating",
  "openTo.mentoring": "Mentoring",
  "openTo.casualMeetups": "Coffee and long dinners",
  "openTo.commissions": "Commissions",
  "openTo.clientWork": "New clients",
  "openTo.referrals": "Referrals",
  "openTo.swaps": "Skill swaps",
  "openTo.studioVisits": "Studio visits",
  "openTo.interviewees": "Being interviewed",

  // ── "Where they're based" hood filter (memberDirectoryFilter.data →
  //    NEIGHBOURHOODS). Real neighbourhood names are proper nouns and are
  //    rendered directly, with no labelKey — only this "show everyone"
  //    convenience option is chrome and needs one.
  "directory.hood.all": "All of Lisbon",

  // ── "Identity · self-declared" filter chips (memberDirectoryFilter.data →
  //    IDENTITY_OPTIONS). Same stored-id / rendered-label split. NOTE:
  //    "qpoc" is deliberately left untranslated pending native pt-PT review
  //    of race/POC terminology (i18n sweep §6) — see the sweep report.
  "directory.identity.transNonBinary": "Trans & non-binary",
  "directory.identity.lesbian": "Lesbian",
  "directory.identity.gay": "Gay",
  "directory.identity.biPan": "Bi / Pan",
  "directory.identity.aroAce": "Aro / ace spectrum",
  "directory.identity.qpoc": "QPOC / queer of colour",
  "directory.identity.disabledChronicIllness": "Disabled / chronic illness",

  // ── Directory card preview (DirectoryCardPreview) ───────────────────────────
  "directory.preview.caption": "How your card reads in the directory",
  "directory.preview.borrowedNote":
    "Nothing here yet, so your card borrows the opening of your bio. Write a short bio and it'll use that instead.",

  // ── Command palette (CommandPalette) ────────────────────────────────────────
  "commandPalette.ariaLabel": "Search QueerPulse",
  "commandPalette.escKey": "esc",
  "commandPalette.placeholder": "Search members, gatherings, communities…",
  "commandPalette.signInBody": "Sign in to search across QueerPulse.",
  "commandPalette.noMatches": "No matches. Try another word.",
  "commandPalette.seeAllResults": "See all results for “<b>{query}</b>”",
  "commandPalette.openFullSearch": "Open full search",

  // ── Vouch page: pick a member and vouch for them (VouchPage) ─────────
  "vouch.page.eyebrow": "Vouch",
  "vouch.page.title": "Tell us you <em>know them.</em>",
  "vouch.page.lede":
    "Find the member you want to vouch for. A vouch is public and carries your name, and you can withdraw it whenever you want.",
  "vouch.picker.searchPlaceholder": "Search members by name",
  "vouch.picker.searchAria": "Search members to vouch for",
  "vouch.picker.noResults":
    "Nobody here matches “{query}”. Try another spelling.",
  "vouch.picker.alreadyVouched": "Vouched",
  "vouch.picker.vouchCta": "Vouch for {name}",
  "vouch.picker.error.title": "The member list didn't load",
  "vouch.picker.error.description":
    "Something went wrong on the way to the directory. Give it another go.",
  "vouch.picker.error.retry": "Try again",

  // ── Why-vouch explainer (vouch.data.ts MEANS) ───────────────────────────────
  "vouch.means.know.title": "You know them, really",
  "vouch.means.know.body":
    "A vouch says you've met this person and you trust them in community spaces. It carries weight here.",
  "vouch.means.safe.title": "It keeps the space safe",
  "vouch.means.safe.body":
    "QueerPulse is invite-and-vouch for a reason. Members vouching for members is how we stay small and trusted.",
  "vouch.means.council.title": "It's seen by the council",
  "vouch.means.council.body":
    "Your note goes to the membership council alongside their application. Not posted publicly.",

  // ── Vouch-for-a-member relationship options (vouchMember.data.ts) ──────────
  "vouch.relationship.collaborated": "We've collaborated",
  "vouch.relationship.friends": "We're friends",
  "vouch.relationship.group": "Same collective or group",
  "vouch.relationship.metThroughQueerPulse": "Met through QueerPulse",
  "vouch.relationship.neighbours": "We're neighbours",

  // ── Read-only relationship "texture" chips (HeroVouchRow) — short
  // third-person noun phrases, not the first-person form copy above; these
  // describe a voucher's relationship to the profile being viewed. ─────────
  "vouch.relationshipChip.collaborated": "Collaborated",
  "vouch.relationshipChip.friends": "Friends",
  "vouch.relationshipChip.group": "Same collective",
  "vouch.relationshipChip.met_through": "Met through QueerPulse",
  "vouch.relationshipChip.neighbours": "Neighbours",

  // ── Vouch-for-a-member modal (VouchMemberModal, VouchMemberModalParts) ─────
  "vouch.modal.ariaLabel": "Vouch for {first}",
  "vouch.modal.close": "Close",
  "vouch.modal.success.title": "That's <em>{first}</em>, backed.",
  "vouch.modal.success.body":
    "Your face just joined <b>{first}</b>'s circle of vouches. That's how trust travels here. Member by member, name by name.",
  "vouch.modal.success.doneCta": "Done",
  "vouch.modal.form.eyebrow": "Add your vouch",
  "vouch.modal.form.title": "Stand behind <em>{first}</em>",
  "vouch.modal.form.sub":
    "A vouch is you, publicly, saying you know {first} and trust them in community spaces. It carries weight here. QueerPulse is invite-and-vouch, and your name goes on their profile beside the others who've backed them.",
  "vouch.modal.form.relationshipLabel": "How do you know {first}?",
  "vouch.modal.form.relationshipHint": "select all that apply",
  // The skill-endorsement chip row was removed (nothing recorded the picks),
  // so its `endorseLabel` / `optional` keys went with it.
  "vouch.modal.form.noteLabel": "Your note",
  "vouch.modal.form.notePlaceholder":
    "How do you know {first}, and what should other members know?",
  "vouch.modal.form.noteOptional": "Optional, but a note means more",
  "vouch.modal.form.charsCount_one": "{count} character",
  "vouch.modal.form.charsCount_other": "{count} characters",
  "vouch.modal.form.cancel": "Cancel",
  "vouch.modal.form.sending": "Sending your vouch…",
  "vouch.modal.form.anonymousLabel":
    "Vouch anonymously. Your name stays hidden from other members",
  "vouch.modal.error": "We couldn't save your vouch. Please try again.",

  // ── Drafts tabs/sort/status vocab (drafts.data.tsx) ─────────────────────────
  "drafts.tabs.all": "All",
  "drafts.tabs.posts": "Posts & replies",
  "drafts.tabs.articles": "Articles & pitches",
  "drafts.tabs.applications": "Applications",
  "drafts.tabs.grants": "Grant applications",
  "drafts.sort.edited": "Recently edited",
  "drafts.sort.deadline": "Closest deadline",
  "drafts.sort.progress": "Least complete",
  "drafts.sort.title": "Alphabetical",
  "drafts.status.draft": "Draft",
  "drafts.status.ready": "Ready",
  "drafts.status.stale": "Stale",
  "drafts.status.atrisk": "At risk",

  // ── Draft row action buttons (drafts.data.tsx / DraftRow) ───────────────────
  "drafts.action.resume": "Resume",
  "drafts.action.delete": "Delete",
  "drafts.action.send": "Send",
  "drafts.action.review": "Review",
  "drafts.action.keep30": "Keep 30 more days",
  "drafts.action.deleteNow": "Delete now",
  "drafts.action.sendReply": "Send reply",
  "drafts.action.edit": "Edit",

  // ── "Start something" create menu (drafts.data.tsx CREATE_ITEMS) ───────────
  "drafts.create.newPost.label": "New post",
  "drafts.create.newPost.sub": "Share to a community",
  "drafts.create.pitchStory.label": "Pitch a story",
  "drafts.create.pitchStory.sub": "To QueerPulse Magazine",
  "drafts.create.startApplication.label": "Start an application",
  "drafts.create.startApplication.sub": "From a saved job",

  // ── "Kept" override meta (drafts.data.tsx KEPT_META) ────────────────────────
  "drafts.keptMeta.resetNote": "Kept · resets 90-day timer",

  // ── Drafts header (DraftsHeader) ────────────────────────────────────────────
  "drafts.header.eyebrow": "Drafts · only visible to you",
  "drafts.header.title": "Things you <em>started.</em>",
  "drafts.header.lead":
    "Posts, articles, applications, and pitches you haven't sent yet. <em>Auto-saved every 8 seconds.</em> Drafts older than 90 days get a polite reminder, then a polite second one, then quietly delete.",
  "drafts.header.startCta": "Start something",

  // ── Search + sort controls (DraftsControls) ─────────────────────────────────
  "drafts.controls.searchPlaceholder": "Search your drafts…",
  "drafts.controls.searchAriaLabel": "Search drafts",
  "drafts.controls.clearSearchLabel": "Clear search",
  "drafts.controls.sortLabel": "Sort",

  // ── Drafts page chrome (DraftsPage) ──────────────────────────────────────────
  "drafts.tabsAriaLabel": "Draft types",
  "drafts.selectAllAriaLabel": "Select all visible drafts",
  "drafts.selectAll": "Select all",
  "drafts.visibleCount_one": "{visible} of {count} draft",
  "drafts.visibleCount_other": "{visible} of {count} drafts",
  "drafts.empty.defaultTitle": "Nothing here yet.",
  "drafts.empty.defaultText":
    "No drafts in this category. Switch tabs, or start something new.",
  "drafts.empty.noMatchTitle": "No matches.",
  "drafts.empty.noMatchText":
    'Nothing in your drafts matches "{query}". Try a different word, or clear the search.',
  "drafts.empty.allCaughtUpTitle": "All caught up.",
  "drafts.empty.allCaughtUpText":
    "No drafts left. Nothing half-written waiting on you. When you start something and step away, it'll be saved here.",
  "drafts.empty.startCta": "Start something new",
  "drafts.toast.deleted_one": "Draft deleted",
  "drafts.toast.deleted_other": "{count} drafts deleted",
  "drafts.toast.undo": "Undo",
  "drafts.toast.kept": "Draft kept: 30 more days",
  "drafts.dangerNote":
    "<b>About the 90-day rule:</b> drafts you haven't touched in 87+ days get an email reminder, then auto-delete on day 90. You can extend any draft 30 days at a time. <em>This keeps your drafts list honest while protecting your work.</em>",

  // ── Draft row (DraftRow) ─────────────────────────────────────────────────────
  "drafts.row.selectAriaLabel": "Select draft",
  // Relative-time meta lines. `{time}` is `fmt.relativeTime()`'s own output
  // (already a full phrase, e.g. "2 days ago" / pt "há 2 dias") — never a
  // hand-rolled "X days ago" string (a real bug found NINE times in this repo).
  "drafts.meta.startedAgo": "Started {time}",
  "drafts.meta.lastEditedAgo": "Last edited {time}",
  "drafts.meta.savedAgo": "Saved {time}",
  "drafts.meta.daysLeft_one": "{count} day",
  "drafts.meta.daysLeft_other": "{count} days",
  "drafts.meta.closesOn": "Closes {date} · {daysPhrase}",
  "drafts.meta.deletesIn": "Deletes in {daysPhrase} · 90-day rule",

  // ── Bulk-selection bar (DraftsBulkBar) ───────────────────────────────────────
  "drafts.bulkBar.ariaLabel": "Bulk actions",
  "drafts.bulkBar.selectedCount_one": "<b>{count}</b> selected",
  "drafts.bulkBar.selectedCount_other": "<b>{count}</b> selected",
  "drafts.bulkBar.deleteCta": "Delete selected",
  "drafts.bulkBar.cancel": "Cancel",
  "savedItem.unavailable.label": "No longer available",
  "savedItem.unavailable.hint": "You can take it out whenever you like.",

  // ── Places (PlacesSection) ───────────────────────────────────────────────────
  // Same registry-status vocabulary as My Places above, reused on the
  // profile-facing section that shows both the owner and their visitors what
  // this member runs in the directory.
  "places.status.review": "In review",
  "places.status.question": "Quick question",
  "places.status.live": "Live",
  "places.selfTitle": "Places <em>you run</em>",
  "places.visitorTitle": "Places {firstName} <em>runs</em>",
  "places.selfSubtitle":
    "Listings you've added to the directory. Each is read by the community team before it goes live.",
  "places.refLabel": "Ref · {ref}",
  "places.quickEditCta": "Quick edit",
  "places.editCta": "Full editor",
  "places.deleteCta": "Delete",
  "places.deleteConfirm":
    "Delete <b>{name}</b> for good? This can't be undone.",
  "places.deleteCancel": "Keep it",
  "places.deleteYes": "Delete listing",
  "places.deleted": "Listing deleted.",
  "places.viewListingCta": "View listing",
  "places.awaitingReview": "Awaiting review",
  "places.coManaging": "Co-managing",

  // ── Invitations to help run somebody else's place, answered here because
  //    this is where an accepted one lands.
  "places.coManagerInvites.title_one": "1 invitation waiting",
  "places.coManagerInvites.title_other": "{count} invitations waiting",
  "places.coManagerInvites.sub":
    "Someone asked you to help run their place. Take your time: nothing changes until you answer.",
  "places.coManagerInvites.fromNamed": "Invitation from <b>{name}</b>.",
  "places.coManagerInvites.from": "An invitation to help run this place.",
  "places.coManagerInvites.acceptCta": "Accept",
  "places.coManagerInvites.declineCta": "Decline",
  "places.coManagerInvites.acceptedToast": "You now help run {listing}.",
  "places.coManagerInvites.declinedToast": "Invitation declined.",
  "places.coManagerInvites.error": "We couldn't send your answer. Try again.",
  "places.empty.title": "No places yet",
  "places.empty.description":
    "Run a studio, shop, clinic or space in Lisbon? List it in the directory. Once it's live, it'll show up here too.",
  "places.empty.action": "List my business",
  "places.loadError.title": "We couldn't load <em>these places</em>",
  "places.loadError.body":
    "The list didn't come back. This is on our side. Try again in a moment.",

  "places.quickEdit.title": "Quick edit",
  "places.quickEdit.sub": "Update the basics for {name}.",
  "places.quickEdit.blurbLabel": "One-line blurb",
  "places.quickEdit.blurbHelper": "Shown under your listing's name.",
  "places.quickEdit.hoursNoteLabel": "Hours note",
  "places.quickEdit.hoursNoteHelper":
    'A short line shown under your opening hours, for example "Closed public holidays."',
  "places.quickEdit.websiteLabel": "Website",
  "places.quickEdit.phoneLabel": "Phone",
  "places.quickEdit.cancel": "Cancel",
  "places.quickEdit.save": "Save changes",
  "places.quickEdit.saving": "Saving…",
  "places.quickEdit.savedToast": "Listing updated.",
  "places.quickEdit.errorToast": "Couldn't save your changes. Try again.",
  "places.quickEdit.moreLink":
    "Need to change categories, address, or photos? <a>Open the full editor.</a>",

  // ── Badges page chrome (BadgesPage, BadgesSections) ─────────────────────────
  // Badge names, categories, rarity and level names are recognition-domain
  // content (fetched wholesale via useRecognition() in live mode) — only the
  // surrounding chrome below is translated. See the header comment.
  "badges.backToProfile": "Back to profile",
  "badges.pageTitle": "Badges & <em>level</em>",
  "badges.howToEarnXp": "How to earn XP",
  "badges.loading": "Loading your badges…",
  "badges.errorTitle": "We couldn't load your badges",
  "badges.errorDescription":
    "Something went wrong reaching your recognition. Please try again in a moment.",
  "badges.emptyTitle": "No badges yet",
  "badges.emptyDescription":
    "Show up, host, and take part. Your first badges land here as you go.",

  // ── XP breakdown ("what you did to earn it") — the backend returns a
  //    stable `key` per source (unlike badge names above), so these labels
  //    ARE translated client-side. See xpBreakdown.data.ts. ──
  "badges.xpBreakdown.heading": "What <em>earned</em> it",
  "badges.xpBreakdown.sub": "Every source of XP, earned or still open.",
  "badges.xpBreakdown.progress": "{units} of {cap}",
  "badges.xpBreakdown.perUnitAmount": "+{xp} XP each",
  "badges.xpBreakdown.sources.profile": "Profile complete",
  "badges.xpBreakdown.sources.profileDesc":
    "A photo and a bio on your profile.",
  "badges.xpBreakdown.sources.communities": "Communities joined",
  "badges.xpBreakdown.sources.communitiesDesc":
    "Joining a community that other people are in.",
  "badges.xpBreakdown.sources.personas": "Personas published",
  "badges.xpBreakdown.sources.personasDesc": "Publishing a persona.",
  "badges.xpBreakdown.sources.vouches": "Vouches given",
  "badges.xpBreakdown.sources.vouchesDesc": "Vouching for someone else.",
  "badges.xpBreakdown.sources.connections": "Connections made",
  "badges.xpBreakdown.sources.connectionsDesc":
    "Connecting with another member.",
  "badges.xpBreakdown.sources.events": "Gatherings attended",
  "badges.xpBreakdown.sources.eventsDesc":
    "Attending a gathering someone else is hosting.",
  "badges.xpBreakdown.sources.posts": "Community posts",
  "badges.xpBreakdown.sources.postsDesc":
    "Posting where other people are, or replying to someone.",
  "badges.xpBreakdown.sources.endorsements": "Endorsements received",
  "badges.xpBreakdown.sources.endorsementsDesc":
    "Being endorsed by another member.",
  "badges.xpBreakdown.sources.tenure": "Days on QueerPulse",
  "badges.xpBreakdown.sources.tenureDesc":
    "Being part of QueerPulse, one day at a time.",
  "badges.xpBreakdown.sources.verified": "Verified",
  "badges.xpBreakdown.sources.verifiedDesc": "Verifying your account.",
  "badges.xpBreakdown.sources.gettingStarted": "Getting-started steps",
  "badges.xpBreakdown.sources.gettingStartedDesc":
    "Finishing a Getting Started step.",
  // ── The contribution side (SUS-05). These five count work that keeps the
  //    platform running, so each carries a high per-unit value and a low cap
  //    in the backend's XP_RULES. Every description below states exactly what
  //    the backend counts: read `recognition.scoring.ts` before editing one. ──
  "badges.xpBreakdown.sources.volunteering": "Volunteer sessions",
  "badges.xpBreakdown.sources.volunteeringDesc":
    "A volunteer session confirmed by the person who posted it.",
  "badges.xpBreakdown.sources.hosting": "Gatherings hosted",
  "badges.xpBreakdown.sources.hostingDesc":
    "Hosting a gathering that happened and drew people.",
  "badges.xpBreakdown.sources.magazine": "Magazine pieces published",
  "badges.xpBreakdown.sources.magazineDesc":
    "A piece of yours published in the magazine.",
  "badges.xpBreakdown.sources.answers": "Directory questions answered",
  "badges.xpBreakdown.sources.answersDesc":
    "Answering a question on a directory listing.",
  "badges.xpBreakdown.sources.resources": "Resources approved",
  "badges.xpBreakdown.sources.resourcesDesc":
    "A resource you suggested that was approved.",
  "badges.xpBreakdown.sources.badges": "Badge bonuses",
  "badges.xpBreakdown.sources.badgesDesc":
    "The badges you've earned along the way.",
  "badges.xpBreakdown.sources.other": "Other",
  "badges.xpBreakdown.sources.otherDesc": "Other activity on QueerPulse.",

  // ── Badges v2: hero + level dial ─────────────────────────────────────────
  "badges.hero.levelWord": "Level",
  "badges.hero.statEarnedLabel": "In the case",
  "badges.hero.statRareLabel": "Rarest held",
  "badges.hero.statNearLabel": "Closest badge",
  "badges.hero.statNearAllEarned": "All of them",
  "badges.hero.statRareNone": "None yet",
  // Was "Print your case", but the dialog it opens has no print, export or
  // share action — only a Close button — so the label promised an artifact that
  // does not exist. Rename it back the day one does.
  "badges.hero.viewCase": "View your case",
  "badges.hero.xpProgress": "{xp} / {xpMax} XP",
  "badges.hero.xpToNextName": "{xp} XP to <b>{nextName}</b>",
  "badges.hero.maxLevel": "You've reached the top of the ladder.",
  "badges.hero.youAreHere": "You are here",
  "badges.hero.seeAllLevels": "See all seven levels",
  "badges.hero.toGo": "{count} to go",

  // ── Badges v2: momentum ("closest to earning") ───────────────────────────
  "badges.momentum.eyebrow": "Momentum",
  "badges.momentum.heading": "Closest to <em>earning</em>",
  "badges.momentum.previewEarn": "Preview the earn moment",
  "badges.momentum.progress": "{units} of {target}",
  "badges.momentum.cannotBeChased": "Comes from another member",
  "badges.momentum.xpReward": "+{xp} XP",
  "badges.momentum.allEarnedDesc":
    "Everything in your unmuted categories is earned.",
  "badges.momentum.unmuteCategory": "Unmute a category",
  "badges.momentum.fastestXp": "Fastest XP",

  // ── Badges v2: the case (grid + controls) ────────────────────────────────
  "badges.case.eyebrow": "The case",
  "badges.case.heading": "Your <em>badges</em>",
  "badges.case.sub": "{earned} earned · {remaining} still out there",
  "badges.case.showLocked": "Show locked",
  "badges.case.notForMe": "Not for me",
  "badges.case.muteTitle": "Mute a category",
  "badges.case.muteDesc":
    "Muted categories are never suggested to you. No nudges, no counting against you.",
  "badges.case.sortLabel": "Sort badges",
  "badges.case.sortClosest": "Closest first",
  "badges.case.sortRarest": "Rarest first",
  "badges.case.sortXp": "Most XP",
  "badges.case.sortCategory": "By category",
  "badges.case.filterAll": "Everything",
  "badges.case.mutedNoteSingle":
    "{category} is muted. Nothing from it will be suggested to you.",
  "badges.case.mutedNotePlural":
    "{categories} are muted. Nothing from them will be suggested to you.",
  "badges.case.hiddenFlag": "Hidden",
  "badges.case.rarestFlag": "Rarest in your case",
  "badges.case.rarityCommon": "Common",
  "badges.case.rarityRare": "Rare",
  "badges.case.rarityLegendary": "Legendary",
  "badges.case.emptyTitle": "Nothing in the case <em>yet</em>.",
  "badges.case.emptyDesc":
    "That's exactly right for week one. A few of these are within reach without leaving the sofa. The rest arrive by being here.",

  // ── Badges v2: badge detail drawer ───────────────────────────────────────
  "badges.drawer.whatItTakes": "What it takes",
  "badges.drawer.rarity": "Rarity",
  "badges.drawer.worth": "Worth",
  "badges.drawer.checkedBy": "Checked by",
  "badges.drawer.checkedBySystem": "System",
  "badges.drawer.checkedByHost": "Host",
  "badges.drawer.checkedByPerson": "A person",
  "badges.drawer.checkedByMember": "A member",
  "badges.drawer.howCheckedHeading": "How it's checked",
  "badges.drawer.verifyAutoTitle": "Counted automatically",
  "badges.drawer.verifyAutoBody":
    "Counted automatically from your own activity. Nothing is logged that isn't already yours.",
  "badges.drawer.verifyHostTitle": "Confirmed at the door",
  "badges.drawer.verifyHostBody":
    "Confirmed by the host checking you in at the door.",
  "badges.drawer.verifyReviewTitle": "Read by a person",
  "badges.drawer.verifyReviewBody":
    "Someone on the community team reads it before it counts. That delay is the point.",
  "badges.drawer.verifyPeerTitle": "Given in someone else's words",
  "badges.drawer.verifyPeerBody":
    "Given by another member, in their own words. It can't be requested, bought, or farmed.",
  "badges.drawer.noteHeading": "Your note on this one",
  "badges.drawer.notePlaceholder":
    "One line for yourself. What was this actually about?",
  "badges.drawer.noteHelp": "Only you can see this.",
  "badges.drawer.visibleOnProfile": "Visible on your profile",
  "badges.drawer.privateToYou": "Private to you",
  "badges.drawer.visibilityNote":
    "Hide it and other members stop seeing it on your profile. It stays here for you either way.",
  "badges.drawer.visibilityErrorToast":
    "We couldn't change that badge's visibility. Please try again in a moment.",
  "badges.drawer.earnedThisWeek": "this week",
  "badges.drawer.progressCount": "{units} of {target} done",
  "badges.drawer.previous": "Previous badge",
  "badges.drawer.next": "Next badge",
  "badges.drawer.count": "{index} of {total}",
  "badges.drawer.seasonalTag": "Seasonal",
  "badges.drawer.close": "Close",

  // ── Badges v2: seasonal band ──────────────────────────────────────────────
  "badges.seasonal.eyebrow": "Seasonal",
  "badges.seasonal.heading": "Only <em>this year</em>",
  "badges.seasonal.sub":
    "Badges that won't be earnable again once their window closes. They expire, but the memory stays.",

  // ── Badges v2: ladder ─────────────────────────────────────────────────────
  "badges.ladderV2.eyebrow": "The ladder",
  "badges.ladderV2.heading": "What each level <em>opens</em>",
  "badges.ladderV2.sub":
    "Almost everything QueerPulse offers is open from Level 1. These rungs list what each level adds on top of that, and nothing that isn't built.",
  "badges.ladderV2.passed": "Passed",
  "badges.ladderV2.ahead": "Ahead",
  "badges.ladderV2.beyondTitle": "After {name}",
  "badges.ladderV2.beyondBody": "The ladder stops. The room doesn't.",

  // ── Badges v2: XP ledger / receipts ──────────────────────────────────────
  "badges.ledger.eyebrow": "Receipts",
  "badges.ledger.heading": "Where the <em>points</em> came from",
  "badges.ledger.subWithCount":
    "{count} events. Your level is derived from this list, never stored.",
  "badges.ledger.subEmpty":
    "Your level is derived from this list, never stored.",
  "badges.ledger.sparkXp": "{xp} XP",
  "badges.ledger.sparkAriaLabel": "XP over time, ending at {xp} XP",
  "badges.ledger.colDate": "Date",
  "badges.ledger.colWhat": "What happened",
  "badges.ledger.colXp": "XP",
  "badges.ledger.colTotal": "Total",
  "badges.ledger.showAll": "Show all {count} events",
  "badges.ledger.showLess": "Show less",
  "badges.ledger.emptyTitle": "No history yet.",
  "badges.ledger.emptyBody":
    "Every point lands here with a date and a description, so you can always see where your level came from.",

  // Badge and XP-ledger display strings (DES-141, DES-143). The backend
  // catalog keeps STABLE MACHINE IDS, which are persisted on
  // recognition_awards.badge_key under a unique constraint, so renaming one
  // would orphan real members' awards. The words live here instead, the same
  // shape XP_SOURCE_META and RARITY_LABEL_KEY already use in this feature.
  // Mapped by src/features/members/badgeCatalog.data.ts and
  // xpLedgerReasons.data.ts, both of which fall back rather than ever letting
  // a raw id or reason code reach a member.
  "badges.ledger.reason.moderationRemoval":
    "Recount after a moderation takedown",
  "badges.ledger.reason.moderationRemovalWhy":
    "A moderator takedown stands against your account, so the content it removed has stopped counting. It counts again from the next recount after the takedown is lifted.",
  "badges.ledger.reason.rebase": "Points rebalanced",
  "badges.ledger.reason.rebaseWhy":
    "Points now come only from activity another person was part of. This row is the one-off correction that brought your total into line.",
  "badges.ledger.reason.adjustment": "Correction to your total",
  "badges.ledger.reason.adjustmentWhy":
    "This row was written by the platform. Ask the community team if you want the detail behind it.",
  "perks.sidebar.explainBody":
    "Perks are not a loyalty scheme. They are how the members who keep showing up get a little more back. Each level stands for something real: time here, gatherings attended, people connected. What you unlock is a bigger share of what the platform can already do.",
  "perks.sidebar.suggestLabel":
    "What would make being a long-term member worth more to you?",
  "badges.case.categoryToggleLabel": "Show {category} badges",
  "badges.category.attendance": "Attendance",
  "badges.category.community": "Community",
  "badges.category.culture": "Culture",
  "badges.category.exploration": "Exploration",
  "badges.category.hosting": "Hosting",
  "badges.category.milestones": "Milestones",
  "badges.category.platform": "Platform",
  "badges.catalog.localScout.name": "Local Scout",
  "badges.catalog.localScout.locked": "Save 3 places in the Local directory",
  "badges.catalog.localScout.earned": "Saved 3 places in the Local directory",
  "badges.catalog.wellRead.name": "Well-Read",
  "badges.catalog.wellRead.locked": "Save 5 articles or resources",
  "badges.catalog.wellRead.earned": "Saved 5 articles or resources",
  "badges.catalog.firstGathering.name": "First Gathering",
  "badges.catalog.firstGathering.locked": "Attend your first gathering",
  "badges.catalog.firstGathering.earned": "Attended a QueerPulse gathering",
  "badges.catalog.threeCompany.name": "Three's Company",
  "badges.catalog.threeCompany.locked": "Attend 3 gatherings",
  "badges.catalog.threeCompany.earned": "3 gatherings attended",
  "badges.catalog.regularAttendee.name": "Regular",
  "badges.catalog.regularAttendee.locked": "Attend 5 gatherings in one year",
  "badges.catalog.regularAttendee.earned": "5 gatherings in one year",
  "badges.catalog.decade.name": "Anniversary",
  "badges.catalog.decade.locked": "Be a member for 1 year",
  "badges.catalog.decade.earned": "Member for 1 year",
  "badges.catalog.connector.name": "Connector",
  "badges.catalog.connector.locked": "Make 10 connections",
  "badges.catalog.connector.earned": "10 connections made",
  "badges.catalog.vouch.name": "Vouch",
  "badges.catalog.vouch.locked": "Vouch for a new member",
  "badges.catalog.vouch.earned": "Vouched for a new member",
  "badges.catalog.threadStarter.name": "Thread Starter",
  "badges.catalog.threadStarter.locked": "Start a community thread",
  "badges.catalog.threadStarter.earned": "Started a community thread",
  "badges.catalog.networker.name": "Networker",
  "badges.catalog.networker.locked": "Connect with 50 members",
  "badges.catalog.networker.earned": "Connected with 50 members",
  "badges.catalog.contributor.name": "Contributor",
  "badges.catalog.contributor.locked": "Submit a member story",
  "badges.catalog.contributor.earned": "Submitted a member story",
  "badges.catalog.twoHomes.name": "Two Homes",
  "badges.catalog.twoHomes.locked": "Join a second community",
  "badges.catalog.twoHomes.earned": "Joined a second community",
  "badges.catalog.foundingMember.name": "Founding Member",
  "badges.catalog.foundingMember.locked": "Join in the first 500 members",
  "badges.catalog.foundingMember.earned": "Joined in the first 500",
  "badges.catalog.sustainer.name": "Rooted",
  "badges.catalog.sustainer.locked": "Be a member for 6 months",
  "badges.catalog.sustainer.earned": "Member for 6 months",
  "badges.catalog.workReady.name": "Work Ready",
  "badges.catalog.workReady.locked":
    "Fill out your Work Profile (skills and focus areas)",
  "badges.catalog.workReady.earned": "Completed the Work Profile",
  "badges.catalog.eventHost.name": "Event Host",
  "badges.catalog.eventHost.locked": "Host a QueerPulse gathering",
  "badges.catalog.eventHost.earned": "Hosted a QueerPulse gathering",
  "badges.catalog.serialHost.name": "Serial Host",
  "badges.catalog.serialHost.locked": "Host 3 approved gatherings",
  "badges.catalog.serialHost.earned": "Hosted 3 approved gatherings",
  "badges.catalog.firstSteps.name": "First Steps",
  "badges.catalog.firstSteps.locked": "Finish your getting started checklist",
  "badges.catalog.firstSteps.earned": "Completed the getting started checklist",
  "badges.catalog.pride2026.name": "Pride 2026",
  "badges.catalog.pride2026.locked": "March with the QueerPulse block",
  "badges.catalog.pride2026.earned": "Marched with the QueerPulse block",
  "badges.catalog.firstTable2026.name": "New Year, First Table",
  "badges.catalog.firstTable2026.locked":
    "Attend the first gathering of the year",
  "badges.catalog.firstTable2026.earned":
    "Attended the first gathering of the year",
  "badges.catalog.winterWarmth2026.name": "Winter Warmth",
  "badges.catalog.winterWarmth2026.locked":
    "Bring someone new to a December gathering",
  "badges.catalog.winterWarmth2026.earned":
    "Brought someone new to a December gathering",

  "badges.catalog.pride2026.window": "Open until {date}",
  "badges.catalog.firstTable2026.window": "January only",
  "badges.catalog.winterWarmth2026.window": "Opens {date}",

  // The seven rungs of the XP ladder. The backend served these as English
  // words on `LevelDTO.name` and they rendered on eleven surfaces, the
  // profile hero among them. NOTHING persists a level name (recognition_stats
  // is user_id, xp, updated_at and every rung derives from xp), so the NUMBER
  // is the stable id and the words live here. Resolved through
  // `levelNameKeyFor()` in features/members/levelLadder.data.ts.
  //
  // Level 3 is "Regular" and so is the `regular-attendee` BADGE. They are
  // different things, one a rung and one a thing earned once, and a member can
  // hold the badge while standing on another rung, so the PT keeps them apart
  // deliberately: this is "Sempre Por Cá", the badge is "Presença Habitual".
  "levels.newcomer": "Newcomer",
  "levels.explorer": "Explorer",
  "levels.regular": "Regular",
  "levels.familiar": "Familiar",
  "levels.trusted": "Trusted",
  "levels.anchor": "Anchor",
  "levels.pillar": "Pillar",

  // The perks ladder. BASE_PERKS_BY_LEVEL and PERK_CATALOG used to reach the
  // client as one untyped list of ENGLISH SENTENCES, so a Portuguese member
  // read the whole ladder in English. The wire now carries stable ids with
  // the English kept as a fallback.
  //
  // PERK_CATALOG keys are PERSISTED on recognition_perk_claims.perk_key under
  // a unique constraint, and are also the claim endpoint's path segment, so
  // they must never be renamed. The base.* ids reach no table: a baseline
  // capability is descriptive and can never be claimed. Both kinds land in
  // ONE ladder list, so their ids must not collide.
  "perks.group.available": "Available to claim",
  "perks.group.coming": "Coming at Level {level} · {name}",
  "perks.group.claimed": "Already claimed",
  "perks.ladder.statusDone": "Done",
  "perks.ladder.statusCurrent": "Current",
  "perks.ladder.statusXpAway_one": "{count} XP away",
  "perks.ladder.statusXpAway_other": "{count} XP away",
  "perks.ladder.statusLocked": "Locked",
  "perks.claim.unlocksAt": "Unlocks at Level {level} · {name}",
  "perks.claim.claimedOn": "Claimed {date}",
  "perks.claim.higherAllowanceCta": "Claim the higher allowance",
  "perks.claim.higherAllowanceToast":
    "Claimed. Your monthly invite allowance is higher from now on",
  "perks.category.community": "Community",
  "perks.category.membership": "Membership",
  "perks.catalog.vouchAccess.title": "Vouch access",
  "perks.catalog.vouchAccess.desc":
    "The ability to vouch for other members, a trust signal that helps them stand out. Every active member has it from day one.",
  "perks.catalog.vouchAccess.autoLabel": "Available to every active member",
  "perks.catalog.inviteQuotaLevel4.title": "More invites each month",
  "perks.catalog.inviteQuotaLevel4.desc":
    "Claim it and your monthly invite allowance goes from {base} to {total}. Invites reset on the first of each month.",
  "perks.catalog.inviteQuotaLevel5.title": "The highest invite allowance",
  "perks.catalog.inviteQuotaLevel5.desc":
    "Claim it and your monthly invite allowance goes from {base} to {total}. The community grows because of people like you.",
  "perks.base.browseDirectory": "Browse the member directory",
  "perks.base.joinGatherings": "Join gatherings and RSVP",
  "perks.base.directMessages": "Message other members directly",
  "perks.base.saveArticles": "Save articles and resources",
  "perks.base.joinCommunities": "Join communities",
  "perks.base.hostGathering": "Host a gathering",

  "badges.ledger.integrityHeading": "Why this can be trusted",
  "badges.ledger.integrity1Title": "Counted from what you already did.",
  "badges.ledger.integrity1Body":
    "Attendance comes from your own RSVP on a gathering that has already started. There is nothing extra to file.",
  "badges.ledger.integrity2Title": "Every point has a row.",
  "badges.ledger.integrity2Body":
    "Each increase lands in this list with a date and a description, so the total can be checked against it.",
  // Was "Points are never taken back.", an absolute promise sitting directly
  // above a real negative row that printed the raw code `moderation_removal`.
  // The mechanism is at recognition-awarding.service.ts:226-234 and :321-328:
  // the no-regression floor is lifted only while a moderation takedown stands
  // against the account, and it is reversible. XP buys real invite quota, so
  // a deduction has a material consequence and the member is owed the
  // specifics rather than either an absolute or a vague reassurance. DES-141.
  "badges.ledger.integrity3Title": "Points are only taken back in one case.",
  "badges.ledger.integrity3Body":
    "Your own edits and deletions never lower it: a withdrawn vouch or a post you tidied away leaves your total where it was. While a moderation takedown stands against your account, the content it removed stops counting, and the extra monthly invitations your level buys go with it. Lift the takedown and the next recount restores whatever your activity still supports.",
  "badges.ledger.integrity4Title": "You choose what shows.",
  "badges.ledger.integrity4Body":
    "Any badge you earn can be hidden from your profile, one at a time. A hidden badge stays on this page for you.",
  "badges.ledger.integrity5Title": "No leaderboard.",
  "badges.ledger.integrity5Body":
    "Members are never ranked against each other. Rarity describes the badge itself.",
  "badges.ledger.footnoteCount":
    "{badges} badges · {levels} levels · one ledger you can audit.",
  "badges.ledger.footnoteContact":
    "Something look wrong? Ask the community team.",

  // ── Badges v2: earn moment + case card ───────────────────────────────────
  "badges.earn.kickerBadge": "Badge earned",
  "badges.earn.kickerGiven": "Given to you",
  "badges.earn.body":
    "That's +{xp} XP, and it's yours whether or not you ever show it.",
  "badges.earn.putInCase": "Put it in the case",
  "badges.earn.footnote":
    "Level {level} · {name} · private until you say otherwise",
  "badges.caseCard.title": "Your case",
  "badges.caseCard.subtitle": "QueerPulse · Lisbon",
  "badges.caseCard.emptyDesc": "An empty case. Come back in a month.",
  "badges.caseCard.footStats": "{count} badges · {xp} XP",
  "badges.caseCard.close": "Close",

  // ── Perks page chrome (PerksPage, PerksSections) ────────────────────────────
  "perks.page.backToBadges": "Badges & level",
  "perks.page.title": "Your <em>bonuses</em>",
  "perks.page.availableToRedeem_one": "{count} perk available to redeem",
  "perks.page.availableToRedeem_other": "{count} perks available to redeem",
  "perks.page.loading": "Loading your perks…",
  "perks.page.errorTitle": "We couldn't load your perks",
  "perks.page.errorDescription":
    "Something went wrong reaching your recognition. Please try again in a moment.",
  "perks.page.emptyTitle": "No perks yet",
  "perks.page.emptyDescription":
    "Level up and your member benefits will show up here to redeem.",
  "perks.sidebar.yourLevelTitle": "Your level",
  "perks.sidebar.xpSummary":
    "{xp} / {xpMax} XP · {xpToNext} to Level {nextLevel}",
  "perks.sidebar.nextUnlockNote":
    "Your next rung is <strong>Level {nextLevel} · {nextName}</strong>. What it opens is listed on the ladder.",
  "perks.sidebar.seeAllBadgesCta": "See all badges & levels",
  "perks.sidebar.explainedTitle": "Perks explained",
  "perks.sidebar.suggestTitle": "Suggest a perk",
  "perks.sidebar.suggestPlaceholder": "Share an idea…",
  "perks.sidebar.sendSuggestionCta": "Send suggestion",
  "perks.sidebar.suggestUnavailableToast":
    "Perk suggestions aren't open yet. Thanks for your patience.",
  "perks.claim.alreadyActive": "Already active",
  "perks.claim.active": "Active",
  "perks.claim.claimed": "Claimed",
  "perks.claim.claiming": "Claiming…",
  "perks.claim.errorToast":
    "We couldn't claim that perk. Please try again in a moment.",

  // ── Your network (ProfileNetworkStats chips + NetworkListModal) — owner-only ─
  "network.title": "Your network",
  "network.group.connected": "Connected",
  "network.group.vouchedGiven": "You vouched for",
  "network.group.vouchedReceived": "Vouched for you",
  "network.row.connected": "connected {time}",
  "network.row.connectedNoTime": "connected",
  "network.row.vouchedGiven": "you vouched {time}",
  "network.row.vouchedGivenNoTime": "you vouched",
  "network.row.vouchedReceived": "vouched for you {time}",
  "network.row.vouchedReceivedNoTime": "vouched for you",
  "network.viewAllAria": "View all {count} in {group}",
  "network.modalSub_one": "{count} person",
  "network.modalSub_other": "{count} people",
  "network.searchPlaceholder": "Search by name",
  "network.searchAria": "Search this list by name",
  "network.noMatches": "No one here matches “{query}”.",

  // ── "Who sees what" sheet (WhoSeesWhatSheet + Presets/FieldToggles/Identities/HiddenFrom/Reports/NameChange) ──
  "profile.whoSeesWhat.title": "Who sees what",

  "profile.whoSeesWhat.presets.heading": "Quick presets",
  "profile.whoSeesWhat.presets.sub":
    "One tap sets your photo, neighbourhood, vouchers and what you're looking for together.",
  "profile.whoSeesWhat.presets.findable.label": "Findable",
  "profile.whoSeesWhat.presets.findable.desc":
    "Photo, neighbourhood, vouchers and what you're looking for are all visible.",
  "profile.whoSeesWhat.presets.careful.label": "Careful",
  "profile.whoSeesWhat.presets.careful.desc":
    "Photo and neighbourhood stay private. Vouchers and what you're looking for are visible.",
  "profile.whoSeesWhat.presets.closed.label": "Closed",
  "profile.whoSeesWhat.presets.closed.desc":
    "Photo, neighbourhood, vouchers and what you're looking for all stay private.",

  "profile.whoSeesWhat.activity.heading": "How recently you were here",
  "profile.whoSeesWhat.activity.sub":
    "Other members can see roughly how recently you were around. We keep the month and nothing finer: no dates, no times, no dot saying you are online right now.",
  "profile.whoSeesWhat.activity.hideLabel": "Hide this from other members",
  "profile.whoSeesWhat.activity.hideDesc":
    "Turns the line off for everyone else and takes you out of the Recently active sort. You will still see it here.",
  "profile.whoSeesWhat.activity.current": "Right now you read as: {band}.",
  "profile.whoSeesWhat.activity.none":
    "Nothing recorded yet, so your profile shows no line at all.",
  "profile.whoSeesWhat.activity.error": "That did not save. Try again.",
  "profile.whoSeesWhat.activity.demo":
    "This is the demo. Sign in to change the setting for real.",
  "profile.whoSeesWhat.fields.heading": "Visibility switches",
  "profile.whoSeesWhat.fields.sub": "Each of these takes effect right away.",
  "profile.whoSeesWhat.fields.photo.label": "Photo",
  "profile.whoSeesWhat.fields.photo.desc":
    "Show your photo on your profile and directory card.",
  "profile.whoSeesWhat.fields.hood.label": "Neighbourhood",
  "profile.whoSeesWhat.fields.hood.desc":
    "Show which Lisbon neighbourhood you're in.",
  "profile.whoSeesWhat.fields.vouchers.label": "Vouchers",
  "profile.whoSeesWhat.fields.vouchers.desc": "Show who has vouched for you.",
  "profile.whoSeesWhat.fields.intent.label": "What you're looking for",
  "profile.whoSeesWhat.fields.intent.desc":
    "Show what you're open to on your profile.",

  "profile.whoSeesWhat.identities.heading": "Identities",
  "profile.whoSeesWhat.identities.sub":
    "Choose which of your identities show up in search and the directory.",
  "profile.whoSeesWhat.identities.empty":
    "You haven't added any identities yet.",
  "profile.whoSeesWhat.identities.emptyLink": "Add identities",

  "profile.whoSeesWhat.hiddenFrom.heading": "Hidden from",
  "profile.whoSeesWhat.hiddenFrom.sub":
    "Your profile stays invisible to anyone on this list, even if you're connected.",
  "profile.whoSeesWhat.hiddenFrom.demoNote":
    "This is a demo account, so hiding your profile from someone isn't simulated here.",
  "profile.whoSeesWhat.hiddenFrom.empty":
    "You haven't hidden your profile from anyone.",
  "profile.whoSeesWhat.hiddenFrom.addButton": "Hide from someone",
  "profile.whoSeesWhat.hiddenFrom.remove": "Remove",
  "profile.whoSeesWhat.hiddenFrom.removeAria": "Remove {name}",
  "profile.whoSeesWhat.hiddenFrom.pickerTitle": "Hide your profile from",
  "profile.whoSeesWhat.hiddenFrom.pickerSearchPlaceholder": "Search by name",
  "profile.whoSeesWhat.hiddenFrom.pickerNoResults":
    "Nobody by that name. Try a different spelling.",
  "profile.whoSeesWhat.hiddenFrom.pickerLoadMore": "Show more people",
  "profile.whoSeesWhat.hiddenFrom.pickerLoadingMore": "Loading…",
  "profile.whoSeesWhat.hiddenFrom.toast.hidden":
    "Hidden. They won't see your profile.",
  "profile.whoSeesWhat.hiddenFrom.toast.unhidden":
    "Unhidden. They can see your profile again.",
  "profile.whoSeesWhat.hiddenFrom.toast.error":
    "Something went wrong. Please try again.",

  "profile.whoSeesWhat.reports.heading": "Reports you've filed",
  "profile.whoSeesWhat.reports.sub":
    "A record of what you've reported and where it stands.",
  "profile.whoSeesWhat.reports.filedTemplate": "Filed {time}",
  "profile.whoSeesWhat.reports.empty": "You haven't filed any reports.",
  "profile.whoSeesWhat.reports.error": "We couldn't load your reports.",
  "profile.whoSeesWhat.reports.status.open": "Open",
  "profile.whoSeesWhat.reports.status.resolved": "Resolved",
  "profile.whoSeesWhat.reports.status.escalated": "Escalated",

  "profile.whoSeesWhat.nameChange.heading": "Your username",
  "profile.whoSeesWhat.nameChange.sub":
    "Your username is @{handle}. Change it any time.",
  "profile.whoSeesWhat.nameChange.button": "Change your username",

  "profile.whoSeesWhat.toast.saved": "Saved.",
  "profile.whoSeesWhat.toast.error": "Couldn't save that. Please try again.",

  // ── "Your data" sheet (AccountDataSheet + Export/StepAway/Dsar) ──────────────
  "profile.accountData.title": "Your data",

  "profile.accountData.export.title": "Download your data",
  "profile.accountData.export.intro":
    "Request a copy of everything QueerPulse holds on you. We'll build it in the background, and it can take a few minutes.",
  "profile.accountData.export.cta": "Request export",
  "profile.accountData.export.requesting": "Requesting…",
  "profile.accountData.export.status.queued": "Queued",
  "profile.accountData.export.status.processing": "Building",
  "profile.accountData.export.status.ready": "Ready",
  "profile.accountData.export.status.failed": "Failed",
  "profile.accountData.export.status.expired": "Expired",
  "profile.accountData.export.statusNote":
    "We're putting your archive together. This page updates on its own, so there's no need to refresh.",
  "profile.accountData.export.downloadCta": "Download archive",
  "profile.accountData.export.expiresNote": "This link expires {date}.",
  "profile.accountData.export.retryCta": "Try again",
  "profile.accountData.export.toast.startError":
    "We couldn't start your export. Please try again.",

  "profile.accountData.stepAway.title": "Step away",
  "profile.accountData.stepAway.hide.title": "Hide me",
  "profile.accountData.stepAway.hide.body":
    "Your profile becomes invisible and you stop receiving notifications. It's fully reversible: sign back in any time to reactivate. While hidden, other members see you listed as a deactivated member.",
  "profile.accountData.stepAway.hide.cta": "Hide me",
  "profile.accountData.stepAway.hide.confirm.title": "Hide your profile?",
  "profile.accountData.stepAway.hide.confirm.body":
    "You'll be signed out and your profile hidden right away. Sign back in whenever you're ready. Nothing is deleted.",
  "profile.accountData.stepAway.hide.confirm.cta": "Yes, hide me",
  "profile.accountData.stepAway.erase.title": "Erase me",
  "profile.accountData.stepAway.erase.body":
    "Permanently delete your account. There's a 30-day grace period to change your mind before erasure is irreversible.",
  "profile.accountData.stepAway.erase.blockedByDependencies":
    "A few things still depend on you before we can erase your account:",
  "profile.accountData.stepAway.erase.cta": "Erase me",
  "profile.accountData.stepAway.erase.disabledHint":
    "Transfer or close everything listed above, then Erase me becomes available.",
  "profile.accountData.stepAway.erase.confirm.title":
    "Request account erasure?",
  "profile.accountData.stepAway.erase.confirm.body":
    "This starts a 30-day grace period. Your profile at {profile} disappears right away, you'll be signed out now, and everything is permanently erased at the end of the 30 days unless you cancel first.",
  "profile.accountData.stepAway.erase.confirm.cta": "Request erasure",
  "profile.accountData.stepAway.erase.confirm.reasonLabel":
    "Tell us why, if you'd like (optional)",
  "profile.accountData.stepAway.erase.confirm.reasonPlaceholder":
    "Optional, and it helps us do better",
  "profile.accountData.stepAway.dependency.transferCta": "Transfer",
  "profile.accountData.stepAway.dependency.closeCta": "Close listing",
  "profile.accountData.stepAway.dependency.closeConfirm.title":
    "Close “{name}”?",
  "profile.accountData.stepAway.dependency.closeConfirm.body":
    "This withdraws the listing from the directory. It won't be visible to anyone afterward.",
  "profile.accountData.stepAway.dependency.closedToast": "Listing closed.",
  "profile.accountData.stepAway.pending.banner":
    "<strong>Your account is scheduled for deletion.</strong> Everything is hidden now and will be permanently erased on <strong>{date}</strong>. Changed your mind? You can still cancel.",
  "profile.accountData.stepAway.pending.cancelling": "Cancelling…",
  "profile.accountData.stepAway.pending.cancelCta": "Cancel deletion",
  "profile.accountData.stepAway.pending.cancelledToast":
    "Deletion cancelled. Welcome back.",
  "profile.accountData.stepAway.pending.cancelErrorToast":
    "We couldn't cancel that. Please try again.",
  "profile.accountData.stepAway.toast.actionError":
    "Something went wrong. Please try again.",

  "profile.accountData.dsar.article.access": "Access (Art. 15)",
  "profile.accountData.dsar.article.rectification": "Rectification (Art. 16)",
  "profile.accountData.dsar.article.erasure": "Erasure (Art. 17)",
  "profile.accountData.dsar.article.objection": "Objection (Art. 21)",
  "profile.accountData.dsar.title": "Request something else",
  "profile.accountData.dsar.intro":
    "Access, correct, or object to how we use your data: anything beyond what Download and Erase already cover.",
  "profile.accountData.dsar.articleGroupLabel": "Which right?",
  "profile.accountData.dsar.detailsLabel": "What do you need?",
  "profile.accountData.dsar.detailsPlaceholder":
    "Describe what you'd like us to do",
  "profile.accountData.dsar.submitting": "Sending…",
  "profile.accountData.dsar.submitCta": "Send request",
  "profile.accountData.dsar.pastTitle": "Past requests",
  "profile.accountData.dsar.pastHint":
    "We answer every request with a QueerPulse notification, and the status here updates when we do.",
  "profile.accountData.dsar.pastLoading": "Loading your requests…",
  "profile.accountData.dsar.pastError": "We couldn't load your past requests.",
  "profile.accountData.dsar.pastEmpty": "You haven't filed a request yet.",
  "profile.accountData.dsar.pastRowDueBy": "Reply by {date}",
  "profile.accountData.dsar.toast.submitted":
    "Request received, reference {ref}. We'll answer with a QueerPulse notification by {date}.",
  "profile.accountData.dsar.toast.submitError":
    "We couldn't send that request. Please try again.",

  // --- Saved lists (SOC-12) -------------------------------------------------
  // Collections became saved lists so a list can be handed to somebody. The
  // copy below is deliberate about one thing above all: a share link is public,
  // and the member reads that sentence before a link exists.
  "savedLists.header.eyebrow": "Your saves",
  "savedLists.header.title": "Lists worth <em>passing on</em>",
  "savedLists.header.lead":
    "Everything you save lands in one list. Make others for the reasons you saved things: a first date, somewhere open late, the clinics you would send a friend to.",
  "savedLists.header.newCta": "New list",

  "savedLists.empty.title": "Nothing saved yet",
  "savedLists.empty.description":
    "Save an article, a place or a gathering and it will show up here. You can group your saves into lists whenever you want to.",

  "savedLists.newCard.title": "New list",
  "savedLists.newCard.subtitle": "Group saves by the reason you kept them",

  "savedLists.card.meta_one": "1 thing · updated {time}",
  "savedLists.card.meta_other": "{count} things · updated {time}",

  "savedLists.state.private": "Private",
  "savedLists.state.shared": "Link on",

  "savedLists.recent.heading": "Recently saved",
  "savedLists.recent.count_one": "1 save",
  "savedLists.recent.count_other": "{count} saves",
  "savedLists.recent.fileCta": "Add to a list",

  "savedLists.new.eyebrow": "New list",
  "savedLists.new.title": "Name your list",
  "savedLists.new.nameLabel": "List name",
  "savedLists.new.namePlaceholder": "Trans-friendly healthcare",
  "savedLists.new.privateNote":
    "New lists are private. You can create a share link later, from inside the list.",
  "savedLists.new.cancel": "Cancel",
  "savedLists.new.submit": "Create list",

  "savedLists.file.eyebrow": "Add to a list",
  "savedLists.file.title": "Which list?",
  "savedLists.file.cancel": "Cancel",
  "savedLists.file.filing": "Adding…",
  "savedLists.file.empty":
    "You have no lists yet. Create one and this save can go straight into it.",
  "savedLists.file.success.title": "Added",
  "savedLists.file.success.body":
    "It is in {name} now, and still in your saves.",
  "savedLists.file.success.done": "Done",

  "savedLists.detail.rename": "Rename",
  "savedLists.detail.renameLabel": "List name",
  "savedLists.detail.renameSave": "Save",
  "savedLists.detail.renameCancel": "Cancel",
  "savedLists.detail.removeItem": "Take {title} out of this list",
  "savedLists.detail.delete": "Delete list",
  "savedLists.detail.close": "Close",
  "savedLists.detail.empty": "Nothing in this list yet.",
  "savedLists.detail.defaultNote":
    "This list holds everything you have saved. To take something out of it, unsave it.",
  "savedLists.detail.deleteConfirm.title": "Delete {name}?",
  "savedLists.detail.deleteConfirm.body":
    "The list goes. Everything in it stays saved, and stays in any other list you filed it under. Any share link for this list stops working.",
  "savedLists.detail.deleteConfirm.cta": "Delete list",

  "savedLists.share.private.heading": "This list is private",
  "savedLists.share.private.body":
    "Only you can see it. If you want to hand it to someone, you can create a link.",
  "savedLists.share.private.warning":
    "Anyone who has the link can open this list. There is no password and no sign-in, so treat the link itself as the key and only send it to people you trust with it.",
  "savedLists.share.private.cta": "Create a share link",
  "savedLists.share.points.noAccount":
    "They do not need a QueerPulse account to read it.",
  "savedLists.share.points.anonymous":
    "They see the list name and what is in it. They do not see your name, your profile or your photo.",
  "savedLists.share.points.revocable":
    "You can turn the link off at any time. Every copy of it stops working straight away.",

  "savedLists.share.live.heading": "Anyone with this link can open it",
  "savedLists.share.live.body":
    "The link works without an account. It shows the list name and what is in it, and nothing about you.",
  "savedLists.share.live.fieldLabel": "Share link for this list",
  "savedLists.share.live.copy": "Copy",
  "savedLists.share.live.copied": "Copied",
  "savedLists.share.live.copiedToast": "Link copied",
  "savedLists.share.live.copyErrorToast": "Could not copy the link",
  "savedLists.share.live.revoke": "Turn the link off",
  "savedLists.share.live.since": "On since {time}",

  "savedLists.shared.metaTitle": "A shared list",
  "savedLists.shared.loading": "Opening the list…",
  "savedLists.shared.eyebrow": "Shared with you",
  "savedLists.shared.count_one": "1 thing",
  "savedLists.shared.count_other": "{count} things",
  "savedLists.shared.note":
    "Someone made this list on QueerPulse and sent you the link. They can turn it off whenever they want to, and this page will stop working when they do.",
  // Shown when every single thing on a shared list has become unopenable. The
  // list still renders in full: the sender meant to hand it over, and a reader
  // deserves to know the page worked rather than guess that it broke.
  "savedLists.shared.allUnavailable":
    "None of these can be opened any more. Whoever sent you the list may have a newer one.",
  "savedLists.shared.gone.title": "This list is not available",
  "savedLists.shared.gone.body":
    "The link may have been turned off, or it may never have been a real one. Ask whoever sent it to you for a new link.",

  "savedLists.toast.created": "List created",
  "savedLists.toast.createError": "Could not create the list",
  "savedLists.toast.renamed": "List renamed",
  "savedLists.toast.renameError": "Could not rename the list",
  "savedLists.toast.deleted": "List deleted",
  "savedLists.toast.deleteError": "Could not delete the list",
  "savedLists.toast.shared": "Share link created",
  "savedLists.toast.shareError": "Could not create the link",
  "savedLists.toast.revoked": "Link turned off",
  "savedLists.toast.revokeError": "Could not turn the link off",
  "savedLists.toast.fileError": "Could not add it to that list",
  "savedLists.toast.unfiled": "Taken out of the list",
  "savedLists.toast.unfileError": "Could not take it out of the list",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-34c — PRD-34c - /search category tabs. The tab strip now asks the backend (GET /search/types) which result types are actually live, so a closed surface no longer gets a tab that can only show the empty state. These two keys cover the case where that lookup itself fails: the strip falls back to the categories that need no feature flag (All, Pages) and this compact panel says why, with a retry. Search itself still works, so the copy must not read as a search failure. Rendered through the shared LoadErrorState in SearchPage.tsx.
  "search.tabsError.title": "We couldn't load <em>the categories</em>",
  "search.tabsError.body":
    "Search still works and the results below are complete. We just could not check which categories are open, so the filters above are short. Try again in a moment.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-34c — PRD-34c - /search category tabs. The tab strip now asks the backend (GET /search/types) which result types are actually live, so a closed surface no longer gets a tab that can only show the empty state. These two keys cover the case where that lookup itself fails: the strip falls back to the categories that need no feature flag (All, Pages) and this compact panel says why, with a retry. Search itself still works, so the copy must not read as a search failure. Rendered through the shared LoadErrorState in SearchPage.tsx.
};
