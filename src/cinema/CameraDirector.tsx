import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { seatPosition, SEAT_ANGLES, useStore, type PositionId } from '../store'
import { lights, focusSeat } from './LightDirector'
import { STEPS, type StepId } from '../content/positions'
import { HAND } from '../content/hand'
import { sfxWhoosh, sfxClick, sfxChip, sfxCard, sfxChime } from '../audio'

// Single authority over the camera: a pose proxy tweened by GSAP,
// applied every frame with a breath of steadicam noise.
export const pose = {
  px: 0, py: 1.4, pz: 11,
  tx: 0, ty: 0.95, tz: 0,
  fov: 42,
  noise: 0, // steadicam breathing amplitude
}
const target = new THREE.Vector3()

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const D = (s: number) => (reduced ? Math.min(s, 0.3) : s)

export function startOpening() {
  const { setPhase } = useStore.getState()
  setPhase('black')
  const orbit = { theta: Math.PI * 0.62, r: 8.4, h: 2.3 }
  const applyOrbit = () => {
    pose.px = Math.cos(orbit.theta) * orbit.r * 1.25
    pose.pz = Math.sin(orbit.theta) * orbit.r
    pose.py = orbit.h
    pose.tx = 0; pose.ty = 0.95; pose.tz = 0
  }

  const tl = gsap.timeline()
  // 0s — black, ambient only
  tl.to({}, { duration: D(2.2) })
  // 3s — filament: pendant light warms up over ~4s
  tl.call(() => setPhase('lights'))
  tl.to(lights, { key: 55, rail: 0.9, rim: 0.35, ambient: 0.06, duration: D(4), ease: 'expo.out' })
  // 7s — orbit 120° around the table
  tl.call(() => { setPhase('orbit'); applyOrbit() }, undefined, '<1.2')
  tl.to(orbit, { theta: Math.PI * 0.62 + (Math.PI * 2) / 3, duration: D(7), ease: 'power2.inOut', onUpdate: applyOrbit }, '<')
  // 14s — push-in on the hero chip, rack focus feel via fov
  tl.to(pose, { px: 0, py: 1.7, pz: 3.4, tx: 0, ty: 1.05, tz: 0, fov: 34, duration: D(3.6), ease: 'power2.inOut' })
  // 18s — pull to title composition
  tl.call(() => setPhase('title'))
  tl.to(pose, { px: 0, py: 2.7, pz: 8.6, tx: 0, ty: 1.1, tz: 0, fov: 42, duration: D(3.2), ease: 'power2.inOut' })
  // 22s — invite
  tl.to({}, { duration: D(1.6) })
  tl.call(() => setPhase('invite'))
  tl.to({}, { duration: D(2.4) })
  // user may already have taken a seat during the invite
  tl.call(() => {
    const s = useStore.getState()
    if (s.phase === 'invite') s.setPhase('free')
  })
  tl.to(pose, { noise: 1, duration: 2 }, '<')
}

export function flyToSeat(id: PositionId) {
  const { setPhase, setSeated, setPreview, touring, setTouring } = useStore.getState()
  if (touring) setTouring(false)
  if (tourTimer) { clearTimeout(tourTimer); tourTimer = null }
  setPreview(null)
  previewIndex = -1
  setPhase('flying')
  sfxWhoosh()
  const tl = gsap.timeline({
    onComplete: () => { setSeated(id); setPhase('seated') },
  })
  tl.to(pose, { ...seatedPose(id), duration: D(2.4), ease: 'power2.inOut' })
  // seat spotlight rises, room falls away
  gsap.to(lights, { seat: 30, key: 38, rail: 0.55, duration: D(2.0), ease: 'sine.inOut' })
}

/** Seated over-the-shoulder pose for a seat (shared by flyToSeat and step poses). */
function seatedPose(id: PositionId) {
  const [sx, , sz] = seatPosition(id)
  const out = 1.42
  const len = Math.hypot(sx, sz)
  const ox = (-sz / len) * 1.1
  const oz = (sx / len) * 1.1
  return { px: sx * out + ox, py: 2.9, pz: sz * out * 1.12 + oz, tx: -sx * 0.15, ty: 0.9, tz: -sz * 0.15, fov: 46 }
}

