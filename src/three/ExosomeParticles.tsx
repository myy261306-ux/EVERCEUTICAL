"use client"

import { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SimplexNoise } from "./SimplexNoise"
import InnerExosomes from "./InnerExosomes"

const CURVE_SEGS = 220
const MEMBRANE_WIDTH = 0.95
const MEMBRANE_THICKNESS = 0.28
const MAIN_ROWS = 20
const HEAD_RADIUS = 0.022
const TAIL_RADIUS = 0.011
const TAIL_GAP = 0.18
const VERTS_PER_STEP = 8
const GAP = 0

const CENTER_T_MIN = 0.37
const CENTER_T_MAX = 0.63
const LEFT_T_MAX = CENTER_T_MIN - GAP
const RIGHT_T_MIN = CENTER_T_MAX + GAP
const LEFT_SEGS = Math.floor(CURVE_SEGS * LEFT_T_MAX)
const RIGHT_SEGS = Math.floor(CURVE_SEGS * (1 - RIGHT_T_MIN))
const CENTER_SEGS = Math.floor(CURVE_SEGS * (CENTER_T_MAX - CENTER_T_MIN))
const MAIN_COLS = 280
const LEFT_COLS = Math.floor(MAIN_COLS * LEFT_T_MAX)
const RIGHT_COLS = Math.floor(MAIN_COLS * (1 - RIGHT_T_MIN))
const CENTER_COLS = Math.floor(MAIN_COLS * (CENTER_T_MAX - CENTER_T_MIN))

const COLORS = {
  headTop: new THREE.Color("#a89060"),
  headTopSpec: new THREE.Color("#c8b080"),
  headBottom: new THREE.Color("#8a7848"),
  headBottomSpec: new THREE.Color("#b09868"),
  tails: new THREE.Color("#6a5c38"),
  coreRibbon: new THREE.Color("#8a7850"),
  coreRibbonSpec: new THREE.Color("#a89870"),
  exosome: new THREE.Color("#5ec4d8"),
  exosomeSpec: new THREE.Color("#c0f0ff"),
  exosomeEmissive: new THREE.Color("#2090a8"),
  exosomeEdge: new THREE.Color("#a0e8ff"),
  chipLobe: new THREE.Color("#c87898"),
  chipLobeSpec: new THREE.Color("#ffc0d8"),
  chipBump: new THREE.Color("#a06078"),
  chipBumpSpec: new THREE.Color("#dda0b8"),
  chipStem: new THREE.Color("#9a8868"),
  chipStemSpec: new THREE.Color("#c8b888"),
}

const CHIP_T_POSITIONS = [
  0.06, 0.14, 0.22, 0.30,
  0.39, 0.43, 0.47, 0.50, 0.53, 0.57, 0.61,
  0.70, 0.78, 0.85, 0.92,
]
const CHIP_Z_OFFSETS = [
  0.25, -0.18, 0.35, -0.30,
  0.20, -0.35, 0.10, -0.20, 0.30, -0.15, 0.25,
  -0.25, 0.30, -0.15, 0.20,
]
const CHIP_SCALES = [
  1.15, 1.05, 1.2, 1.0,
  1.15, 1.1, 1.2, 1.05, 1.15, 1.0, 1.15,
  1.0, 1.15, 1.1, 1.15,
]

const INNER_CHIP_T_POSITIONS = [
  0.41, 0.46, 0.50, 0.54, 0.59,
]
const INNER_CHIP_Z_OFFSETS = [
  0.15, -0.25, 0.05, -0.15, 0.20,
]
const INNER_CHIP_SCALES = [
  1.2, 1.3, 1.15, 1.25, 1.3,
]

const SAMPLE_N = 200

