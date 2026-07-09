import { useMemo } from 'react'
import * as THREE from 'three'
import { makeFeltBump, makeWoodMap, makeCarpetMap, makeSupremaStamp } from './textures'
import { Q } from '../quality'

const FELT = '#152720'
const GOLD = '#E8933D'

export function Table() {
  const feltMat = useMemo(
    () =>
      Q.physical
        ? new THREE.MeshPhysicalMaterial({
            color: FELT,
            roughness: 0.94,
            bumpMap: makeFeltBump(),
            bumpScale: 0.35,
            sheen: 1,
            sheenColor: new THREE.Color('#2e4a3a'),
            sheenRoughness: 0.55,
          })
        : new THREE.MeshStandardMaterial({
            color: FELT,
            roughness: 0.94,
            bumpMap: makeFeltBump(),
            bumpScale: 0.35,
          }),
    []
  )
  const woodMat = useMemo(
    () =>
      Q.physical
        ? new THREE.MeshPhysicalMaterial({
            map: makeWoodMap(),
            roughness: 0.48,
            clearcoat: 0.22,
            clearcoatRoughness: 0.4,
          })
        : new THREE.MeshStandardMaterial({
            map: makeWoodMap(),
            roughness: 0.48,
          }),
    []
  )
  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8a7455',
        metalness: 0.9,
        roughness: 0.35,
      }),
    []
  )

  return (
    <group>
      {/* felt surface (ellipse) */}
      <mesh material={feltMat} position={[0, 0.9, 0]} scale={[1.5, 1, 1]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.06, Q.seg(64)]} />
      </mesh>
      {/* Suprema Poker logo stamped on the felt */}
      <mesh position={[0, 0.9315, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.9, 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={useMemo(() => makeSupremaStamp(), [])} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* betting line inlay */}
      <mesh position={[0, 0.932, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}>
        <ringGeometry args={[1.55, 1.575, 96]} />
        <meshStandardMaterial color={GOLD} roughness={0.6} metalness={0.6} transparent opacity={0.4} />
      </mesh>
      {/* wooden rail */}
      <mesh material={woodMat} position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]} castShadow receiveShadow>
        <torusGeometry args={[2.42, 0.17, Q.seg(24), Q.seg(96)]} />
      </mesh>
      {/* metal trim under rail */}
      <mesh material={metalMat} position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}>
        <torusGeometry args={[2.42, 0.045, Q.seg(12), Q.seg(96)]} />
      </mesh>
      {/* rail LED (emissive ring, faint amber uplight) */}
      <mesh position={[0, 0.97, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}>
        <ringGeometry args={[2.24, 2.27, Q.seg(96)]} />
        <meshBasicMaterial color="#E8933D" transparent opacity={0.5} />
      </mesh>
      {/* table body / base */}
      <mesh material={woodMat} position={[0, 0.45, 0]} scale={[1.5, 1, 1]} castShadow>
        <cylinderGeometry args={[1.6, 1.1, 0.9, Q.seg(48)]} />
      </mesh>
      <mesh material={metalMat} position={[0, 0.03, 0]} scale={[1.5, 1, 1]}>
        <cylinderGeometry args={[1.5, 1.6, 0.06, Q.seg(48)]} />
      </mesh>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[30, Q.seg(64)]} />
        <meshStandardMaterial map={useMemo(() => makeCarpetMap(), [])} roughness={0.95} />
      </mesh>
      {/* pendant lamp above table */}
      <group position={[0, 4.6, 0]}>
        <mesh material={metalMat}>
          <cylinderGeometry args={[0.5, 0.9, 0.35, 32, 1, true]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.88, 32]} />
          <meshBasicMaterial color="#ffe9c4" side={2} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 2.4, 8]} />
          <meshStandardMaterial color="#1a1712" />
        </mesh>
      </group>
    </group>
  )
}
