"use client"

import { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SimplexNoise } from "./SimplexNoise"

const CURVE_SEGS = 220
const MEMBRANE_WIDTH = 1.2
const MEMBRANE_THICKNESS = 0.28
const MAIN_ROWS = 16
const HEAD_RADIUS = 0.028
const TAIL_RADIUS = 0.014
const TAIL_GAP = 0.18
const VERTS_PER_STEP = 8
const GAP = 0.012

const CENTER_T_MIN = 0.37
const CENTER_T_MAX = 0.63
const LEFT_T_MAX = CENTER_T_MIN - GAP
const RIGHT_T_MIN = CENTER_T_MAX + GAP
const LEFT_SEGS = Math.floor(CURVE_SEGS * LEFT_T_MAX)
const RIGHT_SEGS = Math.floor(CURVE_SEGS * (1 - RIGHT_T_MIN))
const CENTER_SEGS = Math.floor(CURVE_SEGS * (CENTER_T_MAX - CENTER_T_MIN))
const MAIN_COLS = 200
const LEFT_COLS = Math.floor(MAIN_COLS * LEFT_T_MAX)
const RIGHT_COLS = Math.floor(MAIN_COLS * (1 - RIGHT_T_MIN))
const CENTER_COLS = Math.floor(MAIN_COLS * (CENTER_T_MAX - CENTER_T_MIN))

const COLORS = {
  headTop: new THREE.Color("#b89830"),
  headTopSpec: new THREE.Color("#e8d060"),
  headBottom: new THREE.Color("#907820"),
  headBottomSpec: new THREE.Color("#c0a040"),
  tails: new THREE.Color("#506030"),
  coreRibbon: new THREE.Color("#706838"),
  coreRibbonSpec: new THREE.Color("#b8a858"),
}

const SAMPLE_N = 200

function buildStraightControlPoints(): THREE.Vector3[] {
  return [
    new THREE.Vector3(-12.0, 0.8, -1.8),
    new THREE.Vector3(-9.0, 0.5, -1.0),
    new THREE.Vector3(-6.5, 0.28, -0.4),
    new THREE.Vector3(-4.0, 0.12, 0.0),
    new THREE.Vector3(-2.0, 0.03, 0.15),
    new THREE.Vector3(-0.5, -0.01, 0.2),
    new THREE.Vector3(0.0, -0.02, 0.2),
    new THREE.Vector3(0.5, 0.0, 0.15),
    new THREE.Vector3(2.0, 0.06, 0.0),
    new THREE.Vector3(4.0, 0.16, -0.2),
    new THREE.Vector3(6.5, 0.32, -0.5),
    new THREE.Vector3(9.0, 0.55, -1.1),
    new THREE.Vector3(12.0, 0.85, -1.9),
  ]
}

interface CenterFrame {
  x: number; y: number; z: number
  tx: number; ty: number; tz: number
}

function computeStraightSamples(straightCurve: THREE.CatmullRomCurve3): { xs: number[]; ys: number[]; zs: number[] } {
  const xs: number[] = [], ys: number[] = [], zs: number[] = []
  for (let i = 0; i <= SAMPLE_N; i++) {
    const x = -12.0 + 24.0 * i / SAMPLE_N
    const t = i / SAMPLE_N
    const pt = straightCurve.getPointAt(t)
    xs.push(x)
    ys.push(pt.y)
    zs.push(pt.z)
  }
  return { xs, ys, zs }
}

function computeParentFrames(straightSamples: { xs: number[]; ys: number[]; zs: number[] }): CenterFrame[] {
  const { xs, ys, zs } = straightSamples
  const frames: CenterFrame[] = []
  for (let i = 0; i <= SAMPLE_N; i++) {
    frames.push({ x: xs[i], y: ys[i], z: zs[i], tx: 0, ty: 0, tz: 0 })
  }
  for (let i = 0; i <= SAMPLE_N; i++) {
    const ip = Math.min(SAMPLE_N, i + 1)
    const im = Math.max(0, i - 1)
    const dx = frames[ip].x - frames[im].x
    const dy = frames[ip].y - frames[im].y
    const dz = frames[ip].z - frames[im].z
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    frames[i].tx = dx / len
    frames[i].ty = dy / len
    frames[i].tz = dz / len
  }
  return frames
}

