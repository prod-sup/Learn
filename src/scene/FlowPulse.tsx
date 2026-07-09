import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ACTION_ORDER, STEPS } from '../content/positions'
import { seatPosition, useStore } from '../store'

/**
 * "flow" step: a golden pulse travels the action order on the felt,
 * lighting a marker in front of each seat as its turn comes.
 */
export function FlowPulse() {
  const seated = useStore((s) => s.seated)
  const step = useStore((s) => s.step)
  const pulse = useRef<THREE.Mesh>(null)
  const markers = useRef<(THREE.Mesh | null)[]>([])

  const visible = seated !== null && step !== null && STEPS[step] === 'flow'

  useFrame((state) => {
    if (!visible) return
    const t = (state.clock.elapsedTime * 0.28) % 1
    const total = ACTION_ORDER.length
    const fIdx = t * total
    const i = Math.floor(fIdx)
    const frac = fIdx - i
    const a = seatPosition(ACTION_ORDER[i])
    const b = seatPosition(ACTION_ORDER[(i + 1) % total])
    if (pulse.current) {
      // markers sit just inside the rail
      pulse.current.position.set(
        THREE.MathUtils.lerp(a[0], b[0], frac) * 0.68,
        1.0,
        THREE.MathUtils.lerp(a[2], b[2], frac) * 0.68
      )
    }
    markers.current.forEach((m, mi) => {
      if (!m) return
      const mat = m.material as THREE.MeshBasicMaterial
      const active = mi === i
      mat.opacity += ((active ? 0.9 : 0.18) - mat.opacity) * 0.15
    })
  })

  if (!visible) return null

  return (
    <group>
      {ACTION_ORDER.map((id, i) => {
        const [x, , z] = seatPosition(id)
        return (
          <mesh
            key={id}
            ref={(el) => { markers.current[i] = el }}
            position={[x * 0.68, 0.965, z * 0.68]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[id === seated ? 0.16 : 0.11, 32]} />
            <meshBasicMaterial
              color={id === seated ? '#E8933D' : '#e8d9a8'}
              transparent opacity={0.18}
              blending={THREE.AdditiveBlending} depthWrite={false}
            />
          </mesh>
        )
      })}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffd75e" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
