import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seatPosition, useStore } from '../store'
import { Q } from '../quality'

import type { PositionId } from '../store'

// When set, the seat spotlight follows this seat even without a seated player
// (used by the full-table documentary to light the acting player).
export const focusSeat: { id: PositionId | null } = { id: null }

// Mutable light state, tweened by the cinema timelines.
export const lights = {
  key: 0,      // pendant spot over the table
  rail: 0,     // amber uplight from the rail
  rim: 0,      // room rim, barely there
  ambient: 0,  // near-zero fill
  seat: 0,     // focused seat spotlight
}

if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__lights = lights

export function LightDirector() {
  const key = useRef<THREE.SpotLight>(null)
  const rail = useRef<THREE.PointLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const seatSpot = useRef<THREE.SpotLight>(null)
  const seatTarget = useRef<THREE.Object3D>(null)
  const seated = useStore((s) => s.seated)

  useFrame(() => {
    if (key.current) key.current.intensity = lights.key
    if (rail.current) rail.current.intensity = lights.rail
    if (rim.current) rim.current.intensity = lights.rim
    if (amb.current) amb.current.intensity = lights.ambient
    if (seatSpot.current && seatTarget.current) {
      seatSpot.current.intensity = lights.seat
      const focus = seated ?? focusSeat.id
      if (focus) {
        const [x, , z] = seatPosition(focus)
        seatSpot.current.position.set(x * 1.1, 4.2, z * 1.1)
        seatTarget.current.position.set(x, 0.8, z)
        seatSpot.current.target = seatTarget.current
      }
    }
  })

  return (
    <>
      <ambientLight ref={amb} intensity={0} color="#c9b899" />
      <spotLight
        ref={key}
        position={[0, 4.45, 0]}
        angle={0.72}
        penumbra={0.55}
        intensity={0}
        color="#ffdfae"
        castShadow={Q.shadows}
        shadow-mapSize={[Q.shadowMap, Q.shadowMap]}
        shadow-bias={-0.0003}
        shadow-radius={6}
        decay={1.1}
      />
      <pointLight ref={rail} position={[0, 1.15, 0]} intensity={0} color="#E8933D" distance={9} decay={1.6} />
      {Q.rim && <directionalLight ref={rim} position={[-6, 3, -8]} intensity={0} color="#5a6a80" />}
      <spotLight ref={seatSpot} angle={0.5} penumbra={0.7} intensity={0} color="#ffe2b0" decay={1.2} />
      <object3D ref={seatTarget} />
    </>
  )
}
