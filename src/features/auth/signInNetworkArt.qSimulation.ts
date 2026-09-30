import { project, surfaceDepth } from "./signInNetworkArt.projection";
import type { QPerson, QScene, QThread } from "./signInNetworkArt.qTypes";
import {
  clamp,
  easeInOutSine,
  easeOutCubic,
  randomBetween,
} from "./signInNetworkArt.random";

/** Advances the 3D Q by one frame: the entrance from deep space, the
 *  handshakes that stitch the letter, the hearth's bloom, the slow sway,
 *  rare calm pulses and the newcomers. Mutates pooled objects only. */

const INVITE_SECONDS = 0.45;
const DRAW_SECONDS = 0.32;
const ENTRANCE_SECONDS = 1.5;
const BLOOM_SECONDS = 1.4;
const NEWCOMER_DRIFT_SECONDS = 3.4;
const LEAVING_SECONDS = 2.6;
const MAXIMUM_NEWCOMERS = 3;
const TWO_PI = Math.PI * 2;

function updateThread(thread: QThread, time: number, deltaSeconds: number) {
  if (thread.phase === "waiting" && time >= thread.startsAt) {
    thread.phase = "inviting";
    thread.progress = 0;
  }
  if (thread.phase === "inviting") {
    thread.progress += deltaSeconds / INVITE_SECONDS;
    if (thread.progress >= 1) {
      thread.phase = "drawing";
      thread.progress = 0;
      thread.to.flash = 1;
    }
  } else if (thread.phase === "drawing") {
    thread.progress += deltaSeconds / DRAW_SECONDS;
    if (thread.progress >= 1) {
      thread.phase = "resting";
      thread.progress = 1;
      thread.glow = 1;
    }
  } else if (thread.phase === "fading") {
    thread.progress += deltaSeconds / LEAVING_SECONDS;
    if (thread.progress >= 1) thread.phase = "gone";
  }
  thread.glow = Math.max(0, thread.glow - deltaSeconds * 0.8);
}

