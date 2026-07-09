import { useMemo } from 'react'
import * as THREE from 'three'
import { HAND, REVEALED, potAt } from '../content/hand'
import { seatPosition, useStore, type PositionId, POSITIONS } from '../store'
import { makeCardFace, makeCardBack } from './cards'

const GOLD = '#E8933D'

/** Which seats already folded up to (and including) beat i. */
function foldedAt(i: number): Set<PositionId> {
  const out = new Set<PositionId>()
  for (let b = 0; b <= i && b < HAND.length; b++) {
    const beat = HAND[b]
    if (beat.action === 'fold' && beat.seat) out.add(beat.seat)
  }
  return out
}

/** Community cards revealed up to beat i. */
function boardAt(i: number): string[] {
  const cards: string[] = []
  for (let b = 0; b <= i && b < HAND.length; b++) {
    const beat = HAND[b]
    if (beat.cards) cards.push(...beat.cards)
  }
  return cards
}

function ChipStack({ pos, amount }: { pos: [number, number, number]; amount: number }) {
  const n = Math.max(1, Math.min(8, Math.round(amount / 2)))
  return (
    <group position={pos}>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[0, 0.012 + i * 0.024, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 20]} />
          <meshStandardMaterial
            color={i % 2 ? '#14100a' : GOLD}
            metalness={i % 2 ? 0.2 : 0.85}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}

export function FullTable() {
  const phase = useStore((s) => s.phase)
  const beat = useStore((s) => s.beat)

  const back = useMemo(() => makeCardBack(), [])
  const active = phase === 'fulltable'
  const folded = useMemo(() => foldedAt(beat), [beat])
  const board = useMemo(() => boardAt(beat), [beat])
  const showdown = beat >= 0 && HAND[beat]?.action === 'win'

  // live bets on the felt (since last street sweep)
  const bets = useMemo(() => {
    const m = new Map<PositionId, number>()
    for (let b = 0; b <= beat && b < HAND.length; b++) {
      const bt = HAND[b]
      if (bt.clearsBets) m.clear()
      if (bt.seat && bt.bet) m.set(bt.seat, (m.get(bt.seat) ?? 0) + bt.bet)
    }
    return m
  }, [beat])

  const pot = potAt(beat) - [...bets.values()].reduce((a, b) => a + b, 0)

  if (!active) return null

  return (
    <group>
      {/* hole cards per active seat (empty chairs — the seat represents the player) */}
      {POSITIONS.map((p) => {
        if (folded.has(p.id)) return null
        const [x, , z] = seatPosition(p.id)
        const angle = Math.atan2(x, z)
        const reveal = showdown ? REVEALED[p.id] : undefined
        return (
          <group key={p.id} position={[x * 0.6, 1.008, z * 0.6]} rotation={[0, angle, 0]}>
            {[-0.08, 0.08].map((off, i) => (
              <mesh
                key={i}
                position={[off, 0, 0]}
                rotation={[reveal ? Math.PI / 2 : -Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.26, 0.36]} />
                <meshBasicMaterial
                  map={reveal ? makeCardFace(reveal[i]) : back}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* community cards */}
      {board.map((card, i) => (
        <mesh key={card} position={[(i - 2) * 0.42, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.5]} />
          <meshBasicMaterial map={makeCardFace(card)} />
        </mesh>
      ))}

      {/* bets in front of seats */}
      {[...bets.entries()].map(([id, amount]) => {
        const [x, , z] = seatPosition(id)
        return <ChipStack key={id} pos={[x * 0.78, 0.96, z * 0.78]} amount={amount} />
      })}

      {/* pot — off the board, toward the open dealer side */}
      {pot > 2 && <ChipStack pos={[0, 0.96, 1.15]} amount={pot} />}
    </group>
  )
}