function getFrameAtT(frames: CenterFrame[], t: number) {
  const ft = t * SAMPLE_N
  const i = Math.max(0, Math.min(SAMPLE_N - 1, Math.floor(ft)))
  const f = ft - i
  const a = frames[i]
  const b = frames[Math.min(SAMPLE_N, i + 1)]
  const x = a.x + (b.x - a.x) * f
  const y = a.y + (b.y - a.y) * f
  const z = a.z + (b.z - a.z) * f
  const tx = a.tx + (b.tx - a.tx) * f
  const ty = a.ty + (b.ty - a.ty) * f
  const tz = a.tz + (b.tz - a.tz) * f
  const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1
  const tan = new THREE.Vector3(tx / tlen, ty / tlen, tz / tlen)
  const up = new THREE.Vector3(0, 1, 0)
  let binormal = new THREE.Vector3().crossVectors(tan, up)
  if (binormal.lengthSq() < 0.001) binormal.set(0, 0, 1)
  binormal.normalize()
  const normal = new THREE.Vector3().crossVectors(binormal, tan).normalize()
  return { point: new THREE.Vector3(x, y, z), tangent: tan, binormal, normal }
}

function fillRibbonFromFrames(
  frames: CenterFrame[],
  noise: SimplexNoise,
  time: number,
  posArr: Float32Array,
  normArr: Float32Array,
  segs: number,
  tMin: number,
  tMax: number,
) {
  const halfW = MEMBRANE_WIDTH / 2
  const halfH = MEMBRANE_THICKNESS / 2
  const innerR = halfH * 0.3
  const outerR = halfH

  for (let i = 0; i <= segs; i++) {
    const t = tMin + (tMax - tMin) * (i / segs)
    const { point, binormal, normal } = getFrameAtT(frames, t)
    const microWave = Math.sin(time * 0.5 + t * Math.PI * 3) * 0.003
    const microNoise = noise.fbm(point.x * 0.12 + time * 0.04, point.y * 0.12, 0, 2) * 0.008
    const bx = binormal.x, bz = binormal.z
    const nx = normal.x, nz = normal.z
    const cx = point.x
    const cy = point.y + microWave + microNoise
    const cz = point.z
    const v = [
      [cx + bx * halfW + nx * halfH, cy + innerR, cz + bz * halfW + nz * halfH],
      [cx - bx * halfW + nx * halfH, cy + innerR, cz - bz * halfW + nz * halfH],
      [cx - bx * halfW - nx * halfH, cy - innerR, cz - bz * halfW - nz * halfH],
      [cx + bx * halfW - nx * halfH, cy - innerR, cz + bz * halfW - nz * halfH],
      [cx + bx * halfW + nx * halfH, cy + outerR, cz + bz * halfW + nz * halfH],
      [cx - bx * halfW + nx * halfH, cy + outerR, cz - bz * halfW + nz * halfH],
      [cx - bx * halfW - nx * halfH, cy - outerR, cz - bz * halfW - nz * halfH],
      [cx + bx * halfW - nx * halfH, cy - outerR, cz + bz * halfW - nz * halfH],
    ]
    const faceNormals = [
      [nx, 0.3, nz], [-nx, 0.3, -nz], [-nx, -0.3, -nz], [nx, -0.3, nz],
      [0, 1, 0], [0, -1, 0], [bx, 0, bz], [-bx, 0, -bz],
    ]
    for (let j = 0; j < VERTS_PER_STEP; j++) {
      const idx = (i * VERTS_PER_STEP + j) * 3
      posArr[idx] = v[j][0]
      posArr[idx + 1] = v[j][1]
      posArr[idx + 2] = v[j][2]
      normArr[idx] = faceNormals[j][0]
      normArr[idx + 1] = faceNormals[j][1]
      normArr[idx + 2] = faceNormals[j][2]
    }
  }
}

