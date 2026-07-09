import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import type { DepthOfFieldEffect } from 'postprocessing'
import { Table } from './scene/Table'
import { Seats } from './scene/Seats'
import { HeroChip } from './scene/HeroChip'
import { Atmosphere } from './scene/Atmosphere'
import { RangeHologram } from './scene/RangeHologram'
import { FlowPulse } from './scene/FlowPulse'
import { DealtCards } from './scene/DealtCards'
import { SeatBalloons } from './scene/SeatBalloons'
import { TableChips } from './scene/TableChips'
import { CameraDirector, pose, startOpening } from './cinema/CameraDirector'
import { LightDirector } from './cinema/LightDirector'
import { HUD } from './hud/HUD'
import { Q } from './quality'

const BG = '#050505'

/** Rack focus: DoF target follows the camera's current subject. */
function FocusPull() {
  const ref = useRef<DepthOfFieldEffect>(null)
  useFrame(() => {
    ref.current?.target?.set(pose.tx, pose.ty, pose.tz)
  })
  return <DepthOfField ref={ref} target={[0, 0.95, 0]} focalLength={0.015} bokehScale={1.6} height={480} />
}

/**
 * The full WebGL experience. Lazy-loaded: three/r3f/gsap only download
 * and the GL context only initializes after the user enters the room.
 */
export default function Experience() {
  // the gate was clicked in the shell — roll the opening as soon as we mount
  useEffect(() => {
    startOpening()
  }, [])

  return (
    <>
      <Canvas
        shadows={Q.shadows}
        camera={{ position: [0, 1.4, 11], fov: 42 }}
        gl={{ antialias: Q.aa, powerPreference: 'high-performance', toneMappingExposure: 1.15 }}
        dpr={Q.dpr}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 12, 26]} />
        <LightDirector />
        <CameraDirector />
        <Table />
        <Seats />
        <TableChips />
        <HeroChip />
        <SeatBalloons />
        <RangeHologram />
        <FlowPulse />
        <DealtCards />
        <Atmosphere />
        {Q.post && (
          <EffectComposer>
            <FocusPull />
            <Bloom intensity={0.34} luminanceThreshold={0.86} mipmapBlur />
            <Noise opacity={0.026} />
            <Vignette darkness={0.78} offset={0.26} />
          </EffectComposer>
        )}
      </Canvas>
      {/* low tier: cinematic vignette for free, via CSS instead of a GPU pass */}
      {!Q.post && <div className="css-vignette" aria-hidden="true" />}
      <HUD />
    </>
  )
}
