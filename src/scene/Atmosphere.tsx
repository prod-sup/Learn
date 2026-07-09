import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { lights } from '../cinema/LightDirector'
import { Q } from '../quality'

/** Neutral indoor environment map for metal/clearcoat reflections — no network. */
export function Env() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap
    scene.environmentIntensity = 0.07
    return () => { scene.environment = null; envMap.dispose(); pmrem.dispose() }
  }, [gl, scene])
  return null
}

/** Volumetric-looking light cone under the pendant lamp + drifting dust. */
export function LightCone() {
  const cone = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => {
    // vertical alpha gradient: bright near the lamp, dissolves toward the felt
    const c = document.createElement('canvas')
    c.width = 1; c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.55, 'rgba(255,255,255,0.25)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1, 64)
    const alpha = new THREE.CanvasTexture(c)
    return new THREE.MeshBasicMaterial({
      color: '#ffe2b0',
      transparent: true,
      opacity: 0,
      alphaMap: alpha,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [])
  useFrame(() => { mat.opacity = (lights.key / 55) * 0.009 })
  return (
    <mesh ref={cone} material={mat} position={[0, 3.2, 0]}>
      <coneGeometry args={[1.7, 2.6, 48, 1, true]} />
    </mesh>
  )
}

const DUST_COUNT = Q.dust
export function Dust() {
  const points = useRef<THREE.Points>(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3)
    const speeds = new Float32Array(DUST_COUNT)
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = Math.random() * 2.2
      const a = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r * 1.3
      positions[i * 3 + 1] = 1.0 + Math.random() * 3.4
      positions[i * 3 + 2] = Math.sin(a) * r
      speeds[i] = 0.02 + Math.random() * 0.05
    }
    return { positions, speeds }
  }, [])
  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#ffe8c0',
    size: 0.012,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])
  useFrame((state, dt) => {
    mat.opacity = (lights.key / 55) * 0.5
    const pos = points.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!pos) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < DUST_COUNT; i++) {
      let y = pos.getY(i) + speeds[i] * dt * 2
      if (y > 4.4) y = 1.0
      pos.setY(i, y)
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.4 + i) * dt * 0.01)
    }
    pos.needsUpdate = true
  })
  return (
    <points ref={points} material={mat}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  )
}

export function Atmosphere() {
  return (
    <>
      {Q.env && <Env />}
      <LightCone />
      <Dust />
    </>
  )
}
