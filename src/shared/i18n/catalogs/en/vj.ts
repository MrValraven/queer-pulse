import type { Catalog } from "../../types";

/**
 * VJ (code id `vj`): the admin VJ library, uploads, and the live screen and remote copy.
 */
export const vj: Catalog = {
  // ── Page ──
  "page.title": "VJ",
  "page.intro":
    "Upload video loops and GIFs into packs, then play them on a projector and switch them live from your phone",
  "page.openScreen": "Open screen",
  "page.openScreenAria": "Open screen in a new tab",
  "page.openRemote": "Open remote",
  "page.openRemoteAria": "Open remote in a new tab",
  "page.loadErrorTitle": "We couldn't load the VJ library",
  "page.retryCta": "Load the library again",
  "page.leaveWhileUploading.body":
    "Your clips are still uploading. If you leave now the uploads stop, and you'll need to add those files again",
  "page.leaveWhileMakingPreviews.body":
    "Previews are still being made. Leaving this page stops them",
  "library.sub": "Every clip you've uploaded, newest first",
  "pack.sub": "The remote shows this pack's clips in this order",

  // ── Packs ──
  "packs.heading": "Packs",
  "packs.allClips": "All clips",
  "packs.clipCount_one": "{count} clip",
  "packs.clipCount_other": "{count} clips",
  "packs.rowMeta_one": "{count} clip, {size}",
  "packs.rowMeta_other": "{count} clips, {size}",
  "packs.showAria": "Show {name}",
  "packs.pickerLabel": "Pack",
  "packs.pickerOption": "{name} ({count})",
  "packs.manage": "Manage packs",
  "packs.empty": "No packs yet. Create one for each part of the night",
  "packs.create.open": "New pack",
  "packs.create.label": "Pack name",
  "packs.create.placeholder": "Warm-up",
  "packs.create.submit": "Create pack",
  "packs.moveUp": "Move {name} up",
  "packs.moveDown": "Move {name} down",
  "packs.movedStatus": "{name} is now number {position}",
  "packs.rename.open": "Rename pack",
  "packs.rename.submit": "Save name",
  "packs.delete.open": "Delete pack",
  "packs.delete.title": "Delete {name}",
  "packs.delete.body_one":
    "The pack goes and its {count} clip stays in the library",
  "packs.delete.body_other":
    "The pack goes and its {count} clips stay in the library",
  "packs.delete.bodyEmpty":
    "This pack holds no clips, so deleting it changes nothing else",
  "packs.delete.confirm": "Delete pack",
  "packs.toast.created": "{name} is ready for clips",
  "packs.toast.renamed": "The pack is now called {name}",
  "packs.toast.deleted":
    "{name} was deleted. Its clips are still in the library",

  // ── Clips and the Edit clip dialog ──
  "clips.empty.packTitle": "No clips in this pack yet",
  "clips.empty.packBody":
    "Upload clips here, or add clips to this pack from All clips",
  "clips.empty.libraryTitle": "No clips yet",
  "clips.empty.libraryBody":
    "Upload MP4, WebM or GIF loops to start the library",
  "clips.gridLabel": "Clips in {name}",
  "clip.editAria": "Edit {title}",
  "clip.metaVideo": "Video, {duration}, {size}",
  "clip.metaGif": "GIF, {size}",
  "clip.packCount_one": "In {count} pack",
  "clip.packCount_other": "In {count} packs",
  "clip.packCountNone": "In no pack",
  "clip.moveEarlier": "Move {title} earlier",
  "clip.moveLater": "Move {title} later",
  "clip.movedStatus": "{title} is now number {position}",
  "clipDialog.title": "Edit clip",
  "clipDialog.playPreview": "Play preview",
  "clipDialog.previewLabel": "Preview of {title}",
  "clipDialog.titleLabel": "Title",
  "clipDialog.saveTitle": "Save title",
  "clipDialog.titleSaved": "Title saved",
  "clipDialog.fitLabel": "On the screen",
  "clipDialog.fit.fill": "Fill",
  "clipDialog.fit.fit": "Fit",
  "clipDialog.fitHint.fill": "Fills the whole screen and crops the edges",
  "clipDialog.fitHint.fit":
    "Shows the whole clip over a blurred copy of itself",
  "clipDialog.details": "{width} by {height} pixels, {size}",
  "clipDialog.addedBy": "Added by {name} on {date}",
  "clipDialog.addedOn": "Added on {date}",
  "clipDialog.packsNone": "No packs yet. Create one in the pack list first",
  "clipDialog.addToPack": "Add to {pack}",
  "clipDialog.removeFromPack": "Remove from {pack}",
  "clipDialog.moveLabel": "Move to another pack",
  "clipDialog.movePlaceholder": "Choose a pack",
  "clipDialog.moveSubmit": "Move clip",
  "clipDialog.toast.added": "{title} is in {pack} now",
  "clipDialog.toast.removed": "{title} left {pack} and stays in the library",
  "clipDialog.toast.moved": "{title} moved to {pack}",
  "clipDialog.deleteOpen": "Delete clip",
  "clipDelete.title": "Delete {title}",
  "clipDelete.body_one":
    "The clip and its files are deleted for good, and it leaves the {count} pack it sits in",
  "clipDelete.body_other":
    "The clip and its files are deleted for good, and it leaves the {count} packs it sits in",
  "clipDelete.bodyNone":
    "The clip and its files are deleted for good. It sits in no pack",
  "clipDelete.confirm": "Delete clip",
  "clipDelete.toast": "{title} was deleted",

  // ── Uploads ──
  "upload.cta": "Upload clips",
  "upload.dropTitle": "Drop clips here",
  "upload.accepts": "MP4 (H.264), WebM or GIF, up to {max} each",
  "upload.destinationPack": "New clips go into {pack}",
  "upload.destinationLibrary":
    "New clips go into the library, outside every pack",
  "upload.rowsLabel": "Uploads",
  "upload.untitledTitle": "Untitled clip",
  "upload.status.queued": "Waiting to upload",
  "upload.status.checking": "Checking the file",
  "upload.status.uploading": "Uploading, {percent}%",
  "upload.status.uploadingAnnounced": "Uploading",
  "upload.status.waiting": "Lots of uploads at once. Trying again in a moment",
  "upload.status.saving": "Adding it to the library",
  "upload.status.doneLibrary": "Added to the library",
  "upload.status.donePack": "Added to {pack}",
  "upload.status.cancelled": "Upload cancelled",
  "upload.progressLabel": "Upload progress for {name}",
  "upload.cancel": "Cancel upload",
  "upload.retry": "Retry upload",
  "upload.removeRow": "Remove from list",
  "upload.removeRowAria": "Remove {name} from the list",
  "upload.clearFinished": "Clear finished uploads",
  "upload.status.previewing": "Making the preview",
  "upload.skipPreview": "Skip preview",
  "upload.previewRetryHint":
    "Make previews in the library tries this clip again",
  // ── Library sections ──
  "libraryView.label": "Library sections",
  "libraryView.clips": "Clips",
  "libraryView.show": "Scenes and set lists",

  // ── Favorites ──
  "favorite.add": "Add {title} to favorites",
  "favorite.remove": "Remove {title} from favorites",
  "favorite.tooltipAdd": "Add to favorites",
  "favorite.tooltipRemove": "Remove from favorites",

  // ── Playback (Edit clip dialog) ──
  "playback.heading": "Playback",
  "playback.loopPointValue": "{seconds} seconds",
  "playback.speedLabel": "Speed",
  "playback.speedValue": "{speed}x",
  "playback.speedHint":
    "The projector plays this clip at this speed times the speed set on the remote",
  "playback.loopModeLabel": "Loop mode",
  "playback.loopMode.loop": "Loop",
  "playback.loopMode.pingPong": "Ping-pong",
  "playback.loopModeHint.loop": "Plays to the end, then starts again",
  "playback.loopModeHint.pingPong": "Plays forward, then backward, and repeats",
  "playback.loopLabel": "Loop points",
  "playback.loopHint":
    "Drag the handles to pick the part of the clip that loops",
  "playback.loopStart": "Loop start",
  "playback.loopEnd": "Loop end",
  "playback.loopLength": "{length} loop",
  "playback.saveLoop": "Save loop",
  "playback.wholeClip": "Use whole clip",
  "playback.loopSaved": "Loop saved",
  "playback.wholeClipSaved": "The whole clip loops now",
  "playback.gifLoopNote":
    "GIFs always loop whole. Speed and loop mode still apply",

  // ── Pack event link ──
  "packEvent.none": "No event linked",
  "packEvent.linked": "Event: {title}, {date}",
  "packEvent.link": "Link event",
  "packEvent.change": "Change event",
  "packEvent.unlink": "Unlink event",
  "packEvent.pickerLabel": "Upcoming event",
  "packEvent.pickerPlaceholder": "Choose an event",
  "packEvent.pickerSearch": "Search events",
  "packEvent.pickerEmpty":
    "No upcoming events. Publish a public or members event first",
  "packEvent.pickerHint":
    "The projector can show this event's date and a QR code to its page",
  "packEvent.qrNote":
    "Scanning the QR code opens the event page, which is for members. Anyone signed out is asked to sign in first",
  "packEvent.submit": "Link event",
  "packEvent.cancel": "Cancel",
  "packEvent.reload": "Load events again",
  "packEvent.online": "Online",
  "packEvent.optionLine": "{date}, {area}",
  "packEvent.toast.linked": "{pack} now links to {event}",
  "packEvent.toast.unlinked": "{pack} has no event linked now",
  "packEvent.unavailable.cancelled":
    "This event was cancelled, so the projector hides its card",
  "packEvent.unavailable.not_listed":
    "This event is no longer published for the public or members, so the projector hides its card",

  // ── Animated previews ──
  "previews.missing_one":
    "{count} clip in your library has no animated preview yet",
  "previews.missing_other":
    "{count} clips in your library have no animated preview yet",
  "previews.doneTitle": "Made",
  "previews.doneTitleEm_one": "{count} preview",
  "previews.doneTitleEm_other": "{count} previews",
  "previews.doneBody":
    "Each clip now shows its moving preview in the library and on the remote",
  "previews.hint":
    "Previews play when you long-press a clip on the remote. Keep this tab open while they're made",
  "previews.start": "Make previews",
  "previews.stop": "Stop making previews",
  "previews.progress": "Making preview {current} of {total}",
  "previews.progressLabel": "Previews made",
  "previews.rowsLabel": "Previews",
  "previews.clipGone": "A clip that left the library",
  "previews.stage.waiting": "Waiting",
  "previews.stage.reading": "Reading the clip",
  "previews.stage.recording": "Recording the preview",
  "previews.stage.uploading": "Uploading the preview",
  "previews.stage.saving": "Saving",
  "previews.stage.done": "Preview ready",
  "previews.stage.failed": "Could not be made",
  "previews.stage.stopped": "Stopped",
  "previews.summaryMade_one": "Made {count} preview",
  "previews.summaryMade_other": "Made {count} previews",
  "previews.summaryFailed_one": "{count} could not be made",
  "previews.summaryFailed_other": "{count} could not be made",
  "previews.retryFailed": "Make failed previews again",
  "previews.close": "Close",

  // ── Library scenes ──
  "libraryScenes.heading": "Scenes",
  "libraryScenes.count": "{count} of {max}",
  "libraryScenes.intro":
    "Save a look as a scene from the remote. Here you can rename, sort and delete scenes",
  "libraryScenes.listLabel": "Scenes in order",
  "libraryScenes.emptyTitle": "No scenes yet",
  "libraryScenes.emptyBody":
    "Open the remote, set up a look and save it as a scene",
  "libraryScenes.loadErrorTitle": "We couldn't load the scenes",
  "libraryScenes.retry": "Load scenes again",
  "libraryScenes.sourceClip": "Clip: {title}",
  "libraryScenes.sourceClipGone": "Clip: deleted",
  "libraryScenes.sourceGenerator": "Generator: {name}",
  "libraryScenes.sourceKeepsLive": "Keeps what is playing",
  "libraryScenes.effectsNone": "No effects",
  "libraryScenes.withText": "With text",
  "libraryScenes.withMix": "With a mix layer",
  "libraryScenes.packNone": "No pack",
  "libraryScenes.moveUp": "Move {name} up",
  "libraryScenes.moveDown": "Move {name} down",
  "libraryScenes.movedStatus": "{name} is now scene {position}",
  "libraryScenes.editAria": "Edit {name}",
  "libraryScenes.nameLabel": "Scene name",
  "libraryScenes.packLabel": "Pack",
  "libraryScenes.save": "Save scene",
  "libraryScenes.cancel": "Cancel",
  "libraryScenes.saved": "Scene saved",
  "libraryScenes.deleteAria": "Delete {name}",
  "libraryScenes.deleteTitle": "Delete {name}",
  "libraryScenes.deleteBody": "The scene leaves the library",
  "libraryScenes.deleteBodySetlists_one":
    "The scene leaves the library and {count} spot in a set list",
  "libraryScenes.deleteBodySetlists_other":
    "The scene leaves the library and {count} spots in set lists",
  "libraryScenes.deleteConfirm": "Delete scene",
  "libraryScenes.deleted": "{name} deleted",

  // ── Library set lists ──
  "librarySetlists.heading": "Set lists",
  "librarySetlists.count": "{count} of {max}",
  "librarySetlists.intro":
    "A set list plays scenes in order. Step through it from the remote",
  "librarySetlists.listLabel": "Set lists in order",
  "librarySetlists.emptyTitle": "No set lists yet",
  "librarySetlists.emptyBody":
    "Create one, then add scenes in the order you want to play them",
  "librarySetlists.loadErrorTitle": "We couldn't load the set lists",
  "librarySetlists.retry": "Load set lists again",
  "librarySetlists.create.open": "New set list",
  "librarySetlists.create.label": "Set list name",
  "librarySetlists.create.submit": "Create set list",
  "librarySetlists.created": "{name} created",
  "librarySetlists.sceneCount_one": "{count} scene",
  "librarySetlists.sceneCount_other": "{count} scenes",
  "librarySetlists.moveUp": "Move {name} up",
  "librarySetlists.moveDown": "Move {name} down",
  "librarySetlists.movedStatus": "{name} is now set list {position}",
  "librarySetlists.editScenes": "Edit scenes",
  "librarySetlists.editScenesAria": "Edit the scenes in {name}",
  "librarySetlists.renameAria": "Rename {name}",
  "librarySetlists.renameSubmit": "Save name",
  "librarySetlists.renamed": "Set list renamed to {name}",
  "librarySetlists.deleteAria": "Delete {name}",
  "librarySetlists.deleteTitle": "Delete {name}",
  "librarySetlists.deleteBody": "The scenes in it stay in the library",
  "librarySetlists.deleteConfirm": "Delete set list",
  "librarySetlists.deleted": "{name} deleted",
  "setlistItems.listLabel": "Scenes in {name}",
  "setlistItems.count": "{count} of {max} scenes",
  "setlistItems.empty":
    "No scenes in this set list yet. Add the first one below",
  "setlistItems.noScenes":
    "Save scenes from the remote first, then add them here",
  "setlistItems.sceneGone": "A deleted scene",
  "setlistItems.moveUp": "Move {scene} up in the set list",
  "setlistItems.moveDown": "Move {scene} down in the set list",
  "setlistItems.movedStatus": "{scene} is now number {position}",
  "setlistItems.remove": "Remove {scene} from {setlist}",
  "setlistItems.removeTooltip": "Remove from set list",
  "setlistItems.removed": "{scene} removed from {setlist}",
  "setlistItems.addLabel": "Add a scene",
  "setlistItems.addPlaceholder": "Choose a scene",
  "setlistItems.addSearch": "Search scenes",
  "setlistItems.addEmpty": "No scenes match",
  "setlistItems.addSubmit": "Add scene",
  "setlistItems.added": "{scene} added as number {position}",
  "setlistItems.full": "This set list is full. Remove a scene to add another",

  // ── Reason codes, REST and upload ──
  "error.packNotFound": "This pack was deleted, maybe in another tab",
  "error.packNameRequired": "Give the pack a name",
  "error.packNameTooLong": "Pack names can be up to {max} characters",
  "error.packNameTaken": "Another pack already has this name",
  "error.packLimitReached":
    "The library holds up to {max} packs. Delete one to create another",
  "error.packReorderMismatch":
    "The packs changed while you were moving them. The list now shows the current order",
  "error.packFull": "A pack holds up to {max} clips. Remove one to add another",
  "error.packClipsReorderMismatch":
    "The clips in this pack changed while you were moving them. The grid now shows the current order",
  "error.clipNotFound": "This clip was deleted, maybe in another tab",
  "error.clipAlreadyInPack": "This clip is already in that pack",
  "error.clipNotInPack": "This clip had already left that pack",
  "error.clipTitleRequired": "Give the clip a title",
  "error.clipTitleTooLong": "Clip titles can be up to {max} characters",
  "error.clipFitModeInvalid": "Choose Fill or Fit",
  "error.clipDimensionsInvalid":
    "We couldn't read this clip's size in pixels, or a side is over 16384 pixels. Export it again and upload the new file",
  "error.clipDurationInvalid":
    "We couldn't read how long this clip is, or it runs over an hour. Clips can be up to an hour long",
  "error.clipKeyInvalid":
    "The upload didn't finish properly. Upload the file again",
  "error.clipKeyInUse":
    "This upload is already a clip in the library. Upload the file again to add it twice",
  "error.clipIdsInvalid":
    "The screen asked for clips in a way the server didn't accept. Reload the screen",
  "error.libraryFull":
    "The library holds up to {max} clips. Delete some to upload more",
  "error.uploadNotAdmin":
    "Only admins can upload VJ clips, and this account isn't an admin",
  "error.uploadTypeUnsupported":
    "This file isn't an MP4, WebM or GIF. Export it in one of those formats and upload it again",
  "error.uploadTooLarge": "This file is {sizeLabel}. Clips can be up to {max}",
  "error.uploadThumbnailTooLarge":
    "The preview image for this clip came out over {max}. Upload the clip again",
  "error.uploadFormatMov":
    "This is a MOV file. Export it as MP4 or WebM and upload it again",
  "error.uploadContentMismatch":
    "The uploaded file doesn't match its format, so it may be damaged. Export it again and upload the new file",
  "error.uploadMissing":
    "The upload stopped before the file reached the server. Upload it again",
  "error.uploadHevc":
    "This MP4 uses HEVC, which browsers can't play. Export it as H.264",
  "error.uploadUnplayable":
    "Your browser can't play this video. Export it as MP4 (H.264) or WebM",
  "error.uploadGifDamaged":
    "This GIF is damaged or cut short. Export it again and upload the new file",
  "error.uploadThumbnailFailed":
    "This browser couldn't make the preview image for this clip. Upload it from Chrome or Edge",
  "error.clipFavoriteInvalid": "Favorite must be on or off",
  "error.clipSpeedInvalid": "Pick a speed from 0.25x to 4x",
  "error.clipLoopModeInvalid": "Pick Loop or Ping-pong",
  "error.clipLoopInvalid":
    "Loop points must sit inside the clip, at least {min} ms apart",
  "error.eventNotFound": "This event no longer exists",
  "error.eventNotLinkable":
    "Only published public and members events can show on the projector",
  "error.sceneNotFound": "This scene no longer exists",
  "error.sceneNameRequired": "Give the scene a name",
  "error.sceneNameTooLong": "Scene names can be up to {max} characters",
  "error.sceneLimitReached":
    "The library holds up to {max} scenes. Delete one to save another",
  "error.sceneLookInvalid": "This look has a setting the projector can't use",
  "error.sceneClipNotFound": "A clip in this look was deleted",
  "error.sceneReorderMismatch": "The new order must list every scene once",
  "error.setlistNotFound": "This set list no longer exists",
  "error.setlistNameRequired": "Give the set list a name",
  "error.setlistNameTooLong": "Set list names can be up to {max} characters",
  "error.setlistNameTaken": "Another set list already has this name",
  "error.setlistLimitReached": "The library holds up to {max} set lists",
  "error.setlistReorderMismatch": "The new order must list every set list once",
  "error.setlistItemsInvalid": "The set list's scenes could not be read",
  "error.setlistFull": "A set list holds up to {max} scenes",
  "error.previewUnsupported":
    "This browser can't make previews. Try Chrome or Edge",
  "error.previewFailed": "The preview for this clip could not be made",
  "error.uploadPreviewTooLarge":
    "This clip's animated preview came out over {max}. Make the preview again",

  // ── Reason codes, socket ──
  "error.socket.notAdmin":
    "VJ is open to admins only, and this account isn't an admin anymore",
  "error.socket.notAttached":
    "The connection to the stage wasn't ready yet. Try again",
  "error.socket.alreadyAttached":
    "This page is already connected to the stage. Reload it to connect again",
  "error.socket.wrongRole":
    "This page can't send that command. Use the remote to change what plays",
  "error.socket.screenIdInvalid":
    "This screen tab couldn't identify itself. Reload the screen",
  "error.socket.clientIdInvalid":
    "This remote couldn't identify itself. Reload the remote",
  "error.socket.rateLimited":
    "That was a lot of taps at once. Wait a second, then tap again",
  "error.socket.staleCommand":
    "Another remote changed this first. The remote now shows what's live",
  "error.socket.staleClipSequence":
    "The clip changed before shuffle moved on. Shuffle carries on from the new clip",
  "error.socket.notLead":
    "Another screen runs the shuffle, so this one follows it",
  "error.socket.shuffleOff": "Shuffle is off, so the screen stays on this clip",
  "error.socket.noActivePack":
    "Pick a pack first. Shuffle plays the clips of the active pack",
  "error.socket.packNotFound": "That pack was deleted, maybe in another tab",
  "error.socket.clipNotFound": "That clip was deleted, maybe in another tab",
  "error.socket.clipNotInPack": "That clip isn't in the active pack anymore",
  "error.socket.patchEmpty":
    "The remote sent a change with nothing in it. Reload the remote",
  "error.socket.transitionModeInvalid": "Pick a transition from the list",
  "error.socket.fadeOutOfRange": "Transitions run from 0 to 4 seconds",
  "error.socket.overlayTextInvalid":
    "Text on screen fits on one line, with no line breaks or hidden characters",
  "error.socket.overlayTextTooLong":
    "Text on screen can be up to {max} characters",
  "error.socket.overlayTextBlank":
    "Type some text before you show it on the screen",
  "error.socket.overlayStyleInvalid": "Pick a text style from the list",
  "error.socket.speedInvalid": "Pick a speed from 0.25x to 4x",
  "error.socket.effectFlagInvalid":
    "The remote sent an effect the server couldn't read. Reload the remote",
  "error.socket.shuffleIntervalInvalid":
    "Shuffle every 2 to 60 seconds, or every 4, 8, 16 or 32 beats",
  "error.socket.bpmOutOfRange": "Tempo runs from 60 to 200 BPM",
  "error.socket.clientOutdated":
    "This page is out of date. Reload it to keep playing",
  "error.socket.immediateNotAllowed":
    "Only blackout, reset look and stopping the strobe skip the beat",
  "error.socket.transitionLengthInvalid":
    "Pick a length of 1, 2, 4, 8 or 16 beats",
  "error.socket.overlayPositionInvalid":
    "Pick top, middle or bottom for the text",
  "error.socket.overlaySizeInvalid": "Pick a text size from S to XL",
  "error.socket.colorTokenInvalid": "Pick a colour from the palette",
  "error.socket.overlayHideOutOfRange":
    "Auto-hide works from 1 second to 10 minutes",
  "error.socket.effectUnknown": "The projector doesn't know this effect",
  "error.socket.effectAmountInvalid": "Effect amounts run from 0 to 100%",
  "error.socket.effectVariantInvalid": "This effect has no such option",
  "error.socket.effectExclusiveConflict":
    "Freeze, Reverse and Ping-pong play one at a time",
  "error.socket.effectsTooMany":
    "Up to {max} effects can run at once. Turn one off first",
  "error.socket.generatorInvalid": "The projector doesn't know this generator",
  "error.socket.generatorVariantInvalid": "This generator has no such option",
  "error.socket.downbeatOutOfRange":
    "This device's clock is too far off to set the beat. Reload the page",
  "error.socket.quantizeInvalid": "Pick Off, Beat or Bar",
  "error.socket.tempoSourceInvalid": "Pick Manual, Tap or Mic",
  "error.socket.tempoSourceConflict": "Mic tempo sets the BPM by itself",
  "error.socket.micUnavailable": "Turn on the mic on the lead screen first",
  "error.socket.mixAmountInvalid": "The crossfader runs from 0 to 100%",
  "error.socket.blendModeInvalid": "Pick a blend mode from the list",
  "error.socket.mixEmpty": "Load a clip on the mix layer to swap",
  "error.socket.shuffleSourceInvalid":
    "Shuffle draws from the pack or its favorites",
  "error.socket.excludedClipsInvalid":
    "The skipped clips list could not be read",
  "error.socket.clipExcluded":
    "That clip is skipped in shuffle, so the screen moves on",
  "error.socket.clipNotFavorite":
    "Shuffle plays favorites now, so the screen moves on",
  "error.socket.screenNotAttached": "That screen is offline",
  "error.socket.overrideInvalid": "A screen follows one clip or one generator",
  "error.socket.overridesTooMany":
    "Up to {max} screens can have their own look",
  "error.socket.sceneNotFound": "This scene was deleted",
  "error.socket.setlistNotFound": "This set list was deleted",
  "error.socket.setlistNone": "Pick a set list first",
  "error.socket.setlistEmpty": "This set list has no scenes yet",
  "error.socket.setlistIndexInvalid": "That scene is no longer in the set list",
  "error.socket.setlistStart": "You're at the start of the set list",
  "error.socket.setlistEnd": "That was the last scene in the set list",
  "error.socket.staleSetlist":
    "Another remote moved the set list first. The remote shows where it is now",
  "error.socket.countdownTargetConflict":
    "Set the countdown by end time or by length",
  "error.socket.countdownOutOfRange":
    "Countdowns run from 1 second to 24 hours",
  "error.socket.countdownTargetMissing": "Set when the countdown ends first",
  "error.socket.countdownLabelInvalid":
    "The countdown label can't hold line breaks or hidden characters",
  "error.socket.countdownLabelTooLong":
    "Countdown labels can be up to {max} characters",
  "error.socket.logoCornerInvalid": "Pick a corner for the logo",
  "error.socket.eventCardKindInvalid": "Pick QR code or Next event",
  "error.socket.eventCardNoEvent":
    "Link this pack to an event in the library first",
  "error.socket.serverError":
    "The server ran into a problem with that command. This one is on us, so try again",

  // ── Failures without a VJ code ──
  "failure.offline":
    "You're offline, so this didn't reach QueerPulse. Check your connection and try again",
  "failure.timeout": "QueerPulse took too long to answer. Try again",
  "failure.rateLimited":
    "You've made a lot of changes in a short time. Wait a minute, then try again",
  "failure.server":
    "Our server ran into a problem. This one is on us, so try again in a moment",
  "failure.unreachable":
    "We couldn't reach QueerPulse. Check your connection, or try again in a moment",
  "failure.forbidden":
    "VJ is open to admins only, and this account isn't an admin",
  "failure.notFound":
    "This server doesn't offer VJ yet. Reload the page, and tell our team if it keeps happening",
  "failure.restricted":
    "You can't make changes while a moderation restriction is in effect on your account",
  "failure.unknown":
    "This didn't go through and the server sent no reason. Try again",

  // ── Connection refusals ──
  "connection.refused.notAdmin":
    "VJ is open to admins only, and this account isn't an admin anymore",
  "connection.refused.screenReplaced":
    "This screen opened in another tab, so this tab stopped. Use the newer tab, or reload this one to take over",
  "connection.refused.sessionRevoked":
    "You were signed out of this account. Sign in again to keep running VJ",
  "connection.refused.unauthorized":
    "Your sign-in ran out. Sign in again to reconnect",
  "connection.refused.platformLocked":
    "QueerPulse is paused for maintenance, so VJ can't connect right now",
  "connection.refused.serverError":
    "The VJ connection couldn't start. Reload the page, and tell our team if it keeps happening",
  "connection.refused.clientOutdated":
    "This page is out of date. Reload it to keep playing",

  // ── Screen (projector) ──
  "screen.metaTitle": "VJ screen",
  "screen.setupTitle": "VJ screen",
  "screen.setupHint":
    "Plug this laptop into the projector, then go fullscreen. From then on the screen shows only the visuals",
  "screen.packName": "Pack: {pack}",
  "screen.noPack": "No pack picked yet. Pick one on the remote",
  "screen.preloadProgress": "{ready} of {total} clips ready",
  "screen.preloadDone": "All {total} clips ready",
  "screen.offlineCached_one":
    "No internet. {count} clip saved on this laptop is ready to play",
  "screen.offlineCached_other":
    "No internet. {count} clips saved on this laptop are ready to play",
  "screen.preloadFailed_one": "{count} clip couldn't load",
  "screen.preloadFailed_other": "{count} clips couldn't load",
  "screen.goFullscreen": "Go fullscreen",
  "screen.fullscreenUnsupported":
    "This browser can't go fullscreen. Open the screen in Chrome or Edge",
  "screen.renderer.webgl2": "Effects engine ready",
  "screen.renderer.dom": "Simple renderer: {reason}",
  "screen.renderer.reason.webgl2Missing":
    "this browser has no WebGL2, so only the simple effects run",
  "screen.renderer.reason.softwareRenderer":
    "this laptop draws graphics without its graphics card, so only the simple effects run",
  "screen.renderer.reason.contextCreationFailed":
    "the graphics card refused to start the effects engine",
  "screen.renderer.reason.programFailed":
    "the graphics card could not build the effects engine",
  "screen.renderer.reason.contextLost":
    "the graphics card reset twice during the show",
  "screen.renderer.reason.forced":
    "the screen link asks for the simple renderer",
  "screen.renderer.restoring":
    "The graphics card reset; the simple renderer holds the show while it recovers",
  "screen.health.line_one": "{fps} fps, {count} dropped frame in the last 5 s",
  "screen.health.line_other":
    "{fps} fps, {count} dropped frames in the last 5 s",
  "screen.health.effectLoad":
    "The effects are heavy for this laptop, so the engine lowered its resolution",
  "screen.identifyEyebrow": "Screen",
  "screen.mic.starting":
    "Waiting for the microphone. If the browser asks, allow it",
  "screen.mic.title": "Tempo from the microphone",
  "screen.mic.hint":
    "Listens on this laptop only. The sound stays here and is never recorded; only the tempo and a level number are used",
  "screen.mic.start": "Listen for the tempo",
  "screen.mic.stop": "Stop listening",
  "screen.mic.searching": "Listening for a steady beat",
  "screen.mic.listening": "{bpm} BPM, {confidence}% sure",
  "screen.mic.level": "Microphone level",
  "screen.mic.pickOnRemote":
    "To follow it, pick Microphone as the tempo source on the remote",
  "screen.mic.followerOnly": "Only the lead screen's microphone sets the tempo",
  "screen.mic.failure.insecure":
    "The microphone needs a secure connection (https)",
  "screen.mic.failure.notSupported":
    "This browser cannot analyse microphone sound",
  "screen.mic.failure.denied":
    "The browser blocked the microphone. Allow it in the site settings and try again",
  "screen.mic.failure.noDevice": "No microphone found on this laptop",
  "screen.mic.failure.inUse": "Another app is using the microphone",
  "screen.mic.failure.workletFailed":
    "The tempo analyser could not start in this browser",
  "screen.mic.failure.interrupted":
    "The microphone stopped. Plug it back in and press Listen for the tempo",
  "screen.eventCard.scan": "Scan for the event",
  "screen.eventCard.nextEvent": "Next event",
  "screen.eventCard.online": "Online",
  "screen.eventCard.qrLabel": "QR code for {title}",
  "screen.eventCard.linked": "Event card: {title}",
  "screen.eventCard.unlinked":
    "This pack has no event linked, so the event card stays hidden",
  "screen.eventCard.unavailable.cancelled":
    "The linked event was cancelled, so the event card stays hidden",
  "screen.eventCard.unavailable.not_listed":
    "The linked event is not public, so the event card stays hidden",
  // ── Preload failures (shown on the setup card and the remote grid) ──
  "preload.failure.url_expired":
    "The download link ran out twice. Reload the screen to try again",
  "preload.failure.network":
    "The download was cut off. It tries again when the connection is back",
  "preload.failure.storage_full":
    "This laptop is out of space for clips. Free some space and reload the screen",
  "preload.failure.decode_failed": "The screen's browser can't play this clip",
  "preload.failure.not_found": "This clip is no longer in the pack",
  // ── Remote ──
  "remote.metaTitle": "VJ remote",
  "remote.backToLibrary": "Back to the VJ library",
  "remote.nothingLive": "The screen is black",
  "remote.clearScreen": "Clear the screen",
  "remote.screens.none": "No screen open",
  "remote.screens.live_one": "{count} screen live",
  "remote.screens.live_other": "{count} screens live",
  "remote.screens.partial": "{live} of {total} screens live",
  "remote.screens.offline_one": "Screen offline",
  "remote.screens.offline_other": "Screens offline",
  "remote.screens.unknown": "Screens unknown until the remote reconnects",
  "remote.packEmpty": "This pack has no clips yet. Add some in the VJ library",
  "remote.noPacks": "No packs yet. Make one in the VJ library",
  "remote.pickPackHint": "Choose a pack above to see its clips",
  "remote.clipLive": "Live",
  "remote.clipAria": "Show {title} on the screen",
  "remote.clipLoading": "Loading on the screen, {percent}%",
  "remote.clipQueued": "Waiting to load on the screen",
  "remote.clipFailed": "Couldn't load on the screen",
  "remote.fadeSeconds": "{seconds} s",
  "remote.blackout": "Blackout",
  "remote.offline.network": "Can't reach the server. Check your connection",
  "remote.offline.reconnecting": "Reconnecting to the server",
  // ── Effects sheet ──
  "effects.speed": "Speed",
  "effects.speedValue": "{speed}x",
  "effects.gifSpeedNote":
    "The live clip is a GIF, so it plays at its own speed",
  "effects.strobe": "Strobe",
  "effects.strobeWarning":
    "Flashing light can trigger seizures in people with photosensitive epilepsy. Check the space before you start it",
  "effects.strobeRemaining": "{seconds} s left",
  "effects.close": "Close effects",
  // ── Text sheet ──
  "text.title": "Text on screen",
  "text.label": "Text",
  "text.charactersLeft": "{count} characters left",
  "text.style": "Style",
  "text.show": "Show text",
  "text.update": "Update text",
  "text.hide": "Hide text",
  "text.recent": "Recent lines",
  "text.recentAria": "Show {text} on the screen",
  "text.clearRecent": "Clear recent lines",
  "text.close": "Close text",
  // ── Shuffle sheet ──
  "shuffle.title": "Shuffle",
  "shuffle.start": "Start shuffle",
  "shuffle.stop": "Stop shuffle",
  "shuffle.isOn": "Shuffle is on",
  "shuffle.every": "Change clip every",
  "shuffle.seconds": "Seconds",
  "shuffle.beats": "Beats",
  "shuffle.secondsValue": "{count} seconds",
  "shuffle.beatsValue": "{count} beats",
  "shuffle.beatsInSeconds": "{beats} beats at {bpm} BPM is {seconds} s",
  "shuffle.bpmLabel": "BPM",
  "shuffle.bpmOutOfRange": "Pick a tempo from 60 to 200 BPM",
  "shuffle.close": "Close shuffle",
  "shuffle.source": "Play from",
  "shuffle.sourcePack": "This pack",
  "shuffle.sourceFavorites": "Favorites in this pack",
  "shuffle.noFavorites": "No favorites in this pack yet. Star some clips first",
  "shuffle.exclude": "Leave out",
  "shuffle.excludeAria": "Leave {title} out of shuffle",
  "shuffle.excludedCount_one": "{count} clip left out",
  "shuffle.excludedCount_other": "{count} clips left out",
  "shuffle.tempoFromDock": "Beats follow the tempo in the dock, now {bpm} BPM",
  // ── Remote top bar ──
  "top.packsAria": "Packs",
  "top.packReady": "{ready} of {total} ready",
  "top.packNotLoaded": "Not loaded on the screens",
  "top.favoritesOnly": "Show favorites only",
  "top.generators": "Generators",
  "top.search": "Search clips",
  "top.closeSearch": "Close search",
  "top.screensAria": "Open screens, {summary}",
  "top.switchTitle": "Switch to {pack}?",
  "top.switchPartial":
    "The screens have {ready} of {total} clips of this pack ready. The rest show once they finish loading",
  "top.switchNotLoaded":
    "The screens haven't loaded this pack yet. Its clips show once they finish loading",
  "top.switchConfirm": "Switch pack",
  "top.switchCancel": "Keep {pack}",

  // ── Remote preview mirror ──
  "mirror.expand": "Make the preview bigger",
  "mirror.collapse": "Make the preview smaller",
  "mirror.live": "Live",
  "mirror.next": "Next",
  "mirror.nextNone": "Nothing cued",
  "mirror.onNextBeat": "On the next beat",
  "mirror.onNextBar": "On the next bar",
  "mirror.effectsOn_one": "{count} effect on",
  "mirror.effectsOn_other": "{count} effects on",
  "mirror.ringShuffle": "Next shuffle change in {seconds} s",
  "mirror.ringApply": "Changes in {seconds} s",
  "mirror.skip": "Skip to next clip",
  "mirror.nextShuffle": "Shuffle: {title}",
  "mirror.nextSetlist": "Scene {position} of {total}: {name}",
  "mirror.nextCue": "Cued: {title}",
  "mirror.generatorLive": "Generator: {name}",
  "mirror.projectorOnly_one": "{count} effect shows only on the projector",
  "mirror.projectorOnly_other": "{count} effects show only on the projector",

  // ── Remote scenes and recent strip ──
  "strip.scenes": "Scenes",
  "strip.recent": "Recent",
  "strip.saveScene": "Save scene",
  "strip.recallAria": "Recall scene {name}",
  "strip.noScenes": "No scenes yet. Save the current look",
  "strip.previous": "Previous",
  "strip.previousAria": "Go back to {title}",
  "strip.recentAria": "Show {title} again",
  "strip.noRecent": "Clips you play show here",
  "strip.setlistNext": "Next scene",
  "strip.setlistPrevious": "Previous scene",
  "strip.setlistPosition": "{position} of {total}",
  "strip.switchAria": "Show scenes or recent clips",
  "strip.openScenes": "Open scenes and set lists",

  // ── Remote clip grid ──
  "grid.label": "Clips",
  "grid.favorite": "Add {title} to favorites",
  "grid.unfavorite": "Remove {title} from favorites",
  "grid.cueAria": "Cue {title}",
  "grid.cued": "Cued",
  "grid.pendingBeat": "Next beat",
  "grid.pendingBar": "Next bar",
  "grid.searchLabel": "Search this pack",
  "grid.searchEmpty": 'No clip in this pack matches "{query}"',
  "grid.favoritesEmpty":
    "No favorites in this pack yet. Tap the star on a clip",
  "grid.previewAria": "Preview of {title}",
  "grid.previewMissing":
    "No moving preview yet. Make previews in the VJ library",
  "grid.generatorAria": "Show the {name} generator on the screen",

  // ── Generators ──
  "generator.name.gradientField": "Gradient field",
  "generator.name.plasma": "Plasma",
  "generator.name.starfield": "Starfield",
  "generator.name.prideFlagWave": "Pride flag wave",
  "generator.name.tunnel": "Tunnel",

  // ── Tempo ──
  "tempo.label": "Tempo",
  "tempo.bpmValue": "{bpm} BPM",
  "tempo.bpmEdit": "Change the tempo, now {bpm} BPM",
  "tempo.tap": "Tap",
  "tempo.tapAria": "Tap tempo",
  "tempo.downbeat": "1",
  "tempo.downbeatAria": "Set the first beat of the bar to now",
  "tempo.quantize": "Quantize",
  "tempo.quantizeOff": "Off",
  "tempo.quantizeBeat": "Beat",
  "tempo.quantizeBar": "Bar",
  "tempo.quantizeAria": "Quantize: {mode}. Tap to change",
  "tempo.sourceMic": "From the screen's microphone",
  "tempo.syncing": "Syncing the clock with the screens",
  "tempo.decrease": "Slower by 1 BPM",
  "tempo.increase": "Faster by 1 BPM",
  "tempo.half": "Half tempo",
  "tempo.double": "Double tempo",
  "tempo.setBpm": "Set tempo",
  "tempo.followMic": "Follow the lead screen's mic",

  // ── Transitions ──
  "transition.title": "Transition",
  "transition.unitAria": "Count the length in",
  "transition.mode.fade": "Fade",
  "transition.mode.cut": "Cut",
  "transition.mode.dipBlack": "Dip to black",
  "transition.mode.dipWhite": "Dip to white",
  "transition.mode.wipeLeft": "Wipe left",
  "transition.mode.wipeRight": "Wipe right",
  "transition.mode.wipeRadial": "Radial wipe",
  "transition.mode.iris": "Iris",
  "transition.mode.zoomBlur": "Zoom blur",
  "transition.mode.glitch": "Glitch",
  "transition.mode.lumaFade": "Luma fade",
  "transition.pickAria": "Transition: {mode}. Change it",
  "transition.lengthBeats_one": "{count} beat",
  "transition.lengthBeats_other": "{count} beats",
  "transition.unitBeats": "Beats",
  "transition.unitSeconds": "Seconds",
  "transition.lengthAria": "Transition length, {value}",
  "transition.flashNote":
    "Flashes white. Counts toward the limit of 3 flashes a second",
  "transition.speedAria": "Clip speed, {speed}x. Change it",

  // ── Effect pads ──
  "pads.label": "Effect pads",
  "pads.allEffects": "All effects",
  "pads.padAria": "{effect}. Tap to keep it on, hold to use it while pressed",
  "pads.tuneTitle": "{effect} settings",
  "pads.amount": "Amount",
  "pads.amountValue": "{percent}%",
  "pads.variant": "Variant",
  "pads.turnOff": "Turn off {effect}",
  "pads.turnOn": "Turn on {effect}",
  "pads.flashMarker": "Flashes",
  "pads.beatMarker": "Follows the beat",
  "pads.closeTune": "Close {effect} settings",
  "pads.playheadNote": "Freeze, Reverse and Ping-pong play one at a time",
  // Short pad faces (the full effect name stays the accessible name)
  "pads.allEffectsShort": "Effects",
  "effects.padLabel.strobe": "Strobe",
  "effects.padLabel.monochrome": "Black & white",
  "effects.padLabel.invert": "Invert",
  "effects.padLabel.saturate": "Saturate",
  "effects.padLabel.contrast": "Contrast",
  "effects.padLabel.tint": "Tint",
  "effects.padLabel.duotone": "Duotone",
  "effects.padLabel.prideGrade": "Pride colours",
  "effects.padLabel.thermal": "Thermal",
  "effects.padLabel.hueCycle": "Hue cycle",
  "effects.padLabel.hueShift": "Hue shift",
  "effects.padLabel.vhs": "VHS",
  "effects.padLabel.filmGrain": "Film grain",
  "effects.padLabel.scanlines": "Scan lines",
  "effects.padLabel.crt": "CRT",
  "effects.padLabel.rgbSplit": "RGB split",
  "effects.padLabel.pixelate": "Pixelate",
  "effects.padLabel.halftone": "Halftone",
  "effects.padLabel.glitch": "Glitch",
  "effects.padLabel.dream": "Dream",
  "effects.padLabel.vignette": "Vignette",
  "effects.padLabel.lightLeaks": "Light leaks",
  "effects.padLabel.mirror": "Mirror",
  "effects.padLabel.kaleidoscope": "Kaleido",
  "effects.padLabel.tile": "Tile",
  "effects.padLabel.kenBurns": "Ken Burns",
  "effects.padLabel.rotate": "Rotate",
  "effects.padLabel.zoomPulse": "Zoom pulse",
  "effects.padLabel.mask": "Mask",
  "effects.padLabel.freeze": "Freeze",
  "effects.padLabel.reverse": "Reverse",
  "effects.padLabel.pingPong": "Ping-pong",
  "effects.padLabel.stutter": "Stutter",
  "effects.padLabel.echo": "Echo trails",
  "effects.padLabel.beatPulse": "Beat pulse",
  "flash.warningTitle": "Flashing light",
  "flash.confirm": "Turn on {effect} now",
  "flash.cancel": "Keep it off",

  // ── Live dock ──
  "dock.label": "Live controls",
  "dock.resetLook": "Reset look",
  "dock.resetDone": "Look reset. Effects, text and mix are off",
  "dock.cue": "Cue",
  "dock.cueAria": "Turn on cue mode",
  "dock.go": "Go",
  "dock.goEmpty": "Tap a clip to cue it",
  "dock.more": "More",
  "dock.moreAria": "More controls",

  // ── Mix sheet ──
  "mix.title": "Mix",
  "mix.crossfader": "Crossfader",
  "mix.crossfaderValue": "{percent}% mix clip",
  "mix.liveSide": "Live",
  "mix.mixSide": "Mix",
  "mix.pickClip": "Mix clip",
  "mix.pickClipAria": "Use {title} as the mix clip",
  "mix.noClip": "Pick a clip to mix in",
  "mix.pickEmpty":
    "The live clip is the only clip in this pack. Add another in the VJ library",
  "mix.blend": "Blend",
  "mix.blend.normal": "Normal",
  "mix.blend.screen": "Screen",
  "mix.blend.multiply": "Multiply",
  "mix.blend.difference": "Difference",
  "mix.blend.add": "Add",
  "mix.blend.lighten": "Lighten",
  "mix.swap": "Swap mix and live",
  "mix.clear": "Clear the mix",
  "mix.close": "Close mix",

  // ── Scenes sheet ──
  "scenes.title": "Scenes and set lists",
  "scenes.defaultName": "Scene {number}",
  "scenes.recall": "Recall scene",
  "scenes.rename": "Rename scene",
  "scenes.nameLabel": "Scene name",
  "scenes.saveName": "Save name",
  "scenes.nameRequired": "Give the scene a name",
  "scenes.delete": "Delete scene",
  "scenes.deleteTitle": "Delete {name}?",
  "scenes.thisPack": "This pack",
  "scenes.anyPack": "Any pack",
  "scenes.setlists": "Set lists",
  "scenes.startSetlist": "Start set list",
  "scenes.stopSetlist": "Stop set list",
  "scenes.makeSetlist": "Make a set list from these scenes",
  "scenes.setlistDefaultName": "Set list {number}",
  "scenes.setlistEmpty": "No set lists yet",
  "scenes.setlistCount_one": "{count} scene",
  "scenes.setlistCount_other": "{count} scenes",
  "scenes.close": "Close scenes",

  // ── Screens sheet ──
  "screensSheet.title": "Screens",
  "screensSheet.number": "Screen {number}",
  "screensSheet.lead": "Leads shuffle",
  "screensSheet.connected": "Connected",
  "screensSheet.disconnected": "Disconnected since {time}",
  "screensSheet.fullscreen": "Full screen",
  "screensSheet.windowed": "In a window",
  "screensSheet.rendererWebgl": "Effects engine",
  "screensSheet.rendererDom": "Simple renderer, some effects are off",
  "screensSheet.fps": "{fps} frames a second",
  "screensSheet.dropped_one": "{count} dropped frame",
  "screensSheet.dropped_other": "{count} dropped frames",
  "screensSheet.cache": "{size} cached",
  "screensSheet.loadWarning":
    "This screen is struggling with the effects. Turn some off",
  "screensSheet.healthUnknown": "This screen hasn't reported its health yet",
  "screensSheet.micOn": "Mic on, level {percent}%",
  "screensSheet.identifyAll": "Show every screen's number",
  "screensSheet.identify": "Show number on screen {number}",
  "screensSheet.override": "What this screen shows",
  "screensSheet.followMain": "Follow the main look",
  "screensSheet.overrideClip": "Clip: {title}",
  "screensSheet.overrideGenerator": "Generator: {name}",
  "screensSheet.empty":
    "No screen open. Open the screen on the projector laptop",
  "screensSheet.close": "Close screens",

  // ── Event card sheet ──
  "eventCard.title": "Event card",
  "eventCard.linked": "Linked event",
  "eventCard.noPack": "Pick a pack to see its event",
  "eventCard.none": "This pack has no event linked. Link one in the VJ library",
  "eventCard.unavailable.cancelled":
    "The linked event was cancelled. Link another one in the VJ library",
  "eventCard.unavailable.notListed":
    "The linked event is no longer listed. Link another one in the VJ library",
  "eventCard.openLibrary": "Open the VJ library",
  "eventCard.showQr": "Show the event QR code",
  "eventCard.showNext": "Show the next event card",
  "eventCard.hide": "Hide event card",
  "eventCard.close": "Close event card",
  "eventCard.qrHint":
    "The QR code opens the event page, which is for members. Anyone who scans it signs in first",
  "eventCard.noQrLink":
    "This server has no app address set, so the card shows without a QR code",
  "eventCard.status.qr": "On the screen: the event QR code",
  "eventCard.status.nextEvent": "On the screen: the next event card",
  "eventCard.status.hidden": "The event card is hidden",

  // ── MIDI sheet ──
  "midi.title": "MIDI controller",
  "midi.unavailableNoWebMidi":
    "This browser has no Web MIDI, so it can't read a controller. iPhone and iPad browsers don't offer it. Use Chrome or Edge on a laptop",
  "midi.turnOn": "Turn on MIDI",
  "midi.requesting": "Waiting for the browser to allow MIDI",
  "midi.denied":
    "The browser blocked MIDI for this site. Allow it in the site settings and try again",
  "midi.failed":
    "The browser couldn't open MIDI. Reconnect the controller and try again",
  "midi.noDevices": "No controller found. Plug one in",
  "midi.devices": "Controllers",
  "midi.map": "Map a control",
  "midi.learnPick": "Tap a clip, pad or control to map",
  "midi.learnMove": "Now press a key or move a knob on your controller",
  "midi.learnCcOnly": "This control needs a knob or fader",
  "midi.learnDone": "Mapped to {target}",
  "midi.learnCancel": "Cancel mapping",
  "midi.mappings": "Mappings",
  "midi.mappingsEmpty": "No mappings yet",
  "midi.removeMapping": "Remove mapping for {target}",
  "midi.removeAll": "Remove all mappings",
  "midi.removeAllTitle": "Remove every mapping on this device?",
  "midi.savedOnDevice": "Mappings are saved on this device",
  "midi.target.clipSlot": "Clip {number}",
  "midi.target.pad": "Pad: {effect}",
  "midi.target.crossfader": "Crossfader",
  "midi.target.transitionLength": "Transition length",
  "midi.target.tapTempo": "Tap tempo",
  "midi.target.go": "Go",
  "midi.target.blackout": "Blackout",
  "midi.control.note": "Note {note}, channel {channel}",
  "midi.control.cc": "Knob {controller}, channel {channel}",
  "midi.close": "Close MIDI",

  // ── Keyboard shortcuts ──
  "keys.title": "Keyboard shortcuts",
  "keys.clips1to9": "Show clips 1 to 9",
  "keys.clips10to18": "Show clips 10 to 18",
  "keys.go": "Go in cue mode",
  "keys.blackout": "Blackout",
  "keys.resetLook": "Reset look",
  "keys.tapTempo": "Tap tempo",
  "keys.quantize": "Change quantize",
  "keys.arrows": "Move between clips",
  "keys.holdPad": "Hold a dock pad while the keys are down",
  "keys.openShortcuts": "Show this list",
  "keys.shift": "Shift",
  "keys.space": "Space",
  "keys.arrowKeys": "Arrow keys",
  "keys.close": "Close shortcuts",

  // ── More controls sheet ──
  "more.title": "More controls",
  "more.cueOn": "Turn on cue mode",
  "more.cueOff": "Turn off cue mode",
  "more.close": "Close more controls",

  // ── Text sheet, v2 styling ──
  "overlay.position": "Position",
  "overlay.position.top": "Top",
  "overlay.position.center": "Middle",
  "overlay.position.bottom": "Bottom",
  "overlay.size": "Size",
  "overlay.size.s": "Small",
  "overlay.size.m": "Medium",
  "overlay.size.l": "Large",
  "overlay.size.xl": "Extra large",
  "overlay.style.big": "Big",
  "overlay.style.ticker": "Ticker",
  "overlay.style.neon": "Neon",
  "overlay.style.outline": "Outline",
  "overlay.style.typewriter": "Typewriter",
  "overlay.style.glitch": "Glitch",
  "overlay.style.stacked": "Stacked",
  "overlay.style.slanted": "Slanted",
  "overlay.color": "Colour",
  "color.cream": "Cream",
  "color.coral": "Coral",
  "color.jade": "Jade",
  "color.amber": "Amber",
  "color.violet": "Violet",
  "color.sky": "Sky",
  "color.rose": "Rose",
  "color.plum": "Plum",
  "overlay.autoHide": "Hide after",
  "overlay.autoHideNever": "Keep showing",
  "overlay.autoHideSeconds": "{count} s",
  "overlay.autoHideMinutes_one": "{count} min",
  "overlay.autoHideMinutes_other": "{count} min",
  "overlay.hidesIn": "Hides in {seconds} s",

  // ── Countdown sheet ──
  "countdown.title": "Countdown",
  "countdown.label": "Label",
  "countdown.labelPlaceholder": "Doors close in",
  "countdown.minutes_one": "{count} minute",
  "countdown.minutes_other": "{count} minutes",
  "countdown.timeLabel": "End time",
  "countdown.pastTime": "Pick a time later today",
  "countdown.show": "Show countdown",
  "countdown.update": "Update countdown",
  "countdown.hide": "Hide countdown",

  // ── Logo sheet ──
  "logo.title": "Logo",
  "logo.corner": "Corner",
  "logo.corner.topLeft": "Top left",
  "logo.corner.topRight": "Top right",
  "logo.corner.bottomLeft": "Bottom left",
  "logo.corner.bottomRight": "Bottom right",
  "logo.show": "Show logo",
  "logo.hide": "Hide logo",

  // ── Effects library ──
  "effect.libraryTitle": "All effects",
  "effect.group.color": "Colour",
  "effect.group.texture": "Texture",
  "effect.group.geometry": "Geometry",
  "effect.group.time": "Time",
  "effect.group.beat": "Beat",
  "effect.addToDock": "Add {effect} to the dock",
  "effect.removeFromDock": "Remove {effect} from the dock",
  "effect.moveLeft": "Move {effect} left",
  "effect.moveRight": "Move {effect} right",
  "effect.dockFull": "The dock holds {count} pads. Remove one first",
  "effect.onCount": "{count} of {max} effects on",
  "effect.name.monochrome": "Black and white",
  "effect.name.invert": "Invert",
  "effect.name.saturate": "Saturate",
  "effect.name.contrast": "Contrast",
  "effect.name.tint": "Tint",
  "effect.name.duotone": "Duotone",
  "effect.name.prideGrade": "Pride colours",
  "effect.name.thermal": "Thermal",
  "effect.name.hueCycle": "Hue cycle",
  "effect.name.hueShift": "Hue shift",
  "effect.name.vhs": "VHS",
  "effect.name.filmGrain": "Film grain",
  "effect.name.scanlines": "Scanlines",
  "effect.name.crt": "CRT",
  "effect.name.rgbSplit": "RGB split",
  "effect.name.pixelate": "Pixelate",
  "effect.name.halftone": "Halftone",
  "effect.name.glitch": "Glitch",
  "effect.name.dream": "Dream",
  "effect.name.vignette": "Vignette",
  "effect.name.lightLeaks": "Light leaks",
  "effect.name.mirror": "Mirror",
  "effect.name.kaleidoscope": "Kaleidoscope",
  "effect.name.tile": "Tile",
  "effect.name.kenBurns": "Ken Burns",
  "effect.name.rotate": "Rotate",
  "effect.name.zoomPulse": "Zoom pulse",
  "effect.name.mask": "Mask",
  "effect.name.freeze": "Freeze",
  "effect.name.reverse": "Reverse",
  "effect.name.pingPong": "Ping-pong",
  "effect.name.stutter": "Stutter",
  "effect.name.echo": "Echo trails",
  "effect.name.beatPulse": "Beat pulse",
  "effect.variant.horizontal": "Horizontal",
  "effect.variant.vertical": "Vertical",
  "effect.variant.quad": "Four ways",
  "effect.variant.steady": "Steady",
  "effect.variant.beat": "On the beat",
  "effect.variant.grid": "{count} by {count}",
  "effect.variant.duotonePair": "{shadow} and {highlight}",
  "effect.variant.segments": "{count} segments",
  "effect.variant.circle": "Circle",
  "effect.variant.heart": "Heart",
  "effect.variant.star": "Star",
  "effect.variant.rainbow": "Rainbow",
  "effect.variant.trans": "Trans",
  "effect.variant.bi": "Bi",
  "effect.variant.lesbian": "Lesbian",
  "effect.variant.nonbinary": "Non-binary",
  "effect.variant.progress": "Progress",
};