function buildRibbonGeo(segs: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const totalVerts = (segs + 1) * VERTS_PER_STEP
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 3), 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 3), 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 2), 2))
  const indices: number[] = []
  for (let i = 0; i < segs; i++) {
    const o = i * VERTS_PER_STEP
    const no = (i + 1) * VERTS_PER_STEP
    for (let j = 0; j < 4; j++) {
      const j2 = (j + 1) % 4
      indices.push(o + j, no + j, o + j2)
      indices.push(o + j2, no + j, no + j2)
    }
    for (let j = 4; j < 8; j++) {
      const j2 = j < 7 ? j + 1 : 4
      indices.push(o + j, o + j2, no + j)
      indices.push(no + j, o + j2, no + j2)
    }
  }
  geo.setIndex(indices)
  const uvArr = geo.attributes.uv.array as Float32Array
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    for (let j = 0; j < VERTS_PER_STEP; j++) {
      const idx = i * VERTS_PER_STEP * 2 + j * 2
      uvArr[idx] = t
      uvArr[idx + 1] = j < 4 ? 0.5 : (j < 6 ? 1 : 0)
    }
  }
  geo.attributes.uv.needsUpdate = true
  return geo
}

export default function BilayerMembrane() {
  const groupRef = useRef<THREE.Group>(null)

  const leftRibbonRef = useRef<THREE.Mesh>(null)
  const centerRibbonRef = useRef<THREE.Mesh>(null)
  const rightRibbonRef = useRef<THREE.Mesh>(null)

  const leftTopHeadsRef = useRef<THREE.InstancedMesh>(null)
  const leftBotHeadsRef = useRef<THREE.InstancedMesh>(null)
  const leftTailsRef = useRef<THREE.InstancedMesh>(null)

  const centerTopHeadsRef = useRef<THREE.InstancedMesh>(null)
  const centerBotHeadsRef = useRef<THREE.InstancedMesh>(null)
  const centerTailsRef = useRef<THREE.InstancedMesh>(null)

  const rightTopHeadsRef = useRef<THREE.InstancedMesh>(null)
  const rightBotHeadsRef = useRef<THREE.InstancedMesh>(null)
  const rightTailsRef = useRef<THREE.InstancedMesh>(null)

  const groupScale = useRef(1)
  useEffect(() => {
    function updateScale() {
      const w = window.innerWidth
      if (w < 400) groupScale.current = 0.48
      else if (w < 640) groupScale.current = 0.55
      else if (w < 768) groupScale.current = 0.65
      else if (w < 1024) groupScale.current = 0.82
      else groupScale.current = 1.0
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [])

  const noise = useMemo(() => new SimplexNoise(42), [])

  const { straightSamples } = useMemo(() => {
    const straightPoints = buildStraightControlPoints()
    const straightCurve = new THREE.CatmullRomCurve3(straightPoints, false, "catmullrom", 0.5)
    const straightSamples = computeStraightSamples(straightCurve)
    return { straightSamples }
  }, [])

  const parentFrames = useMemo(() => computeParentFrames(straightSamples), [straightSamples])

  const leftRibbonGeo = useMemo(() => buildRibbonGeo(LEFT_SEGS), [])
  const centerRibbonGeo = useMemo(() => buildRibbonGeo(CENTER_SEGS), [])
  const rightRibbonGeo = useMemo(() => buildRibbonGeo(RIGHT_SEGS), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    if (groupRef.current) {
      const idleFloat = Math.sin(time * 0.25) * 0.06 + Math.sin(time * 0.4) * 0.025
      const idleSway = Math.cos(time * 0.18) * 0.03 + Math.sin(time * 0.3) * 0.015
      const idleTilt = Math.sin(time * 0.2) * 0.006
      groupRef.current.position.y = 0.15 + idleFloat
      groupRef.current.position.x = idleSway
      groupRef.current.rotation.z = idleTilt
      groupRef.current.scale.setScalar(groupScale.current)
    }

    if (leftRibbonRef.current) {
      const posAttr = leftRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = leftRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, LEFT_SEGS, 0, LEFT_T_MAX)
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      leftRibbonRef.current.geometry.computeVertexNormals()
    }

    if (centerRibbonRef.current) {
      const posAttr = centerRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = centerRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, CENTER_SEGS, CENTER_T_MIN, CENTER_T_MAX)
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      centerRibbonRef.current.geometry.computeVertexNormals()
    }

    if (rightRibbonRef.current) {
      const posAttr = rightRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = rightRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, RIGHT_SEGS, RIGHT_T_MIN, 1.0)
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      rightRibbonRef.current.geometry.computeVertexNormals()
    }

    function updateHeads(
      topRef: THREE.InstancedMesh | null,
      botRef: THREE.InstancedMesh | null,
      tailsInst: THREE.InstancedMesh | null,
      cols: number,
      rows: number,
      tMin: number,
      tMax: number,
    ) {
      if (!topRef || !botRef || !tailsInst) return
      for (let col = 0; col < cols; col++) {
        const t = tMin + (tMax - tMin) * ((col + 0.5) / cols)
        const { point, binormal } = getFrameAtT(parentFrames, t)

        const breathe = Math.sin(time * 0.4 + t * Math.PI * 2) * 0.02
          + Math.sin(time * 0.25 + t * Math.PI * 0.8) * 0.012

        for (let row = 0; row < rows; row++) {
          const rowT = (row / (rows - 1)) - 0.5
          const offX = binormal.x * rowT * MEMBRANE_WIDTH
          const offZ = binormal.z * rowT * MEMBRANE_WIDTH

          const px = point.x + offX
          const py = point.y + breathe
          const pz = point.z + offZ

          const jitterX = noise.noise3D(px * 10 + time * 0.12, 0, pz * 10) * 0.006
          const jitterZ = noise.noise3D(px * 10 + 300, 0, pz * 10 + time * 0.12 + 300) * 0.006
          const jx = px + jitterX
          const jz = pz + jitterZ

          const idx = col * rows + row

          dummy.position.set(jx, py + MEMBRANE_THICKNESS * 0.38, jz)
          dummy.updateMatrix()
          topRef.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx, py - MEMBRANE_THICKNESS * 0.38, jz)
          dummy.updateMatrix()
          botRef.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx, py, jz)
          dummy.updateMatrix()
          tailsInst.setMatrixAt(idx, dummy.matrix)
        }
      }
      topRef.instanceMatrix.needsUpdate = true
      botRef.instanceMatrix.needsUpdate = true
      tailsInst.instanceMatrix.needsUpdate = true
    }

    updateHeads(leftTopHeadsRef.current, leftBotHeadsRef.current, leftTailsRef.current, LEFT_COLS, MAIN_ROWS, 0, LEFT_T_MAX)
    updateHeads(centerTopHeadsRef.current, centerBotHeadsRef.current, centerTailsRef.current, CENTER_COLS, MAIN_ROWS, CENTER_T_MIN, CENTER_T_MAX)
    updateHeads(rightTopHeadsRef.current, rightBotHeadsRef.current, rightTailsRef.current, RIGHT_COLS, MAIN_ROWS, RIGHT_T_MIN, 1.0)
  })

  return (
    <group ref={groupRef} position={[0, 0.15, -2.5]} rotation={[0.15, 0, 0.02]}>
      <mesh ref={leftRibbonRef} geometry={leftRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={120} specular={COLORS.coreRibbonSpec} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={centerRibbonRef} geometry={centerRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={120} specular={COLORS.coreRibbonSpec} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={rightRibbonRef} geometry={rightRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={120} specular={COLORS.coreRibbonSpec} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <instancedMesh ref={leftTopHeadsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} />
      </instancedMesh>
      <instancedMesh ref={leftBotHeadsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} />
      </instancedMesh>
      <instancedMesh ref={leftTailsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#8a9060")} />
      </instancedMesh>

      <instancedMesh ref={centerTopHeadsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} />
      </instancedMesh>
      <instancedMesh ref={centerBotHeadsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} />
      </instancedMesh>
      <instancedMesh ref={centerTailsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#8a9060")} />
      </instancedMesh>

      <instancedMesh ref={rightTopHeadsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} />
      </instancedMesh>
      <instancedMesh ref={rightBotHeadsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} />
      </instancedMesh>
      <instancedMesh ref={rightTailsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#8a9060")} />
      </instancedMesh>
    </group>
  )
}
