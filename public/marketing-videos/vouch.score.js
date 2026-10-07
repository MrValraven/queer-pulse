/**
 * QueerPulse film "Vouched" (how people get vouched in): the score.
 *
 * 120 BPM deep house in Db major, warmer than the pro cut: Dbmaj9, Bbm11,
 * Gbmaj9, Ab6/9 by bar (mod 4), with the last bar held on Dbmaj9 so the film
 * closes on a plagal Gb to Db. It opens intimate (pads, a low drone, soft
 * arpeggios, the filter opening), the beat comes in light with the invite
 * (kick and shaker), the full groove arrives at the portal, takes a breath at
 * the welcome, lifts at the weight of a vouch, and lands on the lockup with
 * an impact and bells. On top sits quiet interface sound design: a click on
 * every headline, key clicks while a note types, a chime on every tick, and
 * glass notes for faces, mutual friends and the vouch tree, every one of them
 * timed by vouch.html's window.CUES. The synth voices are the pro cut's.
 *
 * Loaded into vouch.html by render.mjs (--video vouch) and the admin renderer;
 * `window.renderScore()` resolves to a base64 16-bit stereo WAV.
 */
(function () {
  const SR = 48000;
  const BEAT = 0.5;
  const BAR = 2;
  const bar = (n) => n * BAR;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Rootless voicings in the pro cut's register, voice-led so each bar moves
  // one or two notes: Db (F Ab C Eb), Bbm11 (F Ab Db Eb), Gb (F Ab Bb Db),
  // Ab6/9 (F Bb C Eb).
  const CHORDS = {
    Db: { bass: 37, pad: [53, 56, 60, 63] },
    Bbm: { bass: 34, pad: [53, 56, 61, 63] },
    Gb: { bass: 42, pad: [53, 56, 58, 61] },
    Ab: { bass: 44, pad: [53, 58, 60, 63] },
  };
  const PROGRESSION = ["Db", "Bbm", "Gb", "Ab"];
  // The final bar (27) resolves home on Db after bar 26's Gb.
  const FINAL_BAR = 27;
  const chordAt = (n) => (n >= FINAL_BAR ? "Db" : PROGRESSION[n % 4]);

  function makeIR(ctx, seconds, decay) {
    const len = Math.floor(SR * seconds);
    const ir = ctx.createBuffer(2, len, SR);
    let seed = 99;
    const rnd = () =>
      ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = rnd() * Math.pow(1 - i / len, decay);
    }
    return ir;
  }

  window.renderScore = async function renderScore() {
    const CUES = window.CUES || {};
    const LEN = CUES.duration || 56;
    const ctx = new OfflineAudioContext(2, Math.ceil(SR * LEN), SR);

    // Cue readers: a missing or malformed cue plays nothing.
    const cueTime = (key) =>
      typeof CUES[key] === "number" && Number.isFinite(CUES[key])
        ? CUES[key]
        : null;
    const cueTimes = (key) =>
      Array.isArray(CUES[key])
        ? CUES[key].filter(
            (time) => typeof time === "number" && Number.isFinite(time),
          )
        : [];
    const cueSpan = (key) => {
      const span = cueTimes(key);
      return span.length >= 2 && span[1] > span[0] ? span : null;
    };

    /* ── Busses ── */
    const master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    comp.knee.value = 12;
    comp.attack.value = 0.008;
    comp.release.value = 0.22;
    master.connect(comp).connect(ctx.destination);
    master.gain.setValueAtTime(1, 0);
    master.gain.setValueAtTime(1, LEN - 1.0);
    master.gain.linearRampToValueAtTime(0, LEN - 0.05);

    const reverb = ctx.createConvolver();
    reverb.buffer = makeIR(ctx, 3.6, 2.6);
    const verb = ctx.createGain();
    verb.gain.value = 0.55;
    verb.connect(reverb).connect(master);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = BEAT * 0.75; // dotted eighth
    const fb = ctx.createGain();
    fb.gain.value = 0.36;
    const fbLp = ctx.createBiquadFilter();
    fbLp.type = "lowpass";
    fbLp.frequency.value = 3200;
    delay.connect(fbLp).connect(fb).connect(delay);
    const echo = ctx.createGain();
    echo.gain.value = 0.32;
    echo.connect(delay);
    fbLp.connect(master);
    fbLp.connect(verb);

    // Pads and bass duck under the kick: the pulse you feel more than hear.
    const pump = ctx.createGain();
    pump.connect(master);
    const pumpVerb = ctx.createGain();
    pumpVerb.gain.value = 0.45;
    pump.connect(pumpVerb).connect(verb);

    const noiseBuf = ctx.createBuffer(1, SR * 2, SR);
    {
      const d = noiseBuf.getChannelData(0);
      let s = 7;
      for (let i = 0; i < d.length; i++)
        d[i] = ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    }
    let noiseOffset = 0;
    const noise = (t, dur) => {
      const n = ctx.createBufferSource();
      n.buffer = noiseBuf;
      n.loop = true;
      n.start(t, (noiseOffset = (noiseOffset + 0.377) % 1.5));
      n.stop(t + dur + 0.05);
      return n;
    };
    const env = (g, t, a, peak, d, end = 0.0001) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(end, t + a + d);
    };
    const pan = (v) => {
      const p = ctx.createStereoPanner();
      p.pan.value = v;
      return p;
    };

    /* ── Voices ── */
    function kick(t, v = 1, lo = 44, hi = 150, dec = 0.42) {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.frequency.setValueAtTime(hi, t);
      o.frequency.exponentialRampToValueAtTime(lo, t + 0.12);
      env(g, t, 0.003, v, dec);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dec + 0.1);
      const n = noise(t, 0.02),
        hp = ctx.createBiquadFilter(),
        ng = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 2500;
      env(ng, t, 0.001, 0.12 * v, 0.015);
      n.connect(hp).connect(ng).connect(master);
    }
    function hat(t, v = 0.2, open = false, p = 0) {
      const n = noise(t, open ? 0.25 : 0.06),
        hp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 7800;
      env(g, t, 0.001, v, open ? 0.2 : 0.045);
      n.connect(hp).connect(g).connect(pan(p)).connect(master);
    }
    function clap(t, v = 0.5) {
      const n = noise(t, 0.3),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = "bandpass";
      bp.frequency.value = 1500;
      bp.Q.value = 0.9;
      g.gain.setValueAtTime(0.0001, t);
      [0, 0.011, 0.023].forEach((o) => {
        g.gain.setValueAtTime(v, t + o);
        g.gain.exponentialRampToValueAtTime(v * 0.25, t + o + 0.009);
      });
      g.gain.setValueAtTime(v * 0.8, t + 0.034);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      n.connect(bp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function riser(t0, t1, v = 0.3) {
      const n = noise(t0, t1 - t0),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = "bandpass";
      bp.Q.value = 2.2;
      bp.frequency.setValueAtTime(300, t0);
      bp.frequency.exponentialRampToValueAtTime(7500, t1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t1 - 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.02);
      n.connect(bp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function swell(t, dur = 1.2, v = 0.18) {
      const n = noise(t - dur, dur),
        hp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 2800;
      g.gain.setValueAtTime(0.0001, t - dur);
      g.gain.exponentialRampToValueAtTime(v, t - 0.01);
      g.gain.linearRampToValueAtTime(0.0001, t + 0.01);
      n.connect(hp).connect(g);
      g.connect(master);
      g.connect(verb);
    }
    function impact(t, v = 1) {
      kick(t, 1.0 * v, 30, 110, 1.6);
      const n = noise(t, 1.6),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(5000, t);
      lp.frequency.exponentialRampToValueAtTime(300, t + 1.2);
      env(g, t, 0.002, 0.35 * v, 1.4);
      n.connect(lp).connect(g);
      g.connect(verb);
      g.connect(master);
    }
    function pad(t0, t1, notes, cutoff, v = 0.05) {
      const lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      lp.type = "lowpass";
      lp.frequency.value = cutoff;
      lp.Q.value = 0.6;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(v, t0 + 0.5);
      g.gain.setValueAtTime(v, t1 - 0.05);
      g.gain.linearRampToValueAtTime(0.0001, t1 + 0.9);
      lp.connect(g).connect(pump);
      notes.forEach((m, i) =>
        [-8, 0, 8].forEach((c) => {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = hz(m);
          o.detune.value = c + (i % 2 ? 2 : -2);
          const p = pan(c / 14);
          o.connect(p).connect(lp);
          o.start(t0);
          o.stop(t1 + 1);
        }),
      );
    }
    function bass(t, dur, m, v = 0.28) {
      const o = ctx.createOscillator(),
        o2 = ctx.createOscillator(),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      o.frequency.value = hz(m);
      o2.type = "triangle";
      o2.frequency.value = hz(m + 12);
      lp.type = "lowpass";
      lp.frequency.value = 420;
      const g2 = ctx.createGain();
      g2.gain.value = 0.25;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.02);
      g.gain.setValueAtTime(v, t + dur - 0.04);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(lp);
      o2.connect(g2).connect(lp);
      lp.connect(g).connect(pump);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.05);
      o2.stop(t + dur + 0.05);
    }
    function pluck(t, m, v = 0.09, p = 0, bright = 4200) {
      const o = ctx.createOscillator(),
        o2 = ctx.createOscillator(),
        lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      o.type = "triangle";
      o2.type = "square";
      o.frequency.value = hz(m);
      o2.frequency.value = hz(m);
      o2.detune.value = 6;
      const g2 = ctx.createGain();
      g2.gain.value = 0.18;
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(bright, t);
      lp.frequency.exponentialRampToValueAtTime(700, t + 0.22);
      env(g, t, 0.003, v, 0.38);
      o.connect(lp);
      o2.connect(g2).connect(lp);
      const pn = pan(p);
      lp.connect(g).connect(pn);
      pn.connect(master);
      pn.connect(echo);
      pn.connect(verb);
      o.start(t);
      o2.start(t);
      o.stop(t + 0.5);
      o2.stop(t + 0.5);
    }
    function bell(t, m, v = 0.08, p = 0) {
      const pn = pan(p);
      pn.connect(master);
      pn.connect(verb);
      pn.connect(echo);
      [
        [1, 1, 2.6],
        [2.76, 0.4, 1.3],
        [5.4, 0.2, 0.6],
        [8.93, 0.1, 0.3],
      ].forEach(([r, a, d]) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.frequency.value = hz(m) * r;
        env(g, t, 0.004, v * a, d);
        o.connect(g).connect(pn);
        o.start(t);
        o.stop(t + d + 0.1);
      });
    }
    // A low hum on Db under the opening (Db1, Db2, Ab2).
    function drone(t0, t1) {
      const g = ctx.createGain(),
        lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 180;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 3);
      g.gain.setValueAtTime(0.05, t1 - 2);
      g.gain.linearRampToValueAtTime(0.0001, t1);
      [
        [hz(25), 0],
        [hz(37), 4],
        [hz(44), -3],
      ].forEach(([f, c]) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        o.detune.value = c;
        o.connect(lp);
        o.start(t0);
        o.stop(t1 + 0.1);
      });
      lp.connect(g).connect(master);
      g.connect(verb);
    }

    /* ── Arrangement ── (bar numbers match the scene starts in vouch.html,
       28 bars: open 0-2, invite 3-5, portal 6-8, welcome 9-10, profile
       11-14, weight 15-16, forward 17-20, network 21-23, end 24-27.) */
    const kicks = [];
    const K = (t, v = 0.9) => {
      kick(t, v, 42, 125, 0.38);
      kicks.push(t);
    };
    const CH = (n) => CHORDS[chordAt(Math.max(0, n))];
    const chordAtTime = (t) => CH(Math.floor(t / BAR));
    // The name's bell spray: root, then the pad an octave up (Dbmaj9, bar 24).
    const nameBells = (n) => [
      CH(n).bass + 24,
      ...CH(n).pad.map((m) => m + 12),
    ];
    // Interface sound: a dry click with a whisper of pitch, for type and UI.
    function tick(t, v = 0.05, f = 2400) {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.03);
      env(g, t, 0.001, v, 0.035);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.08);
      const n = noise(t, 0.01),
        hp = ctx.createBiquadFilter(),
        ng = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 5000;
      env(ng, t, 0.0005, v * 0.6, 0.006);
      n.connect(hp).connect(ng).connect(master);
    }
    // A soft glass note: sine with a short tail into the echo.
    function blip(t, m, v = 0.05, p = 0) {
      const o = ctx.createOscillator(),
        g = ctx.createGain(),
        pn = pan(p);
      o.frequency.value = hz(m);
      env(g, t, 0.004, v, 0.5);
      o.connect(g).connect(pn);
      pn.connect(master);
      pn.connect(echo);
      pn.connect(verb);
      o.start(t);
      o.stop(t + 0.6);
    }
    // Air moving past the camera: band-passed noise that rises, then falls.
    function whoosh(t0, dur, v = 0.16, from = -0.6, to = 0.6) {
      const n = noise(t0, dur + 0.2),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain(),
        p = ctx.createStereoPanner();
      bp.type = "bandpass";
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(400, t0);
      bp.frequency.exponentialRampToValueAtTime(3200, t0 + dur * 0.55);
      bp.frequency.exponentialRampToValueAtTime(700, t0 + dur + 0.15);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t0 + dur * 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.2);
      p.pan.setValueAtTime(from, t0);
      p.pan.linearRampToValueAtTime(to, t0 + dur);
      n.connect(bp).connect(g).connect(p);
      p.connect(master);
      p.connect(verb);
    }
    function shaker(t, v = 0.04, p = 0.25) {
      const n = noise(t, 0.05),
        bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = "bandpass";
      bp.frequency.value = 6500;
      bp.Q.value = 1.2;
      env(g, t, 0.006, v, 0.04);
      n.connect(bp).connect(g).connect(pan(p)).connect(master);
    }
    // Sixteenth-note arpeggio through the chord, filtered so it sits back.
    const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
    function arp(n, v = 0.035, bright = 2200) {
      const c = CH(n).pad;
      for (let s = 0; s < 16; s++) {
        const m = c[ARP[s % ARP.length]] + 12;
        pluck(
          bar(n) + (s * BEAT) / 4,
          m,
          v * (s % 4 === 0 ? 1 : 0.7),
          s % 2 ? 0.35 : -0.35,
          bright,
        );
      }
    }
    // The pro cut's groove, with the open hat and the shaker switchable apart
    // and the kick's level adjustable, so the beat can enter light.
    function groove(n, o = {}) {
      const {
        kickOn = true,
        kickV = 0.9,
        clapOn = true,
        openHatOn = true,
        shakerOn = true,
        bassOn = true,
        arpOn = true,
        arpV = 0.035,
        arpBright = 2200,
      } = o;
      const c = CH(n);
      for (let b = 0; b < 4; b++) {
        const t = bar(n) + b * BEAT;
        if (kickOn) K(t, kickV);
        if (clapOn && (b === 1 || b === 3)) clap(t, 0.24);
        if (openHatOn) hat(t + BEAT / 2, 0.1, true, 0.15);
        if (shakerOn)
          for (let s = 0; s < 4; s++)
            shaker(t + (s * BEAT) / 4, s % 2 ? 0.035 : 0.02);
      }
      // Deep-house bass: a short root on one, then the off-beats.
      if (bassOn)
        [
          [0, 0.2, 0],
          [1.5, 0.22, 0],
          [2.5, 0.22, 12],
          [3.5, 0.2, 0],
        ].forEach(([b, d, oct]) =>
          bass(bar(n) + b * BEAT, d, c.bass + oct, 0.26),
        );
      if (arpOn) arp(n, arpV, arpBright);
    }
    // Db major pentatonic, F5 to Ab6: fits every chord of the progression.
    const PENTA = [77, 80, 82, 85, 87, 89, 92];
    const blips = (times, v = 0.035, base = 0) =>
      times.forEach((t, i) =>
        blip(t, PENTA[(i * 2 + base) % PENTA.length], v, ((i % 5) - 2) * 0.3),
      );
    // Key clicks while a note types: one quiet click about every 0.12s, with
    // a little fixed jitter and pitch drift so it sounds like fingers.
    function typingClicks(startTime, endTime, volume = 0.014) {
      const clickGap = 0.12;
      for (
        let clickIndex = 0;
        startTime + clickIndex * clickGap < endTime;
        clickIndex++
      ) {
        const clickJitter = ((clickIndex * 37) % 7) * 0.005;
        const clickPitch = 2300 + ((clickIndex * 53) % 5) * 180;
        tick(
          startTime + clickIndex * clickGap + clickJitter,
          volume * (clickIndex % 3 === 0 ? 1 : 0.7),
          clickPitch,
        );
      }
    }
    // Send: a button click and a soft bell on the bar's ninth or fifth.
    function sendSound(time) {
      tick(time, 0.05, 2800);
      tick(time + 0.05, 0.025, 2000);
      bell(time + 0.02, chordAtTime(time).pad[2] + 24, 0.028, 0.1);
    }
    // A tick lands: two rising glass notes from the bar's chord.
    function tickChime(time, volume = 0.034, panPosition = 0) {
      const chordNotes = chordAtTime(time).pad;
      blip(time, chordNotes[1] + 24, volume, panPosition - 0.15);
      blip(time + 0.09, chordNotes[3] + 24, volume * 0.8, panPosition + 0.15);
    }
    // A pair of bells from the bar's chord, low note first.
    function bellPair(time, lowIndex, highIndex, volume = 0.04) {
      const chordNotes = chordAtTime(time).pad;
      bell(time, chordNotes[lowIndex] + 24, volume, -0.2);
      bell(time + 0.12, chordNotes[highIndex] + 24, volume * 0.8, 0.2);
    }

    // Pads under everything; the filter opens across the opening and again
    // for the weight of a vouch (bars 15-16).
    const weightBars = [15, 16];
    for (let n = 0; n < FINAL_BAR; n++)
      pad(
        bar(n),
        bar(n + 1),
        CH(n).pad,
        n < 3 ? 500 + n * 400 : weightBars.includes(n) ? 2300 : 1700,
        n < 3 ? 0.03 : 0.024,
      );
    drone(0, bar(5));

    // Every headline types in on a click (the last one is the CTA).
    cueTimes("lines").forEach((t) => {
      tick(t, 0.06, 2600);
      tick(t + 0.12, 0.035, 2000);
    });

    // Open (bars 0-2): pads, drone and soft arpeggios, no kick. Faces pop in
    // on glass notes; off-beat hats and a held bass lean into the invite.
    blips(cueTimes("pops"), 0.04);
    arp(1, 0.02, 1300);
    arp(2, 0.026, 1700);
    for (let b = 0; b < 4; b++)
      hat(bar(2) + b * BEAT + BEAT / 2, 0.06, false, 0.2);
    bass(bar(2), 1.9, CH(2).bass, 0.16);
    swell(bar(3), 0.9, 0.08);

    // Invite (bars 3-5): the beat comes in light, kick and shaker; the open
    // hat joins in bar 5. Bilal's note types, he sends it, it ticks to sent.
    groove(3, { kickV: 0.72, clapOn: false, openHatOn: false, arpV: 0.028 });
    groove(4, { kickV: 0.76, clapOn: false, openHatOn: false, arpV: 0.03 });
    groove(5, { kickV: 0.82, clapOn: false, arpV: 0.032 });
    const noteSpan = cueSpan("note");
    if (noteSpan) typingClicks(noteSpan[0], noteSpan[1]);
    const sendTime = cueTime("send");
    if (sendTime != null) sendSound(sendTime);
    const sentTime = cueTime("sent");
    if (sentTime != null) tickChime(sentTime);
    swell(bar(6), 0.8, 0.07);

    // Portal (bars 6-8): the full groove. Two friends' hands meet on a warm
    // two-note bell, they walk into the portal on a rising run of glass notes,
    // and the portal pulses with a bell on the chord's root and a swell.
    for (let n = 6; n < 9; n++) groove(n);
    const handsTime = cueTime("hands");
    if (handsTime != null) {
      const handsChord = chordAtTime(handsTime).pad;
      bell(handsTime, handsChord[1] + 24, 0.03, -0.15);
      bell(handsTime + 0.1, handsChord[3] + 24, 0.022, 0.15);
    }
    const portalTimes = cueTimes("portal");
    if (portalTimes.length >= 2 && portalTimes[1] > portalTimes[0]) {
      const [stepThroughStart, pulse] = portalTimes;
      const walkChord = chordAtTime(stepThroughStart).pad;
      const walkNotes = [...walkChord].sort((low, high) => low - high);
      const stepGap = (pulse - stepThroughStart) / walkNotes.length;
      walkNotes.forEach((m, i) =>
        blip(
          stepThroughStart + i * stepGap,
          m + 24,
          0.018 + i * 0.004,
          -0.3 + i * 0.2,
        ),
      );
      const pulseChord = chordAtTime(pulse);
      swell(pulse, 0.5, 0.05);
      bell(pulse, pulseChord.bass + 36, 0.035, 0);
      bell(pulse + 0.08, pulseChord.bass + 48, 0.018, 0.1);
    }

    // Welcome (bars 9-10): a breath. The kick, clap and open hat drop out;
    // bass, arpeggio and a quiet shaker carry the two checklist ticks. A
    // riser brings the beat back for the profile.
    groove(9, { kickOn: false, clapOn: false, openHatOn: false, arpV: 0.03 });
    groove(10, { kickOn: false, clapOn: false, openHatOn: false, arpV: 0.032 });
    cueTimes("checks").forEach((t, i) =>
      tickChime(t, 0.034, i % 2 ? 0.2 : -0.2),
    );
    riser(bar(10) + 1, bar(11), 0.14);

    // Profile (bars 11-14): the full groove. The portal blooms into Ines's
    // profile on a swell and a low bell, her tick chimes, and three mutual
    // friends pop in on glass notes with an octave sparkle above each.
    for (let n = 11; n < 15; n++) groove(n);
    const bloomTime = cueTime("bloom");
    if (bloomTime != null) {
      swell(bloomTime, 1.0, 0.08);
      bell(bloomTime, chordAtTime(bloomTime).pad[0] + 24, 0.03, 0);
    }
    const profileTickTime = cueTime("tick");
    if (profileTickTime != null) tickChime(profileTickTime);
    const mutualTimes = cueTimes("mutuals");
    blips(mutualTimes, 0.042, 2);
    mutualTimes.forEach((t, i) =>
      blip(
        t + 0.03,
        PENTA[(i * 2 + 2) % PENTA.length] + 12,
        0.014,
        ((i % 5) - 2) * -0.3,
      ),
    );

    // Weight (bars 15-16): a lift. The camera pushes in on air, the pads and
    // arpeggio open up, the highlight ring rings, and a riser carries bar 16
    // into the forward section.
    whoosh(bar(15), 0.9, 0.1, -0.4, 0.4);
    groove(15, { arpBright: 2800 });
    groove(16, { arpBright: 3200, arpV: 0.038 });
    const weightTime = cueTime("weight");
    if (weightTime != null) {
      swell(weightTime, 0.6, 0.05);
      bellPair(weightTime, 0, 2, 0.04);
    }
    riser(bar(16), bar(17), 0.18);

    // Forward (bars 17-20): full energy. Ines's note to Sam types, sends and
    // ticks; then the small tree draws Bilal, Ines, Sam on glass notes.
    for (let n = 17; n < 21; n++) groove(n);
    const forwardNoteSpan = cueSpan("forwardNote");
    if (forwardNoteSpan) typingClicks(forwardNoteSpan[0], forwardNoteSpan[1]);
    const forwardSendTime = cueTime("forwardSend");
    if (forwardSendTime != null) sendSound(forwardSendTime);
    const forwardSentTime = cueTime("forwardSent");
    if (forwardSentTime != null) tickChime(forwardSentTime);
    blips(cueTimes("treeNodes"), 0.04, 0);

    // Network (bars 21-23): the small tree pulls back into the big one on a
    // whoosh, the tree grows in glassy notes, and the chain lights on a bell
    // pair. A riser carries bar 23 into the lockup.
    for (let n = 21; n < 24; n++) groove(n);
    const handoffTime = cueTime("handoff");
    if (handoffTime != null) whoosh(handoffTime, 0.9, 0.14, 0.5, -0.5);
    blips(cueTimes("netPops"), 0.022, 1);
    const vouchHighlightTime = cueTime("vouchHighlight");
    if (vouchHighlightTime != null) bellPair(vouchHighlightTime, 1, 3, 0.045);
    riser(bar(23) + 1, bar(24), 0.2);

    // End (bars 24-27): the name lands on Dbmaj9 with an impact and a bell
    // spray, the groove plays once more, the beat lifts out under the CTA,
    // and the last bar rings out on Db (Gb to Db, a plagal close).
    const endBar = 24;
    impact(bar(endBar), 0.85);
    nameBells(endBar).forEach((m, i) =>
      bell(bar(endBar) + 0.05 + i * 0.06, m + 12, 0.05, -0.4 + i * 0.2),
    );
    const nameTimes = cueTimes("names");
    if (nameTimes.length > 0)
      for (let i = 0; i < 10; i++)
        tick(nameTimes[0] + 0.05 + i * 0.045, 0.02, 1800 + i * 160);
    groove(endBar, { clapOn: false });
    groove(endBar + 1, { arpV: 0.03 });
    groove(endBar + 2, {
      kickOn: false,
      clapOn: false,
      openHatOn: false,
      arpV: 0.026,
    });
    const ctaTime = cueTime("cta");
    if (ctaTime != null) bellPair(ctaTime + 0.2, 1, 3, 0.03);
    // The ring-out: a brighter Dbmaj9 pad, a held Db in the bass, and bells on
    // the Db triad (Ab, Db, F, Ab), rising.
    pad(bar(FINAL_BAR), bar(FINAL_BAR + 1), CH(FINAL_BAR).pad, 2000, 0.045);
    bass(bar(FINAL_BAR), 1.6, CH(FINAL_BAR).bass, 0.22);
    [80, 85, 89, 92].forEach((m, i) =>
      bell(bar(FINAL_BAR) + i * 0.09, m, 0.04, -0.3 + i * 0.2),
    );

    // Duck the pads/bass under every kick.
    pump.gain.setValueAtTime(1, 0);
    kicks
      .sort((a, b) => a - b)
      .forEach((t) => {
        pump.gain.setValueAtTime(1, Math.max(0, t - 0.002));
        pump.gain.linearRampToValueAtTime(0.42, t + 0.012);
        pump.gain.linearRampToValueAtTime(1, t + 0.3);
      });

    const buf = await ctx.startRendering();
    return encodeWav(buf);
  };

  function encodeWav(buf) {
    const chans = [buf.getChannelData(0), buf.getChannelData(1)];
    let peak = 0;
    for (const c of chans)
      for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]));
    const gain = peak > 0 ? 0.89 / peak : 1; // normalise to about -1 dBFS
    const n = buf.length,
      bytes = 44 + n * 4;
    const dv = new DataView(new ArrayBuffer(bytes));
    const str = (o, s) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };
    str(0, "RIFF");
    dv.setUint32(4, bytes - 8, true);
    str(8, "WAVE");
    str(12, "fmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 2, true);
    dv.setUint32(24, SR, true);
    dv.setUint32(28, SR * 4, true);
    dv.setUint16(32, 4, true);
    dv.setUint16(34, 16, true);
    str(36, "data");
    dv.setUint32(40, n * 4, true);
    let o = 44;
    for (let i = 0; i < n; i++)
      for (const c of chans) {
        dv.setInt16(o, Math.max(-1, Math.min(1, c[i] * gain)) * 32767, true);
        o += 2;
      }
    const u8 = new Uint8Array(dv.buffer);
    let bin = "";
    for (let i = 0; i < u8.length; i += 0x8000)
      bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  }
})();
