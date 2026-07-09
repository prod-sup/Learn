import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { POSITIONS, seatPosition, useStore, type PositionId } from '../store'

function balloonTexture(label: string): THREE.CanvasTexture {
  const W = 320, H = 176
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  const bw = 300, bh = 120, bx = (W - bw) / 2, by = 8, r = 26

  // glass pill
  ctx.fillStyle = 'rgba(14,12,9,0.82)'
  ctx.strokeStyle = '#E8933D'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(bx + r, by)
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r)
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r)
  ctx.arcTo(bx, by + bh, bx, by, r)
  ctx.arcTo(bx, by, bx + bw, by, r)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // tail
  ctx.beginPath()
  ctx.moveTo(W / 2 - 18, by + bh - 2)
  ctx.lineTo(W / 2 + 18, by + bh - 2)
  ctx.lineTo(W / 2, by + bh + 34)
  ctx.closePath()
  ctx.fillStyle = 'rgba(14,12,9,0.82)'
  ctx.fill()
  ctx.strokeStyle = '#E8933D'
  ctx.stroke()

  // text
  ctx.fillStyle = '#f0e7d5'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 62px "Arial Narrow", Impact, sans-serif'
  ctx.fillText(label, W / 2, by + bh / 2 + 4)

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 16
  return tex
}

function Balloon({ id }: { id: PositionId }) {
  const [x, , z] = seatPosition(id)
  const label = id === 'UTG1' ? 'UTG+1' : id
  const tex = useMemo(() => balloonTexture(label), [label])
  const mat = useRef<THREE.SpriteMaterial>(null)
  const sprite = useRef<THREE.Sprite>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (mat.current) mat.current.opacity = 0.9 + Math.sin(t * 1.5 + x) * 0.1
    if (sprite.current) sprite.current.position.y = 1.9 + Math.sin(t * 1.2 + x) * 0.03
  })

  return (
    <sprite ref={sprite} position={[x, 1.9, z]} scale={[0.82, 0.45, 1]} renderOrder={999}>
      <spriteMaterial ref={mat} map={tex} transparent depthTest={false} depthWrite={false} />
    </sprite>
  )
}

/** Floating position-name balloons above every seat (during seat selection). */
export function SeatBalloons() {
  const phase = useStore((s) => s.phase)
  const seated = useStore((s) => s.seated)
  if (!(phase === 'free' || phase === 'invite') || seated) return null
  return (
    <group>
      {POSITIONS.map((p) => (
        <Balloon key={p.id} id={p.id} />
      ))}
    </group>
  )
}
