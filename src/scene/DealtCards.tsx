import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { LESSONS, STEPS } from '../content/positions'
import { seatPosition, useStore } from '../store'
import { sfxCard } from '../audio'
import { makeCardFace, makeCardBack } from './cards'

function Card({ card, offset, delay, base }: { card: string; offset: number; delay: number; base: [number, number, number] }) {
  const group = useRef<THREE.Group>(null)
  const face = useMemo(() => makeCardFace(card), [card])
  const back = useMemo(() => makeCardBack(), [])
  const angle = Math.atan2(base[0], base[2])

  useEffect(() => {
    const g = group.current
    if (!g) return
    // deal from table center: slide + flip
    g.position.set(0, 1.0, 0)
    g.rotation.set(-Math.PI / 2, 0, angle) // face down
    const tl = gsap.timeline({ delay })
    tl.call(() => sfxCard())
    tl.to(g.position, { x: base[0] + Math.sin(angle + Math.PI / 2) * offset, y: 1.06, z: base[2] + Math.cos(angle + Math.PI / 2) * offset, duration: 0.8, ease: 'power3.out' })
    tl.to(g.rotation, { x: -Math.PI / 2 + Math.PI, duration: 0.5, ease: 'power2.inOut' }, '+=0.25')
    tl.to(g.position, { y: 1.02, duration: 0.25, ease: 'power2.in' }, '<0.25')
    return () => { tl.kill() }
  }, [angle, base, delay, offset])

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[0.36, 0.5]} />
        <meshBasicMaterial map={back} side={THREE.FrontSide} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.36, 0.5]} />
        <meshBasicMaterial map={face} side={THREE.FrontSide} />
      </mesh>
    </group>
  )
}

/** Example-hand cards dealt in front of the seated player. */
export function DealtCards() {
  const seated = useStore((s) => s.seated)
  const step = useStore((s) => s.step)
  const visible = seated !== null && step !== null && (STEPS[step] === 'example' || STEPS[step] === 'mission')
  if (!visible || !seated) return null
  const [sx, , sz] = seatPosition(seated)
  const base: [number, number, number] = [sx * 0.62, 0, sz * 0.62]
  const cards = LESSONS[seated].example.cards
  return (
    <group>
      <Card card={cards[0]} offset={-0.21} delay={0.2} base={base} />
      <Card card={cards[1]} offset={0.21} delay={0.45} base={base} />
    </group>
  )
}
