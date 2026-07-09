import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POSITIONS, seatPosition, useStore, type PositionId } from '../store'
import { STEPS } from '../content/positions'
import { Q, LOW } from '../quality'

const CHIP_COLORS = ['#E8933D', '#151210', '#c9bfa6', '#7a2d24']

// Deterministic pseudo-random from a seed string.
function seeded(seed: number) {
  let t = seed + 0x6d2b79f5
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

interface Stack { x: number; z: number; colors: string[] }

function seatStacks(id: PositionId, idx: number): Stack[] {
  const [sx, , sz] = seatPosition(id)
  const nx = sx / Math.hypot(sx, sz)
  const nz = sz / Math.hypot(sx, sz)
  // tangential direction (to spread stacks side by side)
  const tx = -nz
  const tz = nx
  const rnd = seeded(idx * 97 + 13)
  const stackCount = LOW ? 1 : 2 + Math.floor(rnd() * 2) // 2–3 stacks (1 on low)
  const stacks: Stack[] = []
  for (let s = 0; s < stackCount; s++) {
    const along = (s - (stackCount - 1) / 2) * 0.19
    const radial = 0.6 + rnd() * 0.06
    const height = 3 + Math.floor(rnd() * (LOW ? 4 : 8))
    const colors: string[] = []
    const base = CHIP_COLORS[Math.floor(rnd() * CHIP_COLORS.length)]
    for (let h = 0; h < height; h++) colors.push(rnd() > 0.7 ? CHIP_COLORS[Math.floor(rnd() * CHIP_COLORS.length)] : base)
    stacks.push({
      x: sx * radial + tx * along,
      z: sz * radial + tz * along,
      colors,
    })
  }
  return stacks
}

function ChipStackMesh({ x, z, colors }: Stack) {
  return (
    <group position={[x, 0.952, z]}>
      {colors.map((c, i) => (
        <mesh key={i} position={[0, i * 0.021, 0]} castShadow={Q.shadows && i > colors.length - 3}>
          <cylinderGeometry args={[0.082, 0.082, 0.02, LOW ? 12 : 20]} />
          <meshStandardMaterial
            color={c}
            metalness={c === '#E8933D' ? 0.6 : 0.15}
            roughness={0.45}
            emissive={c === '#E8933D' ? '#E8933D' : '#000000'}
            emissiveIntensity={c === '#E8933D' ? 0.08 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

/** One seat's stacks — they gracefully shrink away when this seat's felt
 *  is needed for dealt cards (example/mission lesson steps). */
function SeatStacks({ id, stacks }: { id: PositionId; stacks: Stack[] }) {
  const group = useRef<THREE.Group>(null)
  const seated = useStore((s) => s.seated)
  const step = useStore((s) => s.step)
  const cardsOnFelt =
    seated === id && step !== null && (STEPS[step] === 'example' || STEPS[step] === 'mission')

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const target = cardsOnFelt ? 0.001 : 1
    const s = g.scale.x + (target - g.scale.x) * Math.min(1, dt * 6)
    g.scale.setScalar(s)
    g.visible = s > 0.01
  })

  return (
    <group ref={group}>
      {stacks.map((s, i) => (
        <ChipStackMesh key={i} {...s} />
      ))}
    </group>
  )
}

/** Decorative chip stacks in front of every seat — table dressing. */
export function TableChips() {
  const phase = useStore((s) => s.phase)
  const perSeat = useMemo(
    () => POSITIONS.map((p, i) => ({ id: p.id, stacks: seatStacks(p.id, i) })),
    []
  )
  if (phase === 'fulltable') return null
  return (
    <group>
      {perSeat.map(({ id, stacks }) => (
        <SeatStacks key={id} id={id} stacks={stacks} />
      ))}
    </group>
  )
}
