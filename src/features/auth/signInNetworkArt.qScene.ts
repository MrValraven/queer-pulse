import type { GlyphTrace } from "./signInNetworkArt.glyph";
import {
  measureScale,
  scatterBokeh,
  scatterDust,
} from "./signInNetworkArt.layout";
import { buildLetterModel, type LetterModel } from "./signInNetworkArt.qLetter";
import type { QPerson, QScene, QThread } from "./signInNetworkArt.qTypes";
import {
  createProjected,
  surfaceDepth,
  TAIL_LIFT,
} from "./signInNetworkArt.projection";
import { createSeededRandom, randomBetween } from "./signInNetworkArt.random";
import type { Tone } from "./signInNetworkArt.types";

/** Builds the 3D Q: the letter's people on the curved surface, the
 *  handshakes that will stitch it in pen order, the hearth in its counter,
 *  pooled newcomers and pulses, and the far dust. Radii are CSS pixels at
 *  the letter's plane; positions are bowl units. */

const CAMERA_DISTANCE = 3.8;
const NEWCOMER_POOL = 4;
/** Spots just outside the letter for newcomers, as angles (degrees) round
 *  the counter's centre. Uneven, and clear of the tail on the lower right. */
const SLOT_ANGLES = [-150, -38, 168, -96, 128, 8];

function createPerson(
  random: () => number,
  homeX: number,
  homeY: number,
  homeZ: number,
  radius: number,
  tone: Tone,
): QPerson {
  return {
    homeX,
    homeY,
    homeZ,
    modelX: homeX,
    modelY: homeY,
    modelZ: homeZ,
    fromX:
      homeX * randomBetween(random, 1.3, 2.3) +
      randomBetween(random, -0.6, 0.6),
    fromY:
      homeY * randomBetween(random, 1.3, 2.3) +
      randomBetween(random, -0.6, 0.6),
    fromZ: homeZ - randomBetween(random, 5, 9),
    arrivesAt: 0,
    view: createProjected(),
    radius,
    tone,
    isTail: false,
    penOrder: 0,
    presence: 0,
    flash: 0,
    rim: Math.max(0, 1 - Math.hypot(homeX, homeY) / 1.5),
    breathPhase: random() * Math.PI * 2,
    newcomer: null,
  };
}

export function createQThread(
  from: QPerson,
  to: QPerson,
  startsAt: number,
  bend: number,
): QThread {
  return {
    from,
    to,
    phase: "waiting",
    startsAt,
    progress: 0,
    glow: 0,
    bend,
    next: null,
    depth: 0,
  };
}

function toneFor(pointIndex: number, isTail: boolean): Tone {
  if (isTail) return pointIndex % 2 ? "coral" : "cream";
  if (pointIndex % 5 === 2) return "coral";
  if (pointIndex % 7 === 4) return "jade";
  return "cream";
}

function buildLetter(
  random: () => number,
  model: LetterModel,
  baseRadius: number,
) {
  const people = model.points.map((point, pointIndex) => {
    const homeZ =
      surfaceDepth(point.u, point.v) + (point.isTail ? TAIL_LIFT : 0);
    const size = point.isTail
      ? randomBetween(random, 1.05, 1.3)
      : randomBetween(random, 0.8, 1.15);
    const person = createPerson(
      random,
      point.u,
      point.v,
      homeZ,
      baseRadius * size,
      toneFor(pointIndex, point.isTail),
    );
    person.isTail = point.isTail;
    person.penOrder = point.penOrder;
    person.arrivesAt = 0.15 + point.penOrder * 1.15 + random() * 0.2;
    return person;
  });
  const threads: QThread[] = [];
  for (const [firstIndex, secondIndex] of model.links) {
    const first = people[firstIndex];
    const second = people[secondIndex];
    if (!first || !second) continue;
    // The pen travels from the lower pen order to the higher, except where
    // the bowl closes at the top, which is stitched last.
    const isClosing = Math.abs(first.penOrder - second.penOrder) > 0.5;
    const isFirstSender = isClosing
      ? first.penOrder > second.penOrder
      : first.penOrder <= second.penOrder;
    const sender = isFirstSender ? first : second;
    const receiver = isFirstSender ? second : first;
    const penOrder = isClosing
      ? 0.84
      : Math.max(sender.penOrder, receiver.penOrder);
    const bend = randomBetween(random, 0.06, 0.14) * (random() < 0.5 ? -1 : 1);
    threads.push(createQThread(sender, receiver, 1.3 + penOrder * 1.8, bend));
  }
  for (const thread of threads) {
    thread.next =
      threads.find((candidate) => candidate.from === thread.to) ?? null;
  }
  return { people, threads };
}