function buildStraightControlPoints(): THREE.Vector3[] {
  return [
    new THREE.Vector3(-12.0, 0.45, -1.5),
    new THREE.Vector3(-9.0, 0.28, -0.8),
    new THREE.Vector3(-6.5, 0.14, -0.3),
    new THREE.Vector3(-4.0, 0.05, 0.0),
    new THREE.Vector3(-2.0, 0.01, 0.08),
    new THREE.Vector3(-0.5, -0.01, 0.1),
    new THREE.Vector3(0.0, -0.01, 0.1),
    new THREE.Vector3(0.5, 0.0, 0.08),
    new THREE.Vector3(2.0, 0.03, 0.0),
    new THREE.Vector3(4.0, 0.08, -0.15),
    new THREE.Vector3(6.5, 0.18, -0.35),
    new THREE.Vector3(9.0, 0.32, -0.85),
    new THREE.Vector3(12.0, 0.5, -1.6),
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

function computeArcLength(frames: CenterFrame[], tMin: number, tMax: number): number {
  let len = 0
  const steps = 200
  const dt = (tMax - tMin) / steps
  for (let i = 0; i < steps; i++) {
    const t0 = tMin + dt * i
    const t1 = tMin + dt * (i + 1)
    const a = getFrameAtT(frames, t0)
    const b = getFrameAtT(frames, t1)
    const dx = b.point.x - a.point.x
    const dy = b.point.y - a.point.y
    const dz = b.point.z - a.point.z
    len += Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return len
}

function fillCenterCurlRibbon(
  frames: CenterFrame[],
  noise: SimplexNoise,
  time: number,
  posArr: Float32Array,
  normArr: Float32Array,
  segs: number,
  tMin: number,
  tMax: number,
  curlAmount: number,
  centerMidX: number,
  centerMidY: number,
  centerMidZ: number,
  R: number,
  dropOffset: number,
) {
  const halfW = MEMBRANE_WIDTH / 2
  const halfH = MEMBRANE_THICKNESS / 2
  const innerR = halfH * 0.6
  const outerR = halfH

  for (let i = 0; i <= segs; i++) {
    const s = i / segs
    const t = tMin + (tMax - tMin) * s

    const flatFrame = getFrameAtT(frames, t)
    const flatPx = flatFrame.point.x
    const flatPy = flatFrame.point.y
    const flatPz = flatFrame.point.z
    const flatTx = flatFrame.tangent.x
    const flatTy = flatFrame.tangent.y
    const flatTz = flatFrame.tangent.z

    const angle = -s * Math.PI * 2 * curlAmount
    const curledPx = centerMidX + R * Math.sin(angle)
    const curledPy = centerMidY + R * Math.cos(angle) - R * 0.25
    const curledPz = centerMidZ

    const curledTx = Math.cos(angle)
    const curledTy = -Math.sin(angle)
    const curledTz = 0

    const cx = flatPx + (curledPx - flatPx) * curlAmount
    const cy = flatPy + (curledPy - flatPy) * curlAmount
    const cz = flatPz + (curledPz - flatPz) * curlAmount

    const tx = flatTx + (curledTx - flatTx) * curlAmount
    const ty = flatTy + (curledTy - flatTy) * curlAmount
    const tz = flatTz + (curledTz - flatTz) * curlAmount

    const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1
    const tangentX = tx / tlen, tangentY = ty / tlen, tangentZ = tz / tlen

    const bx = 0, by = 0, bz = 1
    const nx = by * tangentZ - bz * tangentY
    const ny = bz * tangentX - bx * tangentZ
    const nz = bx * tangentY - by * tangentX
    const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1

    const microWave = Math.sin(time * 0.5 + t * Math.PI * 3) * 0.003
    const microNoise = noise.fbm(cx * 0.12 + time * 0.04, cy * 0.12, 0, 2) * 0.008
    const mcy = cy + microWave + microNoise - dropOffset

    const fnx = nx / nlen, fny = ny / nlen, fnz = nz / nlen

    const v = [
      [cx + bx * halfW + fnx * halfH, mcy + fny * innerR, cz + bz * halfW + fnz * halfH],
      [cx - bx * halfW + fnx * halfH, mcy + fny * innerR, cz - bz * halfW + fnz * halfH],
      [cx - bx * halfW - fnx * halfH, mcy - fny * innerR, cz - bz * halfW - fnz * halfH],
      [cx + bx * halfW - fnx * halfH, mcy - fny * innerR, cz + bz * halfW - fnz * halfH],
      [cx + bx * halfW + fnx * halfH, mcy + fny * outerR, cz + bz * halfW + fnz * halfH],
      [cx - bx * halfW + fnx * halfH, mcy + fny * outerR, cz - bz * halfW + fnz * halfH],
      [cx - bx * halfW - fnx * halfH, mcy - fny * outerR, cz - bz * halfW - fnz * halfH],
      [cx + bx * halfW - fnx * halfH, mcy - fny * outerR, cz + bz * halfW - fnz * halfH],
    ]
    const faceNormals = [
      [fnx * 0.3, fny * 0.3, fnz * 0.3], [fnx * 0.3, fny * 0.3, fnz * 0.3],
      [-fnx * 0.3, -fny * 0.3, -fnz * 0.3], [-fnx * 0.3, -fny * 0.3, -fnz * 0.3],
      [fnx, fny, fnz], [fnx, fny, fnz], [-fnx, -fny, -fnz], [-fnx, -fny, -fnz],
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

function getCurledHeadPosition(
  s: number,
  curlAmount: number,
  centerMidX: number,
  centerMidY: number,
  centerMidZ: number,
  R: number,
  frames: CenterFrame[],
  tMin: number,
  tMax: number,
): { px: number; py: number; pz: number; bx: number; bz: number; fnx: number; fny: number; fnz: number } {
  const t = tMin + (tMax - tMin) * s
  const flatFrame = getFrameAtT(frames, t)

  const angle = -s * Math.PI * 2 * curlAmount
  const curledPx = centerMidX + R * Math.sin(angle)
  const curledPy = centerMidY + R * Math.cos(angle) - R * 0.25
  const curledPz = centerMidZ

  const curledTx = Math.cos(angle)
  const curledTy = -Math.sin(angle)
  const curledTz = 0

  const px = flatFrame.point.x + (curledPx - flatFrame.point.x) * curlAmount
  const py = flatFrame.point.y + (curledPy - flatFrame.point.y) * curlAmount
  const pz = flatFrame.point.z + (curledPz - flatFrame.point.z) * curlAmount

  const tx = flatFrame.tangent.x + (curledTx - flatFrame.tangent.x) * curlAmount
  const ty = flatFrame.tangent.y + (curledTy - flatFrame.tangent.y) * curlAmount
  const tz = flatFrame.tangent.z + (curledTz - flatFrame.tangent.z) * curlAmount

  const tlen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1
  const tnx = tx / tlen, tny = ty / tlen, tnz = tz / tlen

  const bx = 0, bz = 1
  const nnx = -tny, nny = tnx, nnz = 0
  const nnLen = Math.sqrt(nnx * nnx + nny * nny + nnz * nnz) || 1
  const fnx = nnx / nnLen, fny = nny / nnLen, fnz = 0

  return { px, py, pz, bx, bz, fnx, fny, fnz }
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
  edgeOffsetX: number = 0,
  edgeOffsetY: number = 0,
  edgeOffsetZ: number = 0,
  innerEdgeRight: boolean = true,
) {
  const halfW = MEMBRANE_WIDTH / 2
  const halfH = MEMBRANE_THICKNESS / 2
  const innerR = halfH * 0.6
  const outerR = halfH

  for (let i = 0; i <= segs; i++) {
    const t = tMin + (tMax - tMin) * (i / segs)
    const { point, binormal, normal } = getFrameAtT(frames, t)
    const microWave = Math.sin(time * 0.5 + t * Math.PI * 3) * 0.003
    const microNoise = noise.fbm(point.x * 0.12 + time * 0.04, point.y * 0.12, 0, 2) * 0.008
    const bx = binormal.x, bz = binormal.z
    const nx = normal.x, ny = normal.y, nz = normal.z
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
      [nx * 0.3, ny * 0.3, nz * 0.3], [nx * 0.3, ny * 0.3, nz * 0.3],
      [-nx * 0.3, -ny * 0.3, -nz * 0.3], [-nx * 0.3, -ny * 0.3, -nz * 0.3],
      [0, 1, 0], [0, 1, 0], [0, -1, 0], [0, -1, 0],
    ]
    const localT = i / segs
    const weight = innerEdgeRight ? localT : (1 - localT)
    const ox = edgeOffsetX * weight
    const oy = edgeOffsetY * weight
    const oz = edgeOffsetZ * weight
    for (let j = 0; j < VERTS_PER_STEP; j++) {
      const idx = (i * VERTS_PER_STEP + j) * 3
      posArr[idx] = v[j][0] + ox
      posArr[idx + 1] = v[j][1] + oy
      posArr[idx + 2] = v[j][2] + oz
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

  const exosomeRef = useRef<THREE.Mesh>(null)
  const exosomeGeoRef = useRef<THREE.SphereGeometry>(null)

  const chipGroupRefs = useRef<THREE.Group[]>([])
  const innerChipGroupRefs = useRef<THREE.Group[]>([])

  const exoEdgeRef = useRef<THREE.Mesh>(null)
  const memClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0.707, -0.707, 0).normalize(), 10), [])

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

  const chipGeos = useMemo(() => {
    function makePlate(radius: number, seed: number): THREE.BufferGeometry {
      const geo = new THREE.IcosahedronGeometry(radius, 3)
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
        y *= 0.22
        const len = Math.sqrt(x * x + y * y + z * z) || 1
        const nx = x / len, ny = y / len, nz = z / len
        const n1 = noise.noise3D(nx * 3 + seed, ny * 3 + seed + 10, nz * 3 + seed + 20)
        const n2 = noise.noise3D(nx * 6 + seed + 50, ny * 6 + seed + 60, nz * 6 + seed + 70)
        const disp = (n1 * 0.6 + n2 * 0.4) * 0.18 * radius
        const r = len + disp
        pos.setXYZ(i, nx * r, ny * r, nz * r)
      }
      geo.computeVertexNormals()
      return geo
    }
    function makeBump(radius: number, seed: number): THREE.BufferGeometry {
      const geo = new THREE.IcosahedronGeometry(radius, 2)
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
        y *= 0.35
        const len = Math.sqrt(x * x + y * y + z * z) || 1
        const nx = x / len, ny = y / len, nz = z / len
        const n = noise.noise3D(nx * 4 + seed, ny * 4 + seed + 10, nz * 4 + seed + 20)
        const r = len + n * 0.25 * radius
        pos.setXYZ(i, nx * r, ny * r, nz * r)
      }
      geo.computeVertexNormals()
      return geo
    }
    const lobes: THREE.BufferGeometry[] = []
    const bumps: THREE.BufferGeometry[] = []
    for (let i = 0; i < CHIP_T_POSITIONS.length; i++) {
      lobes.push(makePlate(0.055, i * 7.3))
      bumps.push(makeBump(0.020, i * 11.1))
    }
    const innerLobes: THREE.BufferGeometry[] = []
    const innerBumps: THREE.BufferGeometry[] = []
    for (let i = 0; i < INNER_CHIP_T_POSITIONS.length; i++) {
      innerLobes.push(makePlate(0.058, i * 9.7 + 100))
      innerBumps.push(makeBump(0.022, i * 13.3 + 200))
    }
    return { lobes, bumps, innerLobes, innerBumps }
  }, [noise])

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

  const scrollTargetRef = useRef(0)
  const sectionBoundsRef = useRef<{ start: number; end: number }[]>([])

  useEffect(() => {
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollH = document.documentElement.scrollHeight - window.innerHeight
        scrollTargetRef.current = scrollH > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollH)) : 0
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    function measureSections() {
      const main = document.querySelector("main")
      if (!main) return
      const sections = Array.from(main.querySelectorAll("section"))
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll <= 0) return
      sectionBoundsRef.current = sections.map((el) => {
        const rect = el.getBoundingClientRect()
        const top = window.scrollY + rect.top
        return {
          start: Math.max(0, top / totalScroll),
          end: Math.min(1, (top + rect.height) / totalScroll),
        }
      })
    }
    measureSections()
    window.addEventListener("resize", measureSections)
    return () => window.removeEventListener("resize", measureSections)
  }, [])

  const { centerMidX, centerMidY, centerMidZ, centerR } = useMemo(() => {
    const mid = getFrameAtT(parentFrames, (CENTER_T_MIN + CENTER_T_MAX) / 2)
    const arcLen = computeArcLength(parentFrames, CENTER_T_MIN, CENTER_T_MAX)
    const R = arcLen / (Math.PI * 2)
    return { centerMidX: mid.point.x, centerMidY: mid.point.y, centerMidZ: mid.point.z, centerR: R }
  }, [parentFrames])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    const rawScroll = scrollTargetRef.current
    const bounds = sectionBoundsRef.current

    function secStart(idx: number): number {
      return bounds[idx]?.start ?? (idx / Math.max(1, bounds.length))
    }
    function secEnd(idx: number): number {
      return bounds[idx]?.end ?? ((idx + 1) / Math.max(1, bounds.length))
    }
    function secProgress(idx: number): number {
      const s = secStart(idx), e = secEnd(idx)
      if (e <= s) return rawScroll >= s ? 1 : 0
      return Math.max(0, Math.min(1, (rawScroll - s) / (e - s)))
    }
    function multiProgress(fromIdx: number, toIdx: number): number {
      const s = secStart(fromIdx), e = secEnd(toIdx)
      if (e <= s) return rawScroll >= s ? 1 : 0
      return Math.max(0, Math.min(1, (rawScroll - s) / (e - s)))
    }
    function scrollStage(start: number, end: number): number {
      if (end <= start) return rawScroll >= start ? 1 : 0
      return Math.max(0, Math.min(1, (rawScroll - start) / (end - start)))
    }

    const nSec = Math.max(1, bounds.length)
    const curlAmount = nSec >= 8 ? multiProgress(0, 1) : scrollStage(0, 0.25)
    const curlEnd = nSec >= 8 ? secEnd(1) : 0.25
    const liftStart = Math.min(0.95, curlEnd + 0.03)
    const liftProg = scrollStage(liftStart, Math.min(1, liftStart + 0.15))
    const sLift = liftProg * liftProg * (3 - 2 * liftProg)
    const circleDrop = sLift * 0.3
    const flatUpOffset = sLift * 4

    const exoConversion = nSec >= 8 ? multiProgress(3, 4) : scrollStage(0.50, 0.70)

    if (groupRef.current) {
      const idleFloat = Math.sin(time * 0.25) * 0.06 + Math.sin(time * 0.4) * 0.025
      const idleSway = Math.cos(time * 0.18) * 0.03 + Math.sin(time * 0.3) * 0.015
      const idleTilt = Math.sin(time * 0.2) * 0.006
      groupRef.current.position.y = 0.15 + idleFloat
      groupRef.current.position.x = idleSway
      groupRef.current.rotation.z = idleTilt
      groupRef.current.scale.setScalar(groupScale.current)
    }

    const bLeftFlat = getFrameAtT(parentFrames, CENTER_T_MIN).point
    const bRightFlat = getFrameAtT(parentFrames, CENTER_T_MAX).point
    const bLeftCurledX = centerMidX + centerR * Math.sin(0)
    const bLeftCurledY = centerMidY + centerR * Math.cos(0) - centerR * 0.25
    const bRightAngle = -Math.PI * 2 * curlAmount
    const bRightCurledX = centerMidX + centerR * Math.sin(bRightAngle)
    const bRightCurledY = centerMidY + centerR * Math.cos(bRightAngle) - centerR * 0.25
    const leftEdgeOffX = (bLeftCurledX - bLeftFlat.x) * curlAmount
    const leftEdgeOffY = (bLeftCurledY - bLeftFlat.y) * curlAmount
    const leftEdgeOffZ = 0
    const rightEdgeOffX = (bRightCurledX - bRightFlat.x) * curlAmount
    const rightEdgeOffY = (bRightCurledY - bRightFlat.y) * curlAmount
    const rightEdgeOffZ = 0

    if (leftRibbonRef.current) {
      const posAttr = leftRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = leftRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, LEFT_SEGS, 0, LEFT_T_MAX, leftEdgeOffX, leftEdgeOffY, leftEdgeOffZ, true)
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      leftRibbonRef.current.position.y = flatUpOffset
      ;(leftRibbonRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 0.45 * (1 - flatUpOffset / 3))
    }

    if (centerRibbonRef.current) {
      const posAttr = centerRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = centerRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      if (curlAmount > 0.01) {
        fillCenterCurlRibbon(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, CENTER_SEGS, CENTER_T_MIN, CENTER_T_MAX, curlAmount, centerMidX, centerMidY, centerMidZ, centerR, circleDrop)
      } else {
        fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, CENTER_SEGS, CENTER_T_MIN, CENTER_T_MAX, 0, 0, 0, true)
      }
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
    }

    if (rightRibbonRef.current) {
      const posAttr = rightRibbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = rightRibbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(parentFrames, noise, time, posAttr.array as Float32Array, normAttr.array as Float32Array, RIGHT_SEGS, RIGHT_T_MIN, 1.0, rightEdgeOffX, rightEdgeOffY, rightEdgeOffZ, false)
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      rightRibbonRef.current.position.y = flatUpOffset
      ;(rightRibbonRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 0.45 * (1 - flatUpOffset / 3))
    }

    function updateHeads(
      topRef: THREE.InstancedMesh | null,
      botRef: THREE.InstancedMesh | null,
      tailsInst: THREE.InstancedMesh | null,
      cols: number,
      rows: number,
      tMin: number,
      tMax: number,
      isCenter: boolean,
      edgeOffX: number = 0,
      edgeOffY: number = 0,
      edgeOffZ: number = 0,
      innerEdgeRight: boolean = true,
    ) {
      if (!topRef || !botRef || !tailsInst) return
      for (let col = 0; col < cols; col++) {
        const s = (col + 0.5) / cols
        let px: number, py: number, pz: number
        let bx: number, bz: number
        let hnx = 0, hny = 1, hnz = 0

        if (isCenter && curlAmount >= 0.01) {
          const curled = getCurledHeadPosition(s, curlAmount, centerMidX, centerMidY, centerMidZ, centerR, parentFrames, tMin, tMax)
          px = curled.px
          py = curled.py - circleDrop
          pz = curled.pz
          bx = curled.bx
          bz = curled.bz
          hnx = curled.fnx
          hny = curled.fny
          hnz = curled.fnz
        } else {
          const t = tMin + (tMax - tMin) * s
          const { point, binormal, normal } = getFrameAtT(parentFrames, t)
          px = point.x
          py = point.y
          pz = point.z
          bx = binormal.x
          bz = binormal.z
          hnx = normal.x
          hny = normal.y
          hnz = normal.z
        }

        const breathe = Math.sin(time * 0.4 + s * Math.PI * 2) * 0.02
          + Math.sin(time * 0.25 + s * Math.PI * 0.8) * 0.012

        const headOffset = MEMBRANE_THICKNESS * 0.38

        const headWeight = isCenter ? 0 : (innerEdgeRight ? s : (1 - s))
        const hox = edgeOffX * headWeight
        const hoy = edgeOffY * headWeight
        const hoz = edgeOffZ * headWeight

        for (let row = 0; row < rows; row++) {
          const rowT = (row / (rows - 1)) - 0.5
          const offX = bx * rowT * MEMBRANE_WIDTH
          const offZ = bz * rowT * MEMBRANE_WIDTH

          const fpx = px + offX
          const fpy = py + breathe
          const fpz = pz + offZ

          const jitterX = noise.noise3D(fpx * 10 + time * 0.12, 0, fpz * 10) * 0.006
          const jitterZ = noise.noise3D(fpx * 10 + 300, 0, fpz * 10 + time * 0.12 + 300) * 0.006
          const jx = fpx + jitterX + hox
          const jz = fpz + jitterZ + hoz

          const idx = col * rows + row

          dummy.position.set(jx + hnx * headOffset, fpy + hoy + hny * headOffset, jz + hnz * headOffset)
          dummy.updateMatrix()
          topRef.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx - hnx * headOffset, fpy + hoy - hny * headOffset, jz - hnz * headOffset)
          dummy.updateMatrix()
          botRef.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx, fpy + hoy, jz)
          dummy.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(hnx, hny, hnz)
          )
          dummy.updateMatrix()
          tailsInst.setMatrixAt(idx, dummy.matrix)
        }
      }
      topRef.instanceMatrix.needsUpdate = true
      botRef.instanceMatrix.needsUpdate = true
      tailsInst.instanceMatrix.needsUpdate = true
    }

    updateHeads(leftTopHeadsRef.current, leftBotHeadsRef.current, leftTailsRef.current, LEFT_COLS, MAIN_ROWS, 0, LEFT_T_MAX, false, leftEdgeOffX, leftEdgeOffY, leftEdgeOffZ, true)
    updateHeads(centerTopHeadsRef.current, centerBotHeadsRef.current, centerTailsRef.current, CENTER_COLS, MAIN_ROWS, CENTER_T_MIN, CENTER_T_MAX, true)
    updateHeads(rightTopHeadsRef.current, rightBotHeadsRef.current, rightTailsRef.current, RIGHT_COLS, MAIN_ROWS, RIGHT_T_MIN, 1.0, false, rightEdgeOffX, rightEdgeOffY, rightEdgeOffZ, false)

    if (leftTopHeadsRef.current) leftTopHeadsRef.current.position.y = flatUpOffset
    if (leftBotHeadsRef.current) leftBotHeadsRef.current.position.y = flatUpOffset
    if (leftTailsRef.current) leftTailsRef.current.position.y = flatUpOffset
    if (leftTopHeadsRef.current) (leftTopHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)
    if (leftBotHeadsRef.current) (leftBotHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)
    if (leftTailsRef.current) (leftTailsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)

    if (rightTopHeadsRef.current) rightTopHeadsRef.current.position.y = flatUpOffset
    if (rightBotHeadsRef.current) rightBotHeadsRef.current.position.y = flatUpOffset
    if (rightTailsRef.current) rightTailsRef.current.position.y = flatUpOffset
    if (rightTopHeadsRef.current) (rightTopHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)
    if (rightBotHeadsRef.current) (rightBotHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)
    if (rightTailsRef.current) (rightTailsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, 1 - flatUpOffset / 3)

    for (let i = 0; i < CHIP_T_POSITIONS.length; i++) {
      const grp = chipGroupRefs.current[i]
      if (!grp) continue
      const tVal = CHIP_T_POSITIONS[i]
      const zOff = CHIP_Z_OFFSETS[i]
      const sc = CHIP_SCALES[i]

      let px: number, py: number, pz: number
      let fnx: number, fny: number, fnz: number

      const isCenter = tVal >= CENTER_T_MIN && tVal <= CENTER_T_MAX
      if (isCenter && curlAmount >= 0.01) {
        const s = (tVal - CENTER_T_MIN) / (CENTER_T_MAX - CENTER_T_MIN)
        const curled = getCurledHeadPosition(s, curlAmount, centerMidX, centerMidY, centerMidZ, centerR, parentFrames, CENTER_T_MIN, CENTER_T_MAX)
        px = curled.px
        py = curled.py - circleDrop
        pz = curled.pz
        fnx = curled.fnx
        fny = curled.fny
        fnz = curled.fnz
      } else {
        const { point, normal } = getFrameAtT(parentFrames, tVal)
        px = point.x
        py = point.y
        pz = point.z
        fnx = normal.x
        fny = normal.y
        fnz = normal.z
      }

      const lift = MEMBRANE_THICKNESS * 0.5 + 0.03
      let chipX: number, chipY: number, chipZ: number
      if (isCenter && curlAmount >= 0.01) {
        const circleCenterY = centerMidY - centerR * 0.25
        const dx = px - centerMidX
        const dy = py - circleCenterY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        chipX = px + (dx / dist) * lift
        chipY = py + (dy / dist) * lift
        chipZ = pz
      } else {
        chipX = px + fnx * lift
        chipY = py + fny * lift + flatUpOffset
        chipZ = pz + fnz * lift
      }

      grp.position.set(chipX, chipY, chipZ)
      if (isCenter) {
        const fadeOut = curlAmount > 0.5 ? Math.max(0, 1 - (curlAmount - 0.5) / 0.35) : 1
        grp.scale.setScalar(sc * fadeOut)
        grp.visible = fadeOut > 0.01 && exoConversion < 0.5
      } else {
        grp.scale.setScalar(sc)
        grp.visible = exoConversion < 0.5
      }
    }

    for (let i = 0; i < INNER_CHIP_T_POSITIONS.length; i++) {
      const grp = innerChipGroupRefs.current[i]
      if (!grp) continue
      const tVal = INNER_CHIP_T_POSITIONS[i]
      const sc = INNER_CHIP_SCALES[i]
      const isCenter = tVal >= CENTER_T_MIN && tVal <= CENTER_T_MAX
      if (!isCenter || curlAmount < 0.01) { grp.visible = false; continue }

      const s = (tVal - CENTER_T_MIN) / (CENTER_T_MAX - CENTER_T_MIN)
      const curled = getCurledHeadPosition(s, curlAmount, centerMidX, centerMidY, centerMidZ, centerR, parentFrames, CENTER_T_MIN, CENTER_T_MAX)
      const px = curled.px
      const py = curled.py - circleDrop
      const pz = curled.pz

      const circleCenterY = centerMidY - centerR * 0.25
      const dx = px - centerMidX
      const dy = py - circleCenterY
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const lift = MEMBRANE_THICKNESS * 0.5 + 0.02

      grp.position.set(
        px - (dx / dist) * lift,
        py - (dy / dist) * lift,
        pz,
      )
      const growIn = curlAmount > 0.5 ? 1 + (curlAmount - 0.5) * 0.6 : curlAmount * 2
      grp.scale.setScalar(sc * growIn)
      grp.visible = curlAmount > 0.01 && exoConversion < 0.5
    }

    const circleAlive = curlAmount >= 1
    const smoothExoFade = exoConversion * exoConversion * (3 - 2 * exoConversion)
    const memFade = 1 - smoothExoFade

    const memClipExtent = centerR * 3
    const memClipSweep = smoothExoFade
    memClipPlane.constant = memClipExtent - memClipSweep * memClipExtent * 2
    const postEntryRaw = nSec >= 8
      ? (() => {
          const pd = secEnd(5) - secEnd(4)
          return pd > 0.001
            ? Math.max(0, Math.min(1, (rawScroll - secEnd(4)) / pd))
            : (rawScroll >= secEnd(4) ? 1 : 0)
        })()
      : scrollStage(0.70, 0.90)
    const postEntry = postEntryRaw
    const liveBoost = circleAlive ? 1 + postEntry * 0.4 : 1

    const cBreatheX = circleAlive ? Math.sin(time * 0.6) * 0.04 * liveBoost + Math.sin(time * 1.1) * 0.012 * postEntry : 0
    const cBreatheY = circleAlive ? Math.cos(time * 0.45) * 0.03 * liveBoost + Math.cos(time * 0.9) * 0.01 * postEntry : 0
    const cPulse = circleAlive ? 1 + Math.sin(time * 0.8) * 0.02 * liveBoost + Math.sin(time * 1.3) * 0.008 * postEntry : 1
    const cRotateZ = circleAlive ? Math.sin(time * 0.35) * 0.03 + Math.sin(time * 0.7) * 0.012 * postEntry : 0
    const cRotateX = circleAlive ? Math.cos(time * 0.28) * 0.015 + Math.cos(time * 0.55) * 0.008 * postEntry : 0

    if (centerRibbonRef.current) {
      centerRibbonRef.current.position.x = cBreatheX
      centerRibbonRef.current.position.y = -circleDrop + cBreatheY
      centerRibbonRef.current.scale.setScalar(cPulse)
      centerRibbonRef.current.rotation.z = cRotateZ
      centerRibbonRef.current.rotation.x = cRotateX
      const mat = centerRibbonRef.current.material as THREE.MeshPhongMaterial
      mat.opacity = 0.45 * Math.max(0, memFade)
      mat.transparent = true
    }

    if (centerTopHeadsRef.current) {
      centerTopHeadsRef.current.position.x = cBreatheX
      centerTopHeadsRef.current.position.y = -circleDrop + cBreatheY
      centerTopHeadsRef.current.scale.setScalar(cPulse)
      centerTopHeadsRef.current.rotation.z = cRotateZ
      centerTopHeadsRef.current.rotation.x = cRotateX
      ;(centerTopHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, memFade)
    }
    if (centerBotHeadsRef.current) {
      centerBotHeadsRef.current.position.x = cBreatheX
      centerBotHeadsRef.current.position.y = -circleDrop + cBreatheY
      centerBotHeadsRef.current.scale.setScalar(cPulse)
      centerBotHeadsRef.current.rotation.z = cRotateZ
      centerBotHeadsRef.current.rotation.x = cRotateX
      ;(centerBotHeadsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, memFade)
    }
    if (centerTailsRef.current) {
      centerTailsRef.current.position.x = cBreatheX
      centerTailsRef.current.position.y = -circleDrop + cBreatheY
      centerTailsRef.current.scale.setScalar(cPulse)
      centerTailsRef.current.rotation.z = cRotateZ
      centerTailsRef.current.rotation.x = cRotateX
      ;(centerTailsRef.current.material as THREE.MeshPhongMaterial).opacity = Math.max(0, memFade)
    }

    if (exosomeRef.current && exosomeGeoRef.current) {
      const shouldShow = exoConversion > 0.001
      exosomeRef.current.visible = shouldShow
      if (shouldShow) {
        const smoothExo = exoConversion * exoConversion * (3 - 2 * exoConversion)
        const exoGrow = centerR * (1.50 + smoothExo * 0.40)
        exosomeRef.current.scale.setScalar(exoGrow)
        exosomeRef.current.position.set(
          centerMidX + Math.sin(time * 0.4) * 0.03,
          centerMidY - centerR * 0.25 - circleDrop + Math.cos(time * 0.35) * 0.025,
          centerMidZ + Math.sin(time * 0.3) * 0.02
        )
        exosomeRef.current.rotation.y = time * 0.15 + postEntry * Math.sin(time * 0.3) * 0.05
        exosomeRef.current.rotation.x = Math.sin(time * 0.25) * 0.08 + postEntry * Math.cos(time * 0.4) * 0.03
        exosomeRef.current.rotation.z = Math.cos(time * 0.2) * 0.06 + postEntry * Math.sin(time * 0.35) * 0.02
        const mat = exosomeRef.current.material as THREE.MeshPhongMaterial
        mat.opacity = smoothExo * 0.32
        mat.transparent = true

        const posAttr = exosomeGeoRef.current.attributes.position as THREE.BufferAttribute
        const arr = posAttr.array as Float32Array
        for (let i = 0; i < posAttr.count; i++) {
          const ox = arr[i * 3]
          const oy = arr[i * 3 + 1]
          const oz = arr[i * 3 + 2]
          const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1
          const nx2 = ox / len, ny2 = oy / len, nz2 = oz / len
          const wave = noise.noise3D(nx2 * 1.5 + time * 0.18, ny2 * 1.5 + time * 0.12, nz2 * 1.5) * 0.035
            + noise.noise3D(nx2 * 3.2 + time * 0.3, ny2 * 3.2, nz2 * 3.2 - time * 0.2) * 0.015
          const r = 1 + wave
          arr[i * 3] = nx2 * r
          arr[i * 3 + 1] = ny2 * r
          arr[i * 3 + 2] = nz2 * r
        }
        posAttr.needsUpdate = true
        exosomeGeoRef.current.computeVertexNormals()

        if (exoEdgeRef.current) {
          exoEdgeRef.current.visible = true
          exoEdgeRef.current.scale.setScalar(exoGrow * 1.02)
          exoEdgeRef.current.position.copy(exosomeRef.current.position)
          exoEdgeRef.current.rotation.copy(exosomeRef.current.rotation)
          const edgeMat = exoEdgeRef.current.material as THREE.MeshPhongMaterial
          edgeMat.opacity = smoothExo * 0.55
          edgeMat.transparent = true
        }
      } else {
        if (exoEdgeRef.current) exoEdgeRef.current.visible = false
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.15, -2.5]} rotation={[0.12, 0, 0.01]}>
      <mesh ref={leftRibbonRef} geometry={leftRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={60} specular={COLORS.coreRibbonSpec} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={centerRibbonRef} geometry={centerRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={60} specular={COLORS.coreRibbonSpec} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} clippingPlanes={[memClipPlane]} />
      </mesh>
      <mesh ref={rightRibbonRef} geometry={rightRibbonGeo} frustumCulled={false}>
        <meshPhongMaterial color={COLORS.coreRibbon} shininess={60} specular={COLORS.coreRibbonSpec} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <instancedMesh ref={leftTopHeadsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={leftBotHeadsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={leftTailsRef} args={[undefined, undefined, LEFT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#c8b860")} transparent depthWrite={false} />
      </instancedMesh>

      <instancedMesh ref={centerTopHeadsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} transparent depthWrite={false} clippingPlanes={[memClipPlane]} />
      </instancedMesh>
      <instancedMesh ref={centerBotHeadsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} transparent depthWrite={false} clippingPlanes={[memClipPlane]} />
      </instancedMesh>
      <instancedMesh ref={centerTailsRef} args={[undefined, undefined, CENTER_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#c8b860")} transparent depthWrite={false} clippingPlanes={[memClipPlane]} />
      </instancedMesh>

      <instancedMesh ref={rightTopHeadsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={150} specular={COLORS.headTopSpec} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={rightBotHeadsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={100} specular={COLORS.headBottomSpec} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={rightTailsRef} args={[undefined, undefined, RIGHT_COLS * MAIN_ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 4, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={50} specular={new THREE.Color("#c8b860")} transparent depthWrite={false} />
      </instancedMesh>

      <mesh ref={exosomeRef} visible={false} frustumCulled={false}>
        <sphereGeometry ref={exosomeGeoRef} args={[1, 48, 36]} />
        <meshPhongMaterial color={COLORS.exosome} shininess={200} specular={new THREE.Color("#ffffff")} emissive={COLORS.exosomeEmissive} emissiveIntensity={0.15} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={exoEdgeRef} visible={false} frustumCulled={false}>
        <sphereGeometry args={[1, 48, 36]} />
        <meshPhongMaterial color={COLORS.exosomeEdge} shininess={300} specular={new THREE.Color("#ffffff")} emissive={COLORS.exosomeEdge} emissiveIntensity={0.6} transparent opacity={0} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {CHIP_T_POSITIONS.map((_, i) => (
        <group
          key={`chip-${i}`}
          ref={(el) => { if (el) chipGroupRefs.current[i] = el }}
          visible={false}
        >
          <mesh position={[0, 0.05 * CHIP_SCALES[i], 0]}>
            <cylinderGeometry args={[0.005, 0.009, 0.10 * CHIP_SCALES[i], 6, 1]} />
            <meshPhongMaterial color={COLORS.chipStem} shininess={60} specular={COLORS.chipStemSpec} />
          </mesh>
          <mesh geometry={chipGeos.lobes[i]} position={[0, 0.11 * CHIP_SCALES[i], 0]}>
            <meshPhongMaterial color={COLORS.chipLobe} shininess={90} specular={COLORS.chipLobeSpec} emissive={0x602038} emissiveIntensity={0.3} />
          </mesh>
          <mesh geometry={chipGeos.bumps[i]} position={[0, 0.135 * CHIP_SCALES[i], 0]}>
            <meshPhongMaterial color={COLORS.chipBump} shininess={70} specular={COLORS.chipBumpSpec} emissive={0x401828} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {INNER_CHIP_T_POSITIONS.map((_, i) => (
        <group
          key={`ichip-${i}`}
          ref={(el) => { if (el) innerChipGroupRefs.current[i] = el }}
          visible={false}
        >
          <mesh position={[0, -0.05 * INNER_CHIP_SCALES[i], 0]}>
            <cylinderGeometry args={[0.004, 0.008, 0.10 * INNER_CHIP_SCALES[i], 6, 1]} />
            <meshPhongMaterial color={COLORS.chipStem} shininess={60} specular={COLORS.chipStemSpec} />
          </mesh>
          <mesh geometry={chipGeos.innerLobes[i]} position={[0, -0.11 * INNER_CHIP_SCALES[i], 0]}>
            <meshPhongMaterial color={COLORS.chipLobe} shininess={90} specular={COLORS.chipLobeSpec} emissive={0x602038} emissiveIntensity={0.3} />
          </mesh>
          <mesh geometry={chipGeos.innerBumps[i]} position={[0, -0.135 * INNER_CHIP_SCALES[i], 0]}>
            <meshPhongMaterial color={COLORS.chipBump} shininess={70} specular={COLORS.chipBumpSpec} emissive={0x401828} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      <InnerExosomes centerY={centerMidY - centerR * 0.25} outerR={centerR * 1.90} />
    </group>
  )
}