/** Micro-pose per lesson step: OVERHEAD for flow, FELT_CLOSE for range, etc. */
export function goToStep(stepIndex: number | null) {
  const { seated, setStep } = useStore.getState()
  if (!seated) return
  setStep(stepIndex)
  sfxClick()
  const step: StepId | null = stepIndex === null ? null : STEPS[stepIndex]
  const [sx, , sz] = seatPosition(seated)
  const len = Math.hypot(sx, sz)
  const nx = sx / len
  const nz = sz / len
  let p = seatedPose(seated)
  if (step === 'flow' || step === 'why') {
    // OVERHEAD crane: see the whole order of actions
    p = { px: nx * 3.2, py: 6.4, pz: nz * 3.2, tx: 0, ty: 0.9, tz: 0, fov: 50 }
  } else if (step === 'range') {
    // near-overhead: read the matrix like a document
    p = { px: nx * 1.9, py: 4.9, pz: nz * 1.9, tx: 0, ty: 0.97, tz: 0, fov: 46 }
  } else if (step === 'advantages' || step === 'disadvantages') {
    // FELT_CLOSE: lean over the felt
    p = { px: nx * 3.6, py: 2.5, pz: nz * 3.6, tx: 0, ty: 0.95, tz: 0, fov: 40 }
  } else if (step === 'example' || step === 'mission') {
    // close on your cards, just in front of the seat
    p = { px: nx * 4.4, py: 2.3, pz: nz * 4.4, tx: nx * 2.4, ty: 0.95, tz: nz * 2.4, fov: 42 }
  }
  gsap.to(pose, { ...p, duration: D(1.6), ease: 'power2.inOut' })
}

// ---- POSITION SELECTION + CINEMATIC TOUR ----
// The camera lives on an orbital rail around the table: every move between
// positions travels along the ellipse (dolly orbital), never across the felt.

const ORDER: PositionId[] = ['UTG', 'UTG1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']
let previewIndex = -1

const rail = { a: Math.PI / 2, ra: 8.6 * 1.35, rb: 8.6, h: 2.7 }
function applyRail() {
  pose.px = Math.cos(rail.a) * rail.ra
  pose.pz = Math.sin(rail.a) * rail.rb
  pose.py = rail.h
}
/** Shortest signed angular distance a→b. */
function shortest(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}
/** Re-anchor the rail on the camera's current pose so orbital moves start seamlessly. */
function syncRail() {
  const a = Math.atan2(pose.pz, pose.px / 1.35)
  rail.a = a
  const s = Math.sin(a)
  const c = Math.cos(a)
  if (Math.abs(s) > Math.abs(c)) {
    rail.rb = pose.pz / s
    rail.ra = rail.rb * 1.35
  } else {
    rail.ra = pose.px / c
    rail.rb = rail.ra / 1.35
  }
  rail.h = pose.py
}

/**
 * Cinematic pose framing one seat, reached by traveling the orbital rail.
 * Alternates the side offset and height per seat so each shot composes
 * slightly differently. Returns the travel time in ms (for the tour pacing).
 */
export function focusPosition(id: PositionId, quick = false): number {
  const { setPreview } = useStore.getState()
  setPreview(id)
  focusSeat.id = id
  const idx = ORDER.indexOf(id)
  const [sx, , sz] = seatPosition(id)

  // camera stops beside/behind the seat, alternating sides per position
  const seatRad = (SEAT_ANGLES[id] * Math.PI) / 180
  const side = idx % 2 === 0 ? 1 : -1
  const targetA = seatRad + side * 0.34
  gsap.killTweensOf(rail)
  gsap.killTweensOf(pose)
  syncRail()
  const dA = shortest(rail.a, targetA)
  const travel = D(quick ? Math.max(0.9, 0.55 + Math.abs(dA) * 0.5) : Math.max(1.4, 0.8 + Math.abs(dA) * 0.75))

  gsap.to(lights, { seat: 30, key: 40, rail: 0.85, rim: 0.35, duration: D(1), ease: 'sine.inOut' })
  gsap.to(rail, {
    a: rail.a + dA,
    ra: 6.1, rb: 4.5,
    h: idx % 3 === 0 ? 2.75 : idx % 3 === 1 ? 2.3 : 2.55,
    duration: travel, ease: 'power2.inOut', onUpdate: applyRail,
  })
  // look-ahead: the gaze eases onto the seat slightly faster than the dolly
  gsap.to(pose, {
    tx: sx * 0.42, ty: 0.95, tz: sz * 0.42, fov: 43,
    duration: travel * 0.85, ease: 'power2.inOut',
  })
  return travel * 1000
}

