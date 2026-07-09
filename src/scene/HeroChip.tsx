import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { STEPS } from '../content/positions'

export function HeroChip() {
  const group = useRef<THREE.Group>(null)
  const step = useStore((s) => s.step)
  const phase = useStore((s) => s.phase)
  // the felt belongs to the content during lesson steps and the full-table hand
  const hidden =
    phase === 'fulltable' ||
    (step !== null && ['flow', 'range', 'example', 'mission'].includes(STEPS[step]))
  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.45
    group.current.position.y = 1.06 + Math.sin(state.clock.elapsedTime * 0.8) * 0.015
    const s = group.current.scale.x + ((hidden ? 0.001 : 1) - group.current.scale.x) * Math.min(1, dt * 5)
    group.current.scale.setScalar(s)
  })
  return (
    <group ref={group} position={[0, 1.06, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.055, 48]} />
        <meshPhysicalMaterial color="#14100a" roughness={0.35} clearcoat={0.6} />
      </mesh>
      {/* gold engraving faces */}
      {[0.029, -0.029].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[i ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.2, 48]} />
          <meshStandardMaterial color="#E8933D" metalness={0.95} roughness={0.25} side={2} />
        </mesh>
      ))}
      {/* edge spots */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.012, 0.056, 0.07]} />
            <meshStandardMaterial color="#E8933D" metalness={0.9} roughness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}
