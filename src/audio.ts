// Synthesized VIP-room audio — no external assets.
// Ambient room tone + positional-feeling foley, all WebAudio.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let started = false

function ac(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  return ctx
}

function noiseBuffer(seconds: number, brown = false): AudioBuffer {
  const c = ac()
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    if (brown) {
      last = (last + 0.02 * w) / 1.02
      d[i] = last * 3.5
    } else d[i] = w
  }
  return buf
}

/** Room tone: filtered brown noise with a slow breathing LFO. */
export function startAmbient() {
  if (started) return
  started = true
  const c = ac()
  if (c.state === 'suspended') void c.resume()

  const src = c.createBufferSource()
  src.buffer = noiseBuffer(6, true)
  src.loop = true
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 320
  const g = c.createGain()
  g.gain.value = 0
  src.connect(lp).connect(g).connect(master!)
  src.start()
  g.gain.linearRampToValueAtTime(0.045, c.currentTime + 5)

  // distant murmur: bandpassed noise, barely there
  const m = c.createBufferSource()
  m.buffer = noiseBuffer(4)
  m.loop = true
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 700
  bp.Q.value = 0.6
  const mg = c.createGain()
  mg.gain.value = 0
  m.connect(bp).connect(mg).connect(master!)
  m.start()
  mg.gain.linearRampToValueAtTime(0.012, c.currentTime + 6)

  const lfo = c.createOscillator()
  lfo.frequency.value = 0.07
  const lfoG = c.createGain()
  lfoG.gain.value = 0.008
  lfo.connect(lfoG).connect(mg.gain)
  lfo.start()
}

function burst(freq: number, dur: number, vol: number, type: BiquadFilterType = 'bandpass') {
  if (!started) return
  const c = ac()
  const s = c.createBufferSource()
  s.buffer = noiseBuffer(dur)
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = 8
  const g = c.createGain()
  g.gain.setValueAtTime(vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  s.connect(f).connect(g).connect(master!)
  s.start()
}

/** Glass-tap UI click. */
export function sfxClick() { burst(2600, 0.07, 0.10) }

/** Chip clink. */
export function sfxChip() { burst(4200, 0.05, 0.14); setTimeout(() => burst(5100, 0.04, 0.08), 40) }

/** Card slide. */
export function sfxCard() { burst(1200, 0.16, 0.05, 'highpass') }

/** Camera flight whoosh. */
export function sfxWhoosh() {
  if (!started) return
  const c = ac()
  const s = c.createBufferSource()
  s.buffer = noiseBuffer(1.4, true)
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(180, c.currentTime)
  f.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.7)
  f.frequency.exponentialRampToValueAtTime(140, c.currentTime + 1.4)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.4)
  s.connect(f).connect(g).connect(master!)
  s.start()
}

/** Achievement chime: two warm notes. */
export function sfxChime() {
  if (!started) return
  const c = ac()
  for (const [freq, delay] of [[523.25, 0], [783.99, 0.16]] as const) {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    const g = c.createGain()
    const t = c.currentTime + delay
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
    o.connect(g).connect(master!)
    o.start(t)
    o.stop(t + 1.7)
  }
}