/** Slow drift while holding on a position — the shot never sits still. */
function driftOn(seconds: number) {
  gsap.to(rail, {
    a: rail.a + 0.055, h: rail.h + 0.14,
    duration: seconds, ease: 'none', onUpdate: applyRail,
  })
}

/** On-screen arrows: jump straight to the next / previous position. */
export function stepPosition(dir: number) {
  previewIndex = previewIndex === -1 && dir < 0 ? 0 : (previewIndex + dir + ORDER.length) % ORDER.length
  sfxClick()
  focusPosition(ORDER[previewIndex], true)
}

export function clearPreview() {
  useStore.getState().setPreview(null)
  previewIndex = -1
  focusSeat.id = null
  gsap.killTweensOf(rail)
  gsap.killTweensOf(pose)
  syncRail()
  gsap.to(lights, { seat: 0, key: 55, rail: 0.9, duration: D(1), ease: 'sine.inOut' })
  const dA = shortest(rail.a, Math.PI / 2)
  gsap.to(rail, {
    a: rail.a + dA, ra: 8.6 * 1.35, rb: 8.6, h: 2.7,
    duration: D(1.6), ease: 'power2.inOut', onUpdate: applyRail,
  })
  gsap.to(pose, { tx: 0, ty: 1.1, tz: 0, fov: 42, duration: D(1.6), ease: 'power2.inOut' })
}

// Cinematic guided tour of all eight positions.
let tourTimer: ReturnType<typeof setTimeout> | null = null
export function startTour() {
  const { setTouring } = useStore.getState()
  setTouring(true)
  sfxWhoosh()
  let i = 0
  const dwell = reduced ? 1200 : 6600
  const advance = () => {
    if (!useStore.getState().touring) return
    if (i >= ORDER.length) { stopTour(); return }
    const travelMs = focusPosition(ORDER[i], false)
    previewIndex = i
    i++
    // hold with a slow drift after arriving, then move on
    setTimeout(() => { if (useStore.getState().touring) driftOn((dwell - 400) / 1000) }, travelMs)
    tourTimer = setTimeout(advance, travelMs + dwell)
  }
  advance()
}
export function stopTour() {
  if (tourTimer) { clearTimeout(tourTimer); tourTimer = null }
  useStore.getState().setTouring(false)
  clearPreview()
}

export function standUp() {
  const { setPhase, setSeated } = useStore.getState()
  setSeated(null)
  setPhase('flying')
  sfxWhoosh()
  previewIndex = -1
  useStore.getState().setPreview(null)
  const tl = gsap.timeline({ onComplete: () => setPhase('free') })
  tl.to(pose, { px: 0, py: 2.7, pz: 8.6, tx: 0, ty: 1.1, tz: 0, fov: 42, duration: D(2.2), ease: 'power2.inOut' })
  gsap.to(lights, { seat: 0, key: 55, rail: 0.9, duration: D(1.8), ease: 'sine.inOut' })
}

// ---- FULL TABLE MODE: interactive documentary ----

let autoTimer: ReturnType<typeof setTimeout> | null = null
let autoPlay = true

/** ACTION_FOLLOW: frame the acting player, or a wide crane on street/win beats. */
function beatPose(i: number) {
  const beat = HAND[i]
  if (!beat) return
  if (beat.action === 'street' || beat.action === 'win') {
    // OVERHEAD crane: the whole board
    focusSeat.id = null
    gsap.to(lights, { seat: 0, key: 40, rail: 1.1, duration: D(1.2), ease: 'sine.inOut' })
    gsap.to(pose, {
      px: -1.4, py: 6.2, pz: 3.0, tx: 0, ty: 0.95, tz: 0, fov: beat.action === 'win' ? 44 : 50,
      duration: D(1.8), ease: 'power2.inOut',
    })
    return
  }
  if (!beat.seat) return
  const [sx, , sz] = seatPosition(beat.seat)
  const len = Math.hypot(sx, sz)
  const nx = sx / len
  const nz = sz / len
  focusSeat.id = beat.seat
  gsap.to(lights, { seat: 26, key: 34, duration: D(1.2), ease: 'sine.inOut' })
  // over-the-shoulder, angled slightly across the felt
  gsap.to(pose, {
    px: nx * 4.3 + (-nz) * 0.9, py: 2.55, pz: nz * 4.3 + nx * 0.9,
    tx: nx * 0.6, ty: 0.98, tz: nz * 0.6, fov: 40,
    duration: D(1.7), ease: 'power2.inOut',
  })
}

