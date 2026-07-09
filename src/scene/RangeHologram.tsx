import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { cellLabel, expandRange } from '../content/ranges'
import { LESSONS, STEPS } from '../content/positions'
import { seatPosition, useStore } from '../store'

const CELL = 0.155
const GAP = 0.012
const SIZE = 13 * (CELL + GAP)

/** 13Ã—13 range matrix projected as a hologram on the felt. */
export function RangeHologram() {
  const seated = useStore((s) => s.seated)
  const step = useStore((s) => s.step)
  const setHoverHand = useStore((s) => s.setHoverHand)
  const group = useRef<THREE.Group>(null)

  const visible = seated !== null && step !== null && STEPS[step] === 'range'
  const inRange = useMemo(
    () => (seated ? expandRange(LESSONS[seated].range) : new Set<string>()),
    [seated]
  )

  const cells = useMemo(() => {
    const list: { row: number; col: number; label: string; hot: boolean }[] = []
    for (let r = 0; r < 13; r++)
      for (let c = 0; c < 13; c++) {
        const label = cellLabel(r, c)
        list.push({ row: r, col: c, label, hot: inRange.has(label) })
      }
    return list
  }, [inRange])

  useEffect(() => {
    if (group.current && visible) {
      group.current.scale.setScalar(0.01)
      gsap.to(group.current.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'power3.out' })
    }
  }, [visible])

  useFrame((state) => {
    if (group.current && visible) {
      group.current.position.y = 0.97 + Math.sin(state.clock.elapsedTime * 1.2) * 0.008
    }
  })

  if (!visible) return null
  const [sx, , sz] = seatPosition(seated!)
  const faceSeat = Math.atan2(sx, sz)

  return (
    <group ref={group} position={[0, 0.97, 0]} rotation={[0, faceSeat + Math.PI, 0]}>
      {cells.map(({ row, col, label, hot }) => (
        <mesh
          key={label + row * 13 + col}
          position={[(col - 6) * (CELL + GAP), 0, (row - 6) * (CELL + GAP)]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerOver={(e) => { e.stopPropagation(); setHoverHand({ label, inRange: hot }) }}
          onPointerOut={() => setHoverHand(null)}
        >
          <planeGeometry args={[CELL, CELL]} />
          <meshBasicMaterial
            color={hot ? '#E8933D' : '#3a5546'}
            transparent
            opacity={hot ? 0.95 : 0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* frame */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[SIZE + 0.08, SIZE + 0.08]} />
        <meshBasicMaterial color="#E8933D" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
