import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POSITIONS, seatPosition } from '../store'
import { lights } from '../cinema/LightDirector'

function labelTexture(text: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 96
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 96)
  ctx.font = '600 44px Georgia'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#E8933D'
  ctx.letterSpacing = '8px'
  ctx.fillText(text, 128, 50)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  return tex
}

/** Position names printed on the felt in front of each seat. */
export function SeatLabels() {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!group.current) return
    const o = (lights.key / 55) * 0.5
    group.current.children.forEach((m) => {
      const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial
      mat.opacity = o
    })
  })
  return (
    <group ref={group}>
      {POSITIONS.map((p) => {
        const [x, , z] = seatPosition(p.id)
        const angle = Math.atan2(x, z)
        return (
          <mesh key={p.id} position={[x * 0.82, 0.94, z * 0.82]} rotation={[-Math.PI / 2, 0, angle + Math.PI]}>
            <planeGeometry args={[0.55, 0.2]} />
            <meshBasicMaterial map={labelTexture(p.label)} transparent opacity={0} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}