function beatSound(i: number) {
  const beat = HAND[i]
  if (!beat) return
  if (beat.action === 'street') { sfxCard(); setTimeout(sfxCard, 140) }
  else if (beat.action === 'win') sfxChime()
  else if (beat.bet) sfxChip()
  else sfxClick()
}

/** Duration a beat lingers before auto-advancing (reading time). */
function beatDwell(i: number): number {
  const beat = HAND[i]
  if (!beat) return 5000
  const base = 3400
  return base + beat.reason.length * 34
}

export function goToBeat(i: number) {
  const { setBeat } = useStore.getState()
  if (i < 0 || i >= HAND.length) return
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null }
  setBeat(i)
  beatPose(i)
  beatSound(i)
  if (autoPlay && i < HAND.length - 1) {
    autoTimer = setTimeout(() => goToBeat(i + 1), beatDwell(i))
  }
}

export function nextBeat() {
  const { beat } = useStore.getState()
  if (beat < HAND.length - 1) goToBeat(beat + 1)
}
export function prevBeat() {
  const { beat } = useStore.getState()
  if (beat > 0) goToBeat(beat - 1)
}
export function setAutoPlay(v: boolean) {
  autoPlay = v
  if (!v && autoTimer) { clearTimeout(autoTimer); autoTimer = null }
  else if (v) {
    const { beat } = useStore.getState()
    if (beat < HAND.length - 1) autoTimer = setTimeout(() => nextBeat(), 900)
  }
}

export function startFullTable() {
  const { setPhase, setSeated } = useStore.getState()
  setSeated(null)
  setPhase('fulltable')
  autoPlay = true
  sfxWhoosh()
  // establish: sweep around the full lit table before the deal
  focusSeat.id = null
  gsap.to(lights, { key: 60, rail: 0.9, rim: 0.4, seat: 0, duration: D(2), ease: 'expo.out' })
  gsap.to(pose, { px: 5.4, py: 3.2, pz: 6.4, tx: 0, ty: 0.95, tz: 0, fov: 40, duration: D(2.4), ease: 'power2.inOut' })
  setTimeout(() => goToBeat(0), reduced ? 400 : 2600)
}

export function exitFullTable() {
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null }
  focusSeat.id = null
  useStore.getState().setBeat(-1)
  standUp()
}

if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>
  w.__fly = flyToSeat
  w.__standUp = standUp
  w.__fullTable = startFullTable
  w.__nextBeat = nextBeat
  w.__setAuto = setAutoPlay
  w.__goToBeat = goToBeat
  w.__pose = pose
  w.__step = stepPosition
  w.__tour = startTour
  w.__stopTour = stopTour
  w.__focus = focusPosition
}

export function CameraDirector() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const phase = useStore((s) => s.phase)

  useEffect(() => {
    if (phase === 'black') {
      // starting pose: low, distant, in the dark
      Object.assign(pose, { px: 0, py: 1.4, pz: 11, tx: 0, ty: 0.95, tz: 0, fov: 42 })
    }
  }, [phase])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // steadicam breathing (perlin-ish via layered sines)
    const n = pose.noise * 0.02
    camera.position.set(
      pose.px + Math.sin(t * 0.31) * n + Math.sin(t * 0.73) * n * 0.5,
      pose.py + Math.sin(t * 0.42) * n,
      pose.pz + Math.cos(t * 0.27) * n
    )
    target.set(pose.tx, pose.ty + Math.sin(t * 0.5) * n * 0.3, pose.tz)
    camera.lookAt(target)
    if (Math.abs(camera.fov - pose.fov) > 0.01) {
      camera.fov = pose.fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}
