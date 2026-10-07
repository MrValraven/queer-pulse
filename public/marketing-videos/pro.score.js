/**
 * QueerPulse launch film, professional cut: the score.
 *
 * 120 BPM deep house in F minor (Fm9, Dbmaj9, Ab, Eb6/9): a soft
 * four-on-the-floor, off-beat bass, a filtered sixteenth arpeggio, and
 * interface sound design on top: a click on every line of type, air on every
 * camera move, a glass note on every card close-up, person and pin listed in
 * pro.html's window.CUES. The synth voices are the same as cinematic.score.js.
 *
 * Loaded into pro.html by render.mjs (--video pro) and the admin renderer;
 * `window.renderScore()` resolves to a base64 16-bit stereo WAV.
 */
(function () {
  const SR = 48000;
  const BEAT = 0.5;
  const BAR = 2;
  const bar = (n) => n * BAR;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const CHORDS = {
    Fm: { bass: 41, pad: [56, 60, 63, 67] },
    Db: { bass: 37, pad: [53, 56, 60, 63] },
    Ab: { bass: 44, pad: [58, 60, 63, 68] },
    Eb: { bass: 39, pad: [55, 58, 60, 65] },
  };
  const chordAt = (n) => ["Fm", "Db", "Ab", "Eb"][n % 4];

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
    const CUES = window.CUES;
    const LEN = CUES.duration;
    const ctx = new OfflineAudioContext(2, Math.ceil(SR * LEN), SR);

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

    // Pads and bass duck under the kick — the "pulse" you feel more than hear.
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
    function heartbeat(t, v = 1) {
      const beat = (at, vel) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain(),
          lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 220;
        o.frequency.setValueAtTime(92, at);
        o.frequency.exponentialRampToValueAtTime(36, at + 0.16);
        env(g, at, 0.006, vel, 0.34);
        o.connect(lp).connect(g).connect(master);
        g.connect(verb);
        o.start(at);
        o.stop(at + 0.5);
      };
      beat(t, v);
      beat(t + 0.22, v * 0.62);
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
        [hz(26), 0],
        [hz(38), 4],
        [hz(45), -3],
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

    /* ── Arrangement ── (bar numbers match the scene starts in pro.html) */
    const kicks = [];
    const K = (t, v = 0.9) => {
      kick(t, v, 42, 125, 0.38);
      kicks.push(t);
    };
    const CH = (n) => CHORDS[chordAt(n)];
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
    function groove(n, o = {}) {
      const {
        kickOn = true,
        clapOn = true,
        hats = true,
        bassOn = true,
        arpOn = true,
        arpV = 0.035,
      } = o;
      const c = CH(n);
      for (let b = 0; b < 4; b++) {
        const t = bar(n) + b * BEAT;
        if (kickOn) K(t);
        if (clapOn && (b === 1 || b === 3)) clap(t, 0.24);
        if (hats) {
          hat(t + BEAT / 2, 0.1, true, 0.15);
          for (let s = 0; s < 4; s++)
            shaker(t + (s * BEAT) / 4, s % 2 ? 0.035 : 0.02);
        }
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
      if (arpOn) arp(n, arpV);
    }
    const PENTA = [77, 80, 82, 84, 87, 89, 92];
    const blips = (times, v = 0.035, base = 0) =>
      times.forEach((t, i) =>
        blip(t, PENTA[(i * 2 + base) % PENTA.length], v, ((i % 5) - 2) * 0.3),
      );

    // Pads under everything; the filter opens across the opening.
    for (let n = 0; n < 30; n++)
      pad(
        bar(n),
        bar(n + 1),
        CH(n).pad,
        n < 4 ? 500 + n * 380 : 1700,
        n < 4 ? 0.03 : 0.024,
      );
    drone(0, bar(6));

    // Open (bars 0-3): the line, the scattered fragments, then the gathering.
    CUES.lines.forEach((t) => {
      tick(t, 0.06, 2600);
      tick(t + 0.12, 0.035, 2000);
    });
    blips(CUES.frags, 0.04);
    arp(1, 0.022, 1400);
    arp(2, 0.028, 1700);
    arp(3, 0.032, 2000);
    for (let n = 2; n < 4; n++)
      for (let b = 0; b < 4; b++)
        hat(bar(n) + b * BEAT + BEAT / 2, 0.07, false, 0.2);
    for (let b = 0; b < 4; b++) bass(bar(2) + b * BEAT, 0.3, CH(2).bass, 0.18);
    riser(6.0, 8.0, 0.22);
    bell(CUES.ping, 89, 0.06, 0);
    swell(8.0, 0.8, 0.12);

    // Reveal (bars 4-5): the name lands; the beat comes in under it.
    impact(8.0, 0.7);
    [65, 68, 72, 75, 79].forEach((m, i) =>
      bell(8.05 + i * 0.06, m + 12, 0.045, -0.4 + i * 0.2),
    );
    for (let i = 0; i < 10; i++)
      tick(CUES.names[0] + 0.05 + i * 0.045, 0.02, 1800 + i * 160);
    bass(bar(4), 1.9, CH(4).bass, 0.22);
    groove(5, { clapOn: false, arpV: 0.03 });
    whoosh(11.2, 0.9, 0.14);

    // Board (bars 6-19): full groove, two bars per card. The arp sits back a
    // little in each bar where a headline types, so the words lead.
    const headlineBars = CUES.focus.map((focusTime) =>
      Math.floor(focusTime / BAR),
    );
    for (let n = 6; n < 20; n++)
      groove(n, { arpV: headlineBars.includes(n) ? 0.028 : 0.035 });
    CUES.moves.forEach((t, i) =>
      whoosh(t, 0.8, 0.13, i % 2 ? 0.6 : -0.6, i % 2 ? -0.6 : 0.6),
    );
    CUES.focus.forEach((t, i) => tick(t, 0.04, 2200 + i * 120));
    blips(CUES.closeUps, 0.045, 2);
    for (let i = 0; i < 6; i++)
      tick(CUES.build[1] + i * 0.12, 0.025, 2000 + i * 200);
    bell(CUES.all, 84, 0.05, -0.2);
    bell(CUES.all + 0.12, 89, 0.04, 0.2);

    // Network (bars 20-22): the vouch tree grows in glassy notes; one branch
    // rings on bar 21's Db (Ab and Eb from the chord).
    groove(20);
    groove(21);
    groove(22);
    blips(CUES.netPops, 0.022, 1);
    bell(CUES.vouch, 80, 0.045, 0.2);
    bell(CUES.vouch + 0.12, 87, 0.035, -0.2);
    // The people leave the tree for the map.
    whoosh(CUES.handoff, 0.9, 0.14, -0.5, 0.5);
    // City (bars 23-24): the map shimmers in under the full groove.
    groove(23);
    groove(24);
    swell(CUES.dots + 0.95, 1.0, 0.08);
    blips(CUES.pins, 0.035, 4);
    CUES.arcs.forEach((t, i) =>
      blip(
        t + 0.85,
        PENTA[(i + 3) % PENTA.length] + 12,
        0.025,
        i % 2 ? 0.4 : -0.4,
      ),
    );
    // Promise (bars 25-26): the word rolls over on a click; the beat lifts out at the end.
    groove(25);
    groove(26, { kickOn: false, clapOn: false });
    tick(CUES.roll, 0.06, 2800);
    whoosh(CUES.roll - 0.1, 0.4, 0.07);
    blips(CUES.promiseChips, 0.04, 3);
    riser(53.0, 54.0, 0.16);

    // Belong (bar 27): a breath. Pad and bass only, then up into the name.
    // The bells (F, C, F) are the 9th and 6th of bar 27's Eb6/9.
    bass(bar(27), 1.9, CH(27).bass, 0.2);
    [65, 72, 77].forEach((m, i) =>
      bell(54.05 + i * 0.08, m + 12, 0.04, -0.3 + i * 0.3),
    );
    riser(55.0, 56.0, 0.22);
    // End (bars 28-30): the name again on Fm9, as at the reveal, the groove
    // once more, then it rings out on Ab (Db to Ab, a plagal close).
    impact(56.0, 0.85);
    [65, 68, 72, 75, 79].forEach((m, i) =>
      bell(56.05 + i * 0.06, m + 12, 0.05, -0.4 + i * 0.2),
    );
    for (let i = 0; i < 10; i++)
      tick(CUES.names[1] + 0.05 + i * 0.045, 0.02, 1800 + i * 160);
    groove(28, { clapOn: false });
    groove(29, { arpV: 0.028 });
    pad(bar(30), bar(31), CH(30).pad, 2000, 0.045);
    bass(bar(30), 1.6, CH(30).bass, 0.22);
    [72, 75, 77, 80].forEach((m, i) =>
      bell(bar(30) + i * 0.09, m + 12, 0.04, -0.3 + i * 0.2),
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
