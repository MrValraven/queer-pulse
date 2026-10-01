/**
 * QueerPulse launch film, upbeat cut: the score.
 *
 * 120 BPM house-pop in A major (A, E, F#m, D): four-on-the-floor, an
 * octave-bouncing bass, offbeat chord stabs and a two-bar lead hook, with a
 * note on every word slam, card and pop-in listed in scene-pop.html's
 * window.CUES. The synth voices are the same as score.js; only the music and
 * the arrangement differ.
 *
 * Loaded into scene-pop.html by render.mjs (--variant pop);
 * `window.renderScore()` resolves to a base64 16-bit stereo WAV.
 */
(function () {
  const SR = 48000;
  const BEAT = 0.5;
  const BAR = 2;
  const bar = (n) => n * BAR;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const CHORDS = {
    A: { bass: 45, pad: [61, 64, 69, 73] },
    E: { bass: 40, pad: [59, 64, 68, 71] },
    Fsm: { bass: 42, pad: [61, 66, 69, 73] },
    D: { bass: 38, pad: [62, 66, 69, 74] },
  };
  const chordAt = (n) => ["A", "E", "Fsm", "D"][n % 4];

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

    /* ── Arrangement ── (bar numbers match the scene starts in scene-pop.html) */
    const kicks = [];
    const K = (t, v) => {
      kick(t, v, 48, 165, 0.32);
      kicks.push(t);
    };
    const CH = (n) => CHORDS[chordAt(n)];
    // A short, bright chord hit on the offbeat: the house "stab".
    function stab(t, notes, v = 0.045, dur = 0.16) {
      const lp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(3400, t);
      lp.frequency.exponentialRampToValueAtTime(900, t + dur);
      env(g, t, 0.004, v, dur);
      lp.connect(g);
      g.connect(pump);
      g.connect(verb);
      notes.forEach((m, i) =>
        [-6, 6].forEach((c) => {
          const o = ctx.createOscillator();
          o.type = i % 2 ? "square" : "sawtooth";
          o.frequency.value = hz(m);
          o.detune.value = c;
          o.connect(lp);
          o.start(t);
          o.stop(t + dur + 0.05);
        }),
      );
    }
    // The hook: two bars of eighth notes in A major pentatonic, doubled an octave up.
    const LEAD = [
      [0, 76, 1],
      [1, 73, 1],
      [2, 76, 1],
      [3, 78, 2],
      [5, 76, 1],
      [6, 73, 2],
      [8, 71, 1],
      [9, 73, 1],
      [10, 76, 2],
      [12, 73, 1],
      [13, 71, 1],
      [14, 69, 2],
    ];
    function hook(n, v = 0.085) {
      LEAD.forEach(([e, m]) => {
        const t = bar(n) + (e * BEAT) / 2;
        pluck(t, m, v, -0.15, 5200);
        pluck(t, m + 12, v * 0.35, 0.3, 6500);
      });
    }
    function groove(n, o = {}) {
      const {
        kickOn = true,
        clapOn = true,
        hats = true,
        bassOn = true,
        stabs = true,
      } = o;
      const c = CH(n);
      for (let b = 0; b < 4; b++) {
        const t = bar(n) + b * BEAT;
        if (kickOn) K(t, 0.95);
        if (clapOn && (b === 1 || b === 3)) clap(t, 0.38);
        if (hats) {
          hat(t + BEAT / 2, 0.13, true, 0.2);
          hat(t + BEAT / 4, 0.05, false, -0.3);
          hat(t + (3 * BEAT) / 4, 0.05, false, 0.3);
        }
        if (bassOn) {
          bass(t + 0.02, BEAT / 2 - 0.06, c.bass, 0.24);
          bass(t + BEAT / 2, BEAT / 2 - 0.06, c.bass + 12, 0.2);
        }
        if (stabs) stab(t + BEAT / 2, c.pad);
      }
    }
    const PENTA = [81, 83, 85, 88, 90, 93];
    const pops = (times, v = 0.04, base = 0) =>
      times.forEach((t, i) =>
        pluck(
          t,
          PENTA[(i * 2 + base) % PENTA.length],
          v,
          ((i % 5) - 2) * 0.3,
          6500,
        ),
      );
    // A crash: bright noise with a long tail, into the reverb.
    const crash = (t, v = 0.2) => {
      const n = noise(t, 1.8),
        hp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      hp.type = "highpass";
      hp.frequency.value = 5200;
      env(g, t, 0.002, v, 1.5);
      n.connect(hp).connect(g);
      g.connect(master);
      g.connect(verb);
    };

    // A soft pad under everything keeps the stabs from sounding thin.
    for (let n = 0; n < 23; n++)
      pad(bar(n), bar(n + 1), CH(n).pad, 1500, 0.022);

    // Hook (bars 0-1): the beat from frame one; every word lands on a chord.
    groove(0, { bassOn: false });
    groove(1);
    CUES.hookWords.forEach((t, i) =>
      stab(
        t,
        CH(0).pad.map((m) => m + (i === 3 ? 12 : 0)),
        0.07,
        0.22,
      ),
    );
    pops(CUES.hookAvs, 0.035);
    // Gap (bars 2-3): the kick drops out and a roll pulls everything inwards.
    groove(2);
    groove(3, { kickOn: false, stabs: false });
    CUES.gapWords.forEach((t) => stab(t, CH(2).pad, 0.05, 0.14));
    pops(CUES.pills, 0.045, 1);
    riser(6.0, 8.0, 0.3);
    for (let i = 0; i < 16; i++) clap(7.0 + i * 0.0625, 0.08 + i * 0.02);
    swell(8.0, 1.0, 0.16);

    // Drop (bars 4-5): the name lands with the hook.
    impact(CUES.drops[0], 0.9);
    crash(CUES.drops[0], 0.25);
    groove(4);
    groove(5);
    hook(4);
    // Features (bars 6-11): one per bar, a hit on each change.
    for (let n = 6; n < 12; n++) groove(n);
    CUES.feats.forEach((t, i) => {
      if (i > 0) crash(t, 0.14);
      bell(t, [76, 78, 81, 83, 85, 88][i], 0.05, i % 2 ? 0.4 : -0.4);
    });
    pops(CUES.cardPops, 0.03, 2);
    hook(6, 0.06);
    hook(10, 0.06);
    // Network (bars 12-13): faces burst out in a sparkle of sixteenths.
    groove(12, { stabs: false });
    groove(13, { stabs: false });
    pops(CUES.netPops, 0.035, 3);
    // Promise (bars 14-15) and city (bars 16-17), the hook back on top.
    impact(bar(14), 0.5);
    groove(14);
    groove(15);
    hook(14);
    CUES.promisePills.forEach((t, i) =>
      bell(t, [81, 83, 85, 88, 90][i], 0.05, -0.4 + i * 0.2),
    );
    groove(16);
    groove(17, { kickOn: true });
    pops(CUES.cityPops, 0.04, 4);
    riser(bar(17), bar(18), 0.3);
    for (let i = 0; i < 8; i++) clap(bar(17) + 1.0 + i * 0.125, 0.1 + i * 0.03);
    // Belong (bars 18-19): the second drop, a stab on every word.
    impact(bar(18), 0.85);
    crash(bar(18), 0.22);
    groove(18);
    groove(19);
    CUES.belongWords.forEach((t) => stab(t, CH(18).pad, 0.06, 0.18));
    // End (bars 20-23): the lockup, the hook once more, then it rings out on A.
    impact(CUES.drops[1], 1);
    crash(CUES.drops[1], 0.25);
    [81, 85, 88, 93, 97].forEach((m, i) =>
      bell(CUES.drops[1] + 0.15 + i * 0.07, m, 0.05, -0.4 + i * 0.2),
    );
    groove(20);
    groove(21);
    hook(20);
    groove(22, { stabs: false });
    stab(bar(23), CHORDS.A.pad, 0.06, 1.2);
    pad(bar(23), bar(24), CHORDS.A.pad, 2200, 0.05);
    bass(bar(23), 1.6, 33, 0.22);

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
