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
  "error.socket.transitionModeInvalid": "Choose Fade or Cut",
  "error.socket.fadeOutOfRange": "Fades run from 0 to 4 seconds",
  "error.socket.overlayTextInvalid":
    "Text on screen fits on one line, with no line breaks or hidden characters",
  "error.socket.overlayTextTooLong":
    "Text on screen can be up to {max} characters",
  "error.socket.overlayTextBlank":
    "Type some text before you show it on the screen",
  "error.socket.overlayStyleInvalid": "Choose Big or Ticker",
  "error.socket.speedInvalid": "Choose a speed of 0.5x, 1x, 1.5x or 2x",
  "error.socket.effectFlagInvalid":
    "The remote sent an effect the server couldn't read. Reload the remote",
  "error.socket.shuffleIntervalInvalid":
    "Shuffle every 2 to 60 seconds, or every 4, 8, 16 or 32 beats",
  "error.socket.bpmOutOfRange": "Tempo runs from 60 to 200 BPM",
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
  "remote.liveLabel": "On the screen now",
  "remote.nothingLive": "The screen is black",
  "remote.clearScreen": "Clear the screen",
  "remote.screens.none": "No screen open",
  "remote.screens.live_one": "{count} screen live",
  "remote.screens.live_other": "{count} screens live",
  "remote.screens.partial": "{live} of {total} screens live",
  "remote.screens.offline_one": "Screen offline",
  "remote.screens.offline_other": "Screens offline",
  "remote.screens.unknown": "Screens unknown until the remote reconnects",
  "remote.packLabel": "Pack",
  "remote.packPlaceholder": "Pick a pack",
  "remote.packEmpty": "This pack has no clips yet. Add some in the VJ library",
  "remote.noPacks": "No packs yet. Make one in the VJ library",
  "remote.pickPackHint": "Choose a pack above to see its clips",
  "remote.clipLive": "Live",
  "remote.clipAria": "Show {title} on the screen",
  "remote.clipLoading": "Loading on the screen, {percent}%",
  "remote.clipQueued": "Waiting to load on the screen",
  "remote.clipFailed": "Couldn't load on the screen",
  "remote.transition": "Transition",
  "remote.fade": "Fade",
  "remote.cut": "Cut",
  "remote.fadeLength": "Fade length",
  "remote.fadeSeconds": "{seconds} s",
  "remote.blackout": "Blackout",
  "remote.effects": "Effects",
  "remote.text": "Text",
  "remote.shuffle": "Shuffle",
  "remote.offline.network": "Can't reach the server. Check your connection",
  "remote.offline.reconnecting": "Reconnecting to the server",
  // ── Effects sheet ──
  "effects.title": "Effects",
  "effects.speed": "Speed",
  "effects.speedValue": "{speed}x",
  "effects.gifSpeedNote":
    "The live clip is a GIF, so it plays at its own speed",
  "effects.monochrome": "Black and white",
  "effects.mirror": "Mirror",
  "effects.hueCycle": "Hue cycle",
  "effects.strobe": "Strobe",
  "effects.strobeHint":
    "White flashes on the beat, at most 3 a second. It turns itself off after 10 seconds",
  "effects.strobeWarning":
    "Flashing light can trigger seizures in people with photosensitive epilepsy. Check the space before you start it",
  "effects.strobeStart": "Start strobe",
  "effects.strobeConfirm": "Start strobe now",
  "effects.strobeStop": "Stop strobe",
  "effects.strobeRemaining": "{seconds} s left",
  "effects.close": "Close effects",
  // ── Text sheet ──
  "text.title": "Text on screen",
  "text.label": "Text",
  "text.charactersLeft": "{count} characters left",
  "text.style": "Style",
  "text.styleBig": "Big",
  "text.styleTicker": "Ticker",
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
  "shuffle.tempo": "Tempo",
  "shuffle.bpmLabel": "BPM",
  "shuffle.bpmOutOfRange": "Pick a tempo from 60 to 200 BPM",
  "shuffle.tapTempo": "Tap tempo",
  "shuffle.tapHint": "Tap along with the beat, four taps or more",
  "shuffle.close": "Close shuffle",
};