function buildNewcomers(random: () => number, baseRadius: number) {
  const newcomers: QPerson[] = [];
  const threads: QThread[] = [];
  for (let poolIndex = 0; poolIndex < NEWCOMER_POOL; poolIndex += 1) {
    const person = createPerson(
      random,
      0,
      0,
      0,
      baseRadius * randomBetween(random, 0.9, 1.1),
      poolIndex % 2 ? "jade" : "coral",
    );
    const thread = createQThread(person, person, Infinity, 0.16);
    thread.phase = "gone";
    person.newcomer = { phase: "idle", progress: 0, startedAt: 0, thread };
    newcomers.push(person);
    threads.push(thread);
  }
  return { newcomers, threads };
}

export function buildQScene(
  width: number,
  height: number,
  seed: number,
  trace: GlyphTrace | null,
  { insetTop = 0, insetBottom = 0 } = {},
): QScene {
  const random = createSeededRandom(seed);
  // The letter is laid out between the strips kept clear at the top (a
  // status bar) and the foot (the phone band's text).
  const layoutHeight = height - insetTop - insetBottom;
  const scale = measureScale(width, layoutHeight);
  // The phone band is wider than tall; the desktop column is taller than
  // wide.
  const isBand = width / layoutHeight > 1.2;
  const model = buildLetterModel(trace, isBand ? 44 : 72);
  const letterWidth = model.maxU - model.minU;
  const letterHeight = model.maxV - model.minV;
  const pixelsPerUnit = isBand
    ? Math.min((width * 0.5) / letterWidth, (layoutHeight * 0.6) / letterHeight)
    : Math.min(
        (width * 0.6) / letterWidth,
        (layoutHeight * 0.5) / letterHeight,
      );
  // The column keeps the letter clear of the wordmark and caption along its
  // foot; the band keeps its text zone clear through `insetBottom`, so the
  // letter sits in the middle of the space above it.
  const centerY = insetTop + layoutHeight * (isBand ? 0.5 : 0.4);
  const baseRadius = (isBand ? 3.2 : 4.4) * scale;
  const letter = buildLetter(random, model, baseRadius);
  const welcome = buildNewcomers(random, baseRadius);
  const hearth = createPerson(
    random,
    0,
    0,
    surfaceDepth(0, 0) - 0.14,
    0,
    "coral",
  );
  hearth.presence = 1;
  const threads = [...letter.threads, ...welcome.threads];
  const lastStitch = Math.max(
    ...letter.threads.map((thread) => thread.startsAt),
  );
  const people = [...letter.people, ...welcome.newcomers];
  return {
    width,
    height,
    scale,
    isBand,
    time: 0,
    camera: {
      originX: width / 2 - ((model.minU + model.maxU) / 2) * pixelsPerUnit,
      originY: centerY - ((model.minV + model.maxV) / 2) * pixelsPerUnit,
      pixelsPerUnit,
      distance: CAMERA_DISTANCE,
      yaw: 0,
      pitch: 0,
    },
    hearth,
    hearthRadius: (isBand ? 9 : 13) * scale,
    bloom: 0,
    bloomStartsAt: lastStitch + 0.75,
    people,
    drawOrder: [...people],
    threads,
    threadOrder: [...threads],
    letterThreadCount: letter.threads.length,
    lights: Array.from({ length: 4 }, () => ({
      thread: null,
      progress: 0,
      duration: 1,
      hopsLeft: 0,
    })),
    newcomers: welcome.newcomers,
    slots: SLOT_ANGLES.map((angleDegrees) => {
      const angle = (angleDegrees * Math.PI) / 180;
      return { u: Math.cos(angle) * 1.42, v: Math.sin(angle) * 1.36 };
    }),
    nextSlot: 0,
    nextNewcomerAt: lastStitch + 3.5,
    nextPulseAt: lastStitch + 2,
    dust: scatterDust(random, isBand ? 50 : 120, width, height),
    bokeh: scatterBokeh(random, isBand ? 4 : 7, width, height, scale),
    random,
  };
}