function nearestLetterPerson(scene: QScene, person: QPerson): QPerson {
  let nearest = scene.people[0] ?? person;
  let nearestDistance = Infinity;
  for (const candidate of scene.people) {
    if (candidate.newcomer) continue;
    const distance = Math.hypot(
      candidate.homeX - person.homeX,
      candidate.homeY - person.homeY,
    );
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/** A free person drifts near the letter; the nearest member sends a
 *  handshake; the oldest newcomer heads home when there are too many. */
function startNewcomer(scene: QScene) {
  let oldest: QPerson | null = null;
  let activeCount = 0;
  let idle: QPerson | null = null;
  for (const person of scene.newcomers) {
    const phase = person.newcomer?.phase;
    if (phase === "idle" && !idle) idle = person;
    if (phase === "drifting" || phase === "settled") {
      activeCount += 1;
      if (
        !oldest?.newcomer ||
        (person.newcomer &&
          person.newcomer.startedAt < oldest.newcomer.startedAt)
      )
        oldest = person;
    }
  }
  if (activeCount >= MAXIMUM_NEWCOMERS && oldest?.newcomer) {
    oldest.newcomer.phase = "leaving";
    oldest.newcomer.progress = 0;
    oldest.newcomer.thread.phase = "fading";
    oldest.newcomer.thread.progress = 0;
  }
  const slot = scene.slots[scene.nextSlot % scene.slots.length];
  if (!idle?.newcomer || !slot) return;
  scene.nextSlot += 1;
  idle.homeX = slot.u;
  idle.homeY = slot.v;
  idle.homeZ = surfaceDepth(slot.u, slot.v);
  const outward = Math.hypot(slot.u, slot.v) || 1;
  idle.fromX = slot.u + (slot.u / outward) * 1.4;
  idle.fromY = slot.v + (slot.v / outward) * 1.2;
  idle.fromZ = idle.homeZ - 3.5;
  idle.newcomer.phase = "drifting";
  idle.newcomer.progress = 0;
  idle.newcomer.startedAt = scene.time;
  const thread = idle.newcomer.thread;
  thread.from = nearestLetterPerson(scene, idle);
  thread.to = idle;
  thread.phase = "waiting";
  thread.startsAt = Infinity;
  thread.progress = 0;
}

function updatePerson(scene: QScene, person: QPerson, deltaSeconds: number) {
  const newcomer = person.newcomer;
  let travel = clamp((scene.time - person.arrivesAt) / ENTRANCE_SECONDS, 0, 1);
  if (newcomer) {
    if (newcomer.phase === "drifting") {
      newcomer.progress = Math.min(
        1,
        newcomer.progress + deltaSeconds / NEWCOMER_DRIFT_SECONDS,
      );
      if (newcomer.progress > 0.62 && newcomer.thread.phase === "waiting")
        newcomer.thread.startsAt = scene.time;
      if (newcomer.thread.phase === "resting") newcomer.phase = "settled";
    } else if (newcomer.phase === "leaving") {
      newcomer.progress = Math.min(
        1,
        newcomer.progress + deltaSeconds / LEAVING_SECONDS,
      );
      if (newcomer.progress >= 1) newcomer.phase = "idle";
    }
    travel = newcomer.phase === "drifting" ? newcomer.progress : 1;
    person.presence =
      newcomer.phase === "idle"
        ? 0
        : newcomer.phase === "leaving"
          ? 1 - newcomer.progress
          : Math.min(1, travel * 1.8);
  } else {
    person.presence = Math.min(1, travel * 2.2);
  }
  const eased = easeOutCubic(travel);
  const breathing = Math.sin(scene.time * 0.8 + person.breathPhase) * 0.018;
  person.modelX =
    person.fromX + (person.homeX - person.fromX) * eased + breathing;
  person.modelY =
    person.fromY + (person.homeY - person.fromY) * eased - breathing * 0.6;
  person.modelZ = person.fromZ + (person.homeZ - person.fromZ) * eased;
  person.flash = Math.max(0, person.flash - deltaSeconds * 0.9);
}

function updateLights(scene: QScene, deltaSeconds: number) {
  if (scene.time >= scene.nextPulseAt) {
    scene.nextPulseAt = scene.time + randomBetween(scene.random, 2.8, 4.8);
    const light = scene.lights.find((candidate) => !candidate.thread);
    const thread =
      scene.threads[Math.floor(scene.random() * scene.letterThreadCount)];
    if (light && thread?.phase === "resting") {
      light.thread = thread;
      light.progress = 0;
      light.duration = 0.9;
      light.hopsLeft = 2 + Math.floor(scene.random() * 4);
    }
  }
  for (const light of scene.lights) {
    const thread = light.thread;
    if (!thread) continue;
    light.progress += deltaSeconds / light.duration;
    if (light.progress < 1) continue;
    thread.to.flash = Math.max(thread.to.flash, 0.6);
    const onward = thread.next;
    light.hopsLeft -= 1;
    light.thread =
      light.hopsLeft > 0 && onward?.phase === "resting" ? onward : null;
    light.progress = 0;
  }
}

/** Keeps a nearly sorted list sorted, far to near, in place. */
function insertionSort<Item>(items: Item[], depthOf: (item: Item) => number) {
  for (let outer = 1; outer < items.length; outer += 1) {
    const item = items[outer];
    if (item === undefined) continue;
    let inner = outer - 1;
    while (inner >= 0 && depthOf(items[inner] as Item) > depthOf(item)) {
      items[inner + 1] = items[inner] as Item;
      inner -= 1;
    }
    items[inner + 1] = item;
  }
}

const personDepth = (person: QPerson) => person.view.depth;
const threadDepth = (thread: QThread) => thread.depth;

export function stepQScene(scene: QScene, deltaSeconds: number): void {
  scene.time += deltaSeconds;
  const time = scene.time;
  const swayStart = scene.bloomStartsAt - 1.5;
  const sway = easeInOutSine(clamp((time - swayStart) / 3.5, 0, 1));
  const swayTime = Math.max(0, time - swayStart);
  scene.camera.yaw = sway * 0.34 * Math.sin((swayTime * TWO_PI) / 14);
  scene.camera.pitch =
    sway * (0.05 + 0.07 * Math.sin((swayTime * TWO_PI) / 19));
  scene.bloom = easeOutCubic(
    clamp((time - scene.bloomStartsAt) / BLOOM_SECONDS, 0, 1),
  );
  if (time >= scene.nextNewcomerAt) {
    startNewcomer(scene);
    scene.nextNewcomerAt = time + randomBetween(scene.random, 6, 10);
  }
  for (const person of scene.people) updatePerson(scene, person, deltaSeconds);
  for (const thread of scene.threads) updateThread(thread, time, deltaSeconds);
  updateLights(scene, deltaSeconds);
  projectAll(scene);
}

/** Projects everyone through this frame's camera and re-sorts far to near. */
function projectAll(scene: QScene) {
  const camera = scene.camera;
  for (const person of scene.people) {
    project(camera, person.modelX, person.modelY, person.modelZ, person.view);
  }
  const hearth = scene.hearth;
  project(camera, hearth.modelX, hearth.modelY, hearth.modelZ, hearth.view);
  for (const thread of scene.threads) {
    thread.depth = (thread.from.view.depth + thread.to.view.depth) / 2;
  }
  insertionSort(scene.drawOrder, personDepth);
  insertionSort(scene.threadOrder, threadDepth);
}

/** Reduced motion: the finished Q, turned to a flattering angle, a couple
 *  of threads still glowing from their handshakes and two calm pulses. */
export function composeQStill(scene: QScene): void {
  scene.time = scene.bloomStartsAt + 4;
  scene.nextNewcomerAt = Infinity;
  scene.nextPulseAt = Infinity;
  for (const person of scene.people) person.arrivesAt = -10;
  scene.threads.forEach((thread, threadIndex) => {
    if (threadIndex >= scene.letterThreadCount) return;
    thread.phase = "resting";
    thread.progress = 1;
  });
  stepQScene(scene, 0);
  scene.threads.forEach((thread, threadIndex) => {
    thread.glow = threadIndex % 11 === 3 ? 0.7 : 0;
  });
  scene.camera.yaw = 0.24;
  scene.camera.pitch = 0.08;
  projectAll(scene);
  [0.35, 0.6].forEach((progress, lightIndex) => {
    const light = scene.lights[lightIndex];
    const thread =
      scene.threads[
        Math.floor(((lightIndex + 1) * scene.letterThreadCount) / 3)
      ];
    if (light && thread) {
      light.thread = thread;
      light.progress = progress;
    }
  });
}
