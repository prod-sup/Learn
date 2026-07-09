import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POSITIONS, seatPosition, useStore, type PositionId } from '../store'
import { flyToSeat } from '../cinema/CameraDirector'
import { Q } from '../quality'

const ORANGE = new THREE.Color('#E8933D')
const DARK = new THREE.Color('#17130e')
const METAL = '#4a4136'

function Seat({ id }: { id: PositionId }) {
  const pos = seatPosition(id)
  const phase = useStore((s) => s.phase)
  const seated = useStore((s) => s.seated)
  const completed = useStore((s) => s.completed.includes(id))
  const [hover, setHover] = useState(false)
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)

  const interactive = phase === 'free' || phase === 'invite'
  // chair faces table center
  const angle = Math.atan2(pos[0], pos[2])

  useFrame((state, dt) => {
    if (glow.current) {
      const target = hover && interactive ? 0.6 : completed ? 0.3 : 0.05
      glow.current.emissiveIntensity += (target - glow.current.emissiveIntensity) * Math.min(1, dt * 6)
    }
    if (ring.current) {
      ring.current.visible = completed
      if (completed) ring.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group
      position={pos}
      rotation={[0, angle + Math.PI, 0]}
      onPointerOver={(e) => { e.stopPropagation(); if (interactive) { setHover(true); document.body.style.cursor = 'pointer' } }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); if (interactive && seated !== id) flyToSeat(id) }}
    >
      {/* seat cushion (solid) */}
      <mesh position={[0, 0.62, 0]} castShadow={Q.shadows}>
        <cylinderGeometry args={[0.34, 0.33, 0.15, Q.seg(32)]} />
        {Q.physical ? (
          <meshPhysicalMaterial color={DARK} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.45} emissive={ORANGE} emissiveIntensity={0.05} ref={glow} />
        ) : (
          <meshStandardMaterial color={DARK} roughness={0.5} emissive={ORANGE} emissiveIntensity={0.05} ref={glow} />
        )}
      </mesh>
      {/* piped rim */}
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.335, 0.02, Q.seg(12), Q.seg(40)]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.4} />
      </mesh>
      {/* solid backrest — behind the player (outer side), leaning back */}
      <group position={[0, 0.98, -0.31]} rotation={[-0.14, 0, 0]}>
        <mesh castShadow={Q.shadows}>
          <boxGeometry args={[0.56, 0.5, 0.07]} />
          {Q.physical ? (
            <meshPhysicalMaterial color={DARK} roughness={0.5} clearcoat={0.3} clearcoatRoughness={0.5} />
          ) : (
            <meshStandardMaterial color={DARK} roughness={0.5} />
          )}
        </mesh>
        {/* inset leather panel faces the player (toward the table) */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.42, 0.36, 0.02]} />
          <meshStandardMaterial color="#20190f" roughness={0.55} />
        </mesh>
        {/* metal top cap */}
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.58, 0.05, 0.09]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.4} />
        </mesh>
      </group>
      {/* pedestal column + weighted base */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.6, Q.seg(16)]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.03, 0]} castShadow={Q.shadows}>
        <cylinderGeometry args={[0.28, 0.32, 0.06, Q.seg(32)]} />
        <meshStandardMaterial color="#2c261e" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* achievement chip resting on the seat cushion */}
      {completed && (
        <mesh position={[0.15, 0.71, 0.06]} castShadow={Q.shadows}>
          <cylinderGeometry args={[0.065, 0.065, 0.022, 24]} />
          <meshStandardMaterial color={ORANGE} metalness={0.9} roughness={0.25} emissive={ORANGE} emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* achievement ring around the seat */}
      <mesh ref={ring} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.58, 0.64, Q.seg(48)]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function Seats() {
  return (
    <group>
      {POSITIONS.map((p) => (
        <Seat key={p.id} id={p.id} />
      ))}
    </group>
  )
}
