"use client"

import { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { SimplexNoise } from "./SimplexNoise"

const CURVE_SEGS = 220
const MEMBRANE_WIDTH = 1.2
const MEMBRANE_THICKNESS = 0.28
const COLS = 160
const ROWS = 16
const HEAD_RADIUS = 0.028
const TAIL_RADIUS = 0.014
const TAIL_GAP = 0.18
const VERTS_PER_STEP = 8

const COLORS = {
  headTop: new THREE.Color("#d4a84c"),
  headTopSpec: new THREE.Color("#f0d888"),
  headBottom: new THREE.Color("#b89030"),
  headBottomSpec: new THREE.Color("#d0b050"),
  tails: new THREE.Color("#5a6a40"),
  coreRibbon: new THREE.Color("#4a5a38"),
  proteinCap: new THREE.Color("#d47090"),
  proteinCapSpec: new THREE.Color("#f0b0c8"),
}

const PROTEIN_T_VALUES = [0.08, 0.22, 0.38, 0.52, 0.68, 0.82, 0.94]

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const HALF_LENGTH = 12.0
const SAMPLE_N = 200
const CIRCLE_R = 1.6
const X_MIN = -HALF_LENGTH
const X_MAX = HALF_LENGTH

function buildStraightControlPoints(): THREE.Vector3[] {
  return [
    new THREE.Vector3(-12.0, 2.8, -2.4),
    new THREE.Vector3(-9.5, 1.7, -1.6),
    new THREE.Vector3(-7.5, 1.0, -1.1),
    new THREE.Vector3(-5.5, 0.5, -0.5),
    new THREE.Vector3(-3.5, 0.18, -0.08),
    new THREE.Vector3(-2.0, 0.03, 0.18),
    new THREE.Vector3(-0.7, -0.02, 0.25),
    new THREE.Vector3(0.0, -0.05, 0.25),
    new THREE.Vector3(0.7, -0.01, 0.1),
    new THREE.Vector3(2.0, 0.05, -0.1),
    new THREE.Vector3(3.5, 0.2, -0.35),
    new THREE.Vector3(5.5, 0.55, -0.6),
    new THREE.Vector3(7.5, 1.05, -1.15),
    new THREE.Vector3(9.5, 1.75, -1.7),
    new THREE.Vector3(12.0, 2.9, -2.5),
  ]
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

interface CenterFrame {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
}

function computeStraightSamples(
  straightCurve: THREE.CatmullRomCurve3
): { xs: number[]; ys: number[]; zs: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  const zs: number[] = []
  for (let i = 0; i <= SAMPLE_N; i++) {
    const x = X_MIN + (X_MAX - X_MIN) * i / SAMPLE_N
    const t = i / SAMPLE_N
    const pt = straightCurve.getPointAt(t)
    xs.push(x)
    ys.push(pt.y)
    zs.push(pt.z)
  }
  return { xs, ys, zs }
}

function interpolateSample(
  xs: number[], ys: number[], zs: number[],
  targetX: number
): { y: number; z: number } {
  const t = (targetX - X_MIN) / (X_MAX - X_MIN) * SAMPLE_N
  const i = Math.max(0, Math.min(SAMPLE_N - 1, Math.floor(t)))
  const f = t - i
  return {
    y: ys[i] * (1 - f) + ys[i + 1] * f,
    z: zs[i] * (1 - f) + zs[i + 1] * f,
  }
}

function computeBentFrames(
  straightSamples: { xs: number[]; ys: number[]; zs: number[] },
  phase: number
): CenterFrame[] {
  const { xs, ys, zs } = straightSamples
  const ep = easeInOutCubic(Math.min(1, phase))
  const N = SAMPLE_N
  const R = CIRCLE_R

  const frames: CenterFrame[] = []

  for (let i = 0; i <= N; i++) {
    const t = i / N
    const angle = 2 * Math.PI * t
    const cx = R * Math.sin(angle)
    const cy = -R * Math.cos(angle)

    frames.push({
      x: cx * ep + xs[i] * (1 - ep),
      y: cy * ep + ys[i] * (1 - ep),
      z: zs[i] * (1 - ep),
      tx: 0,
      ty: 0,
      tz: 0,
    })
  }

  for (let i = 0; i <= N; i++) {
    const ip = Math.min(N, i + 1)
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
  breathingAmp: number
) {
  const halfW = MEMBRANE_WIDTH / 2
  const halfH = MEMBRANE_THICKNESS / 2
  for (let i = 0; i <= CURVE_SEGS; i++) {
    const t = i / CURVE_SEGS
    const { point, binormal, normal } = getFrameAtT(frames, t)

    const microWave = Math.sin(time * 1.4 + t * Math.PI * 3) * 0.006 * breathingAmp
    const microNoise = noise.fbm(point.x * 0.12 + time * 0.1, point.y * 0.12, 0, 2) * 0.02 * breathingAmp
    const bx = binormal.x
    const bz = binormal.z
    const nx = normal.x
    const nz = normal.z
    const cx = point.x
    const cy = point.y + microWave + microNoise
    const cz = point.z
    const v = [
      [cx + bx * halfW + nx * halfH, cy + halfH * 0.3, cz + bz * halfW + nz * halfH],
      [cx - bx * halfW + nx * halfH, cy + halfH * 0.3, cz - bz * halfW + nz * halfH],
      [cx - bx * halfW - nx * halfH, cy - halfH * 0.3, cz - bz * halfW - nz * halfH],
      [cx + bx * halfW - nx * halfH, cy - halfH * 0.3, cz + bz * halfW - nz * halfH],
      [cx + bx * halfW + nx * halfH, cy + halfH, cz + bz * halfW + nz * halfH],
      [cx - bx * halfW + nx * halfH, cy + halfH, cz - bz * halfW + nz * halfH],
      [cx - bx * halfW - nx * halfH, cy - halfH, cz - bz * halfW - nz * halfH],
      [cx + bx * halfW - nx * halfH, cy - halfH, cz + bz * halfW - nz * halfH],
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

function buildCylinderVerts(
  cx: number, cy: number, cz: number,
  radius: number, height: number,
  radialSegs: number, heightSegs: number
): { positions: number[]; normals: number[]; indices: number[] } {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const halfH = height / 2
  for (let j = 0; j <= radialSegs; j++) {
    const angle = (j / radialSegs) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (let i = 0; i <= heightSegs; i++) {
      const y = -halfH + (i / heightSegs) * height
      positions.push(cx + cos * radius, cy + y, cz + sin * radius)
      normals.push(cos, 0, sin)
    }
  }
  for (let j = 0; j < radialSegs; j++) {
    for (let i = 0; i < heightSegs; i++) {
      const a = j * (heightSegs + 1) + i
      const b = a + heightSegs + 1
      indices.push(a, b, a + 1)
      indices.push(a + 1, b, b + 1)
    }
  }
  return { positions, normals, indices }
}

function buildSphereVerts(
  cx: number, cy: number, cz: number,
  radius: number, widthSegs: number, heightSegs: number
): { positions: number[]; normals: number[]; indices: number[] } {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  for (let y = 0; y <= heightSegs; y++) {
    const v = y / heightSegs
    const phi = v * Math.PI
    const sp = Math.sin(phi)
    const cp = Math.cos(phi)
    for (let x = 0; x <= widthSegs; x++) {
      const u = x / widthSegs
      const theta = u * Math.PI * 2
      const nx = sp * Math.cos(theta)
      const ny = cp
      const nz = sp * Math.sin(theta)
      positions.push(cx + nx * radius, cy + ny * radius, cz + nz * radius)
      normals.push(nx, ny, nz)
    }
  }
  for (let y = 0; y < heightSegs; y++) {
    for (let x = 0; x < widthSegs; x++) {
      const a = y * (widthSegs + 1) + x
      const b = a + widthSegs + 1
      indices.push(a, b, a + 1)
      indices.push(a + 1, b, b + 1)
    }
  }
  return { positions, normals, indices }
}

function mergeBufferGeos(geos: { positions: number[]; normals: number[]; indices: number[] }[]): THREE.BufferGeometry {
  let vertexOffset = 0
  const allPos: number[] = []
  const allNorm: number[] = []
  const allIdx: number[] = []
  for (const g of geos) {
    allPos.push(...g.positions)
    allNorm.push(...g.normals)
    for (const idx of g.indices) allIdx.push(idx + vertexOffset)
    vertexOffset += g.positions.length / 3
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(allNorm, 3))
  geo.setIndex(allIdx)
  geo.computeVertexNormals()
  return geo
}

function buildProteinGeometry(isChannel: boolean): THREE.BufferGeometry {
  const parts: { positions: number[]; normals: number[]; indices: number[] }[] = []
  parts.push(buildCylinderVerts(0, 0.12, 0, 0.018, 0.22, 6, 1))
  parts.push(buildSphereVerts(0, 0.3, 0, 0.09, 10, 8))
  parts.push(buildSphereVerts(0.04, 0.36, 0.02, 0.04, 6, 5))
  parts.push(buildSphereVerts(-0.03, 0.34, -0.03, 0.035, 6, 5))
  parts.push(buildSphereVerts(0.01, 0.38, -0.02, 0.03, 6, 5))
  if (isChannel) parts.push(buildCylinderVerts(0, 0.0, 0, 0.03, 0.14, 8, 1))
  return mergeBufferGeos(parts)
}

function buildRibbonGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const totalVerts = (CURVE_SEGS + 1) * VERTS_PER_STEP
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 3), 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 3), 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(totalVerts * 2), 2))
  const indices: number[] = []
  for (let i = 0; i < CURVE_SEGS; i++) {
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
  for (let i = 0; i <= CURVE_SEGS; i++) {
    const t = i / CURVE_SEGS
    for (let j = 0; j < VERTS_PER_STEP; j++) {
      const idx = i * VERTS_PER_STEP * 2 + j * 2
      uvArr[idx] = t
      uvArr[idx + 1] = j < 4 ? 0.5 : (j < 6 ? 1 : 0)
    }
  }
  geo.attributes.uv.needsUpdate = true
  return geo
}

function bufferGeoToPart(geo: THREE.BufferGeometry): { positions: number[]; normals: number[]; indices: number[] } {
  return {
    positions: Array.from(geo.attributes.position.array as Float32Array),
    normals: Array.from(geo.attributes.normal.array as Float32Array),
    indices: geo.index ? Array.from(geo.index.array as Uint16Array) : [],
  }
}

function buildDNAHelix(
  length: number, radius: number, turns: number
): THREE.BufferGeometry {
  const TUBE_R = 0.008
  const RUNG_R = 0.005
  const RUNG_COUNT = 36

  class HelixPath extends THREE.Curve<THREE.Vector3> {
    r: number; h: number; n: number; o: number
    constructor(r: number, h: number, n: number, o: number) {
      super()
      this.r = r; this.h = h; this.n = n; this.o = o
    }
    getPoint(t: number): THREE.Vector3 {
      const a = t * Math.PI * 2 * this.n + this.o
      return new THREE.Vector3(
        Math.cos(a) * this.r,
        -this.h / 2 + t * this.h,
        Math.sin(a) * this.r
      )
    }
  }

  const c0 = new HelixPath(radius, length, turns, 0)
  const c1 = new HelixPath(radius, length, turns, Math.PI)

  const tube0 = bufferGeoToPart(new THREE.TubeGeometry(c0, 120, TUBE_R, 6, false))
  const tube1 = bufferGeoToPart(new THREE.TubeGeometry(c1, 120, TUBE_R, 6, false))

  const rungParts: { positions: number[]; normals: number[]; indices: number[] }[] = []
  for (let i = 0; i < RUNG_COUNT; i++) {
    const t = (i + 0.5) / RUNG_COUNT
    const p0 = c0.getPoint(t)
    const p1 = c1.getPoint(t)
    const dir = new THREE.Vector3().subVectors(p1, p0)
    const len = dir.length()
    dir.normalize()

    let up = new THREE.Vector3(0, 1, 0)
    if (Math.abs(dir.dot(up)) > 0.99) up.set(1, 0, 0)
    const right = new THREE.Vector3().crossVectors(dir, up).normalize()
    up.crossVectors(right, dir).normalize()

    const segs = 5
    const positions: number[] = []
    const normals: number[] = []
    const indices: number[] = []

    for (let ring = 0; ring < 2; ring++) {
      const base = ring === 0 ? p0 : p1
      for (let j = 0; j < segs; j++) {
        const angle = (j / segs) * Math.PI * 2
        const cosA = Math.cos(angle), sinA = Math.sin(angle)
        const nx = right.x * cosA + up.x * sinA
        const ny = right.y * cosA + up.y * sinA
        const nz = right.z * cosA + up.z * sinA
        positions.push(base.x + nx * RUNG_R, base.y + ny * RUNG_R, base.z + nz * RUNG_R)
        normals.push(nx, ny, nz)
      }
    }

    for (let j = 0; j < segs; j++) {
      const j2 = (j + 1) % segs
      indices.push(j, segs + j, j2)
      indices.push(j2, segs + j, segs + j2)
    }

    rungParts.push({ positions, normals, indices })
  }

  return mergeBufferGeos([tube0, tube1, ...rungParts])
}

function buildProteinBlob(seed: number): THREE.BufferGeometry {
  const pseudoRand = (s: number) => ((s * 9301 + 49297) % 233280) / 233280
  const count = 4 + Math.floor(pseudoRand(seed) * 2)
  const parts: { positions: number[]; normals: number[]; indices: number[] }[] = []
  for (let i = 0; i < count; i++) {
    const r = 0.012 + pseudoRand(seed * 7 + i * 13) * 0.01
    const ox = (pseudoRand(seed * 11 + i * 17) - 0.5) * 0.04
    const oy = (pseudoRand(seed * 13 + i * 19) - 0.5) * 0.04
    const oz = (pseudoRand(seed * 17 + i * 23) - 0.5) * 0.04
    parts.push(buildSphereVerts(ox, oy, oz, r, 8, 6))
  }
  return mergeBufferGeos(parts)
}

const EXO_DNA_GEOMS = [
  (() => { const g = buildDNAHelix(0.55, 0.08, 3.0); return g })(),
  (() => { const g = buildDNAHelix(0.48, 0.07, 3.5); return g })(),
  (() => { const g = buildDNAHelix(0.42, 0.06, 2.8); return g })(),
]

function buildTexturedSphere(
  radius: number, wSegs: number, hSegs: number, seed: number, bumpScale: number
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, wSegs, hSegs)
  const posAttr = geo.attributes.position as THREE.BufferAttribute
  const n = new SimplexNoise(seed)
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    const len = Math.sqrt(x * x + y * y + z * z) || 1
    const nx = x / len, ny = y / len, nz = z / len
    const bump = n.noise3D(x * 8, y * 8, z * 8) * bumpScale
      + n.noise3D(x * 16, y * 16, z * 16) * bumpScale * 0.5
    posAttr.setXYZ(i, x + nx * bump, y + ny * bump, z + nz * bump)
  }
  geo.computeVertexNormals()
  return geo
}

const EXO_SHELL_GEOMS = [
  { inner: buildTexturedSphere(0.65, 28, 20, 11, 0.012), rim: buildTexturedSphere(0.71, 28, 20, 12, 0.010) },
  { inner: buildTexturedSphere(0.65, 28, 20, 21, 0.012), rim: buildTexturedSphere(0.71, 28, 20, 22, 0.010) },
  { inner: buildTexturedSphere(0.65, 28, 20, 31, 0.012), rim: buildTexturedSphere(0.71, 28, 20, 32, 0.010) },
  { inner: buildTexturedSphere(0.65, 28, 20, 41, 0.012), rim: buildTexturedSphere(0.71, 28, 20, 42, 0.010) },
]

const EXO_PROTEIN_GEOMS = [
  buildProteinBlob(1), buildProteinBlob(2), buildProteinBlob(3),
  buildProteinBlob(4), buildProteinBlob(5),
]

const EXO_CONTENTS = [
  {
    dnas: [
      { gi: 0, pos: [-0.16, 0, 0] as const, rot: [0.3, 0.5, 0] as const },
      { gi: 1, pos: [0.16, 0, 0] as const, rot: [-0.2, 1.2, 0.1] as const },
    ],
    proteins: [
      { gi: 0, pos: [0, 0.22, 0] as const, sc: 0.8 },
      { gi: 1, pos: [0, -0.22, 0] as const, sc: 0.7 },
      { gi: 2, pos: [0, 0, 0.22] as const, sc: 0.75 },
    ],
  },
  {
    dnas: [
      { gi: 1, pos: [-0.14, 0, 0] as const, rot: [0.2, 0.3, -0.1] as const },
      { gi: 2, pos: [0.14, 0, 0] as const, rot: [-0.1, 0.8, 0.2] as const },
      { gi: 0, pos: [0, 0, 0.14] as const, rot: [0.15, 1.5, -0.1] as const },
    ],
    proteins: [
      { gi: 3, pos: [0, 0.2, -0.12] as const, sc: 0.8 },
      { gi: 4, pos: [0, -0.2, -0.12] as const, sc: 0.75 },
    ],
  },
  {
    dnas: [
      { gi: 0, pos: [0.14, 0, 0] as const, rot: [-0.2, 0.6, 0.15] as const },
      { gi: 2, pos: [-0.14, 0, 0] as const, rot: [0.2, 1.1, -0.1] as const },
      { gi: 1, pos: [0, 0, -0.14] as const, rot: [0.1, 1.8, 0.2] as const },
    ],
    proteins: [
      { gi: 1, pos: [0, 0.2, 0.12] as const, sc: 0.75 },
      { gi: 2, pos: [0, -0.2, 0.12] as const, sc: 0.8 },
      { gi: 4, pos: [0, 0, -0.2] as const, sc: 0.7 },
    ],
  },
  {
    dnas: [
      { gi: 2, pos: [-0.13, 0, 0] as const, rot: [0.2, 0.4, 0.15] as const },
      { gi: 0, pos: [0.13, 0, 0] as const, rot: [-0.15, 1.0, -0.1] as const },
    ],
    proteins: [
      { gi: 3, pos: [0, 0.2, 0.12] as const, sc: 0.8 },
      { gi: 1, pos: [0, -0.2, 0.12] as const, sc: 0.75 },
      { gi: 4, pos: [0, 0, -0.2] as const, sc: 0.7 },
    ],
  },
]

const SMALL_EXO_CONFIGS = [
  { start: [-8, 6, -4] as const, end: [-0.7, 0.5, 0.3] as const, stagger: 0 },
  { start: [8, 5.5, -3.5] as const, end: [0.7, 0.5, -0.3] as const, stagger: 0.12 },
  { start: [-7, -5.5, -4] as const, end: [-0.7, -0.5, 0.35] as const, stagger: 0.24 },
  { start: [7.5, -6, -3.8] as const, end: [0.7, -0.5, -0.35] as const, stagger: 0.36 },
]

export default function BilayerMembrane() {
  const groupRef = useRef<THREE.Group>(null)
  const topHeadsRef = useRef<THREE.InstancedMesh>(null)
  const botHeadsRef = useRef<THREE.InstancedMesh>(null)
  const tailsRef = useRef<THREE.InstancedMesh>(null)
  const ribbonRef = useRef<THREE.Mesh>(null)
  const proteinGroupRefs = useRef<(THREE.Group | null)[]>([])
  const sphereRef = useRef<THREE.Mesh>(null)
  const rimRef = useRef<THREE.Mesh>(null)
  const smallExoRefs = useRef<(THREE.Group | null)[]>([])

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

  const {
    straightCurve,
    straightSamples,
    proteinLateralOffsets,
    proteinScales,
  } = useMemo(() => {
    const straightPoints = buildStraightControlPoints()
    const straightCurve = new THREE.CatmullRomCurve3(straightPoints, false, "catmullrom", 0.5)
    const straightSamples = computeStraightSamples(straightCurve)
    const proteinLateralOffsets = PROTEIN_T_VALUES.map((_, i) => ((i % 3) - 1) * MEMBRANE_WIDTH * 0.22)
    const proteinScales = PROTEIN_T_VALUES.map((_, i) => 0.9 + (i % 3) * 0.15)
    return { straightCurve, straightSamples, proteinLateralOffsets, proteinScales }
  }, [])

  const proteinGeo = useMemo(() => {
    return PROTEIN_T_VALUES.map((_, i) => buildProteinGeometry(i % 4 === 2))
  }, [])

  const ribbonGeo = useMemo(() => buildRibbonGeometry(), [])

  const scrollRange = useRef({ start: 0, end: 1.5 * (typeof window !== "undefined" ? window.innerHeight : 800) })

  useEffect(() => {
    function updateRange() {
      const hero = document.getElementById("hero")
      if (!hero) return
      const heroTop = hero.getBoundingClientRect().top + window.scrollY
      let section: HTMLElement = hero
      for (let i = 0; i < 7; i++) {
        if (section.nextElementSibling) section = section.nextElementSibling as HTMLElement
      }
      const endRect = section.getBoundingClientRect()
      const end = endRect.top + window.scrollY + endRect.height * 0.5
      scrollRange.current = { start: heroTop, end }
    }
    updateRange()
    window.addEventListener("resize", updateRange)
    return () => window.removeEventListener("resize", updateRange)
  }, [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const scrollY = window.scrollY || 0
    const { start, end } = scrollRange.current
    const rawProgress = end > start ? (scrollY - start) / (end - start) : 0
    const globalProgress = Math.max(0, Math.min(1, rawProgress))

    const ringPhase = easeInOutCubic(Math.max(0, Math.min(1, (globalProgress - 0.05) / 0.35)))
    const spherePhase = easeInOutCubic(Math.max(0, Math.min(1, (globalProgress - 0.55) / 0.2)))
    const entryPhase = Math.max(0, Math.min(1, (globalProgress - 0.82) / 0.18))

    const breathingAmp = Math.max(0.2, 1.0 - ringPhase * 0.6)

    if (groupRef.current) {
      const circleFloat = Math.min(1, ringPhase) * (1 - spherePhase)
      const stripIdle = (1 - ringPhase) * (1 - spherePhase)
      const animAmount = Math.max(stripIdle * 0.8, circleFloat * 0.8, spherePhase * 0.7)
      const idleFloat = Math.sin(time * 0.7) * 0.18 * animAmount
        + Math.sin(time * 1.2) * 0.08 * animAmount
      const idleSway = Math.cos(time * 0.5) * 0.1 * animAmount
        + Math.sin(time * 0.9) * 0.05 * animAmount
      const idleTilt = Math.sin(time * 0.6) * 0.015 * animAmount
      groupRef.current.position.y = 0.15 + idleFloat
      groupRef.current.position.x = idleSway
      groupRef.current.rotation.z = idleTilt
      groupRef.current.scale.setScalar(groupScale.current)
    }

    const frames = computeBentFrames(straightSamples, ringPhase)

    if (ribbonRef.current) {
      const posAttr = ribbonRef.current.geometry.attributes.position as THREE.BufferAttribute
      const normAttr = ribbonRef.current.geometry.attributes.normal as THREE.BufferAttribute
      fillRibbonFromFrames(
        frames, noise, time,
        posAttr.array as Float32Array,
        normAttr.array as Float32Array,
        breathingAmp
      )
      posAttr.needsUpdate = true
      normAttr.needsUpdate = true
      ribbonRef.current.geometry.computeVertexNormals()
    }

    const dummy = new THREE.Object3D()
    if (topHeadsRef.current && botHeadsRef.current && tailsRef.current) {
      for (let col = 0; col < COLS; col++) {
        const t = (col + 0.5) / COLS
        const { point, binormal } = getFrameAtT(frames, t)

        const breathe = Math.sin(time * 1.0 + t * Math.PI * 2) * 0.025 * breathingAmp
          + Math.sin(time * 0.6 + t * Math.PI * 0.8) * 0.015 * breathingAmp

        for (let row = 0; row < ROWS; row++) {
          const rowT = (row / (ROWS - 1)) - 0.5
          const offX = binormal.x * rowT * MEMBRANE_WIDTH
          const offZ = binormal.z * rowT * MEMBRANE_WIDTH

          const px = point.x + offX
          const py = point.y + breathe
          const pz = point.z + offZ

          const jitterX = noise.noise3D(px * 10 + time * 0.3, 0, pz * 10) * 0.008 * breathingAmp * (1 - spherePhase)
          const jitterZ = noise.noise3D(px * 10 + 300, 0, pz * 10 + time * 0.3 + 300) * 0.008 * breathingAmp * (1 - spherePhase)
          const jx = px + jitterX
          const jz = pz + jitterZ

          const idx = col * ROWS + row

          dummy.position.set(jx, py + MEMBRANE_THICKNESS * 0.38, jz)
          dummy.updateMatrix()
          topHeadsRef.current.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx, py - MEMBRANE_THICKNESS * 0.38, jz)
          dummy.updateMatrix()
          botHeadsRef.current.setMatrixAt(idx, dummy.matrix)

          dummy.position.set(jx, py, jz)
          dummy.updateMatrix()
          tailsRef.current.setMatrixAt(idx, dummy.matrix)
        }
      }
      topHeadsRef.current.instanceMatrix.needsUpdate = true
      botHeadsRef.current.instanceMatrix.needsUpdate = true
      tailsRef.current.instanceMatrix.needsUpdate = true
    }

    PROTEIN_T_VALUES.forEach((pt, i) => {
      const group = proteinGroupRefs.current[i]
      if (!group) return
      const { point, binormal } = getFrameAtT(frames, pt)
      const latOff = proteinLateralOffsets[i]
      const sway = Math.sin(time * 1.4 + i * 1.8) * 0.015 * breathingAmp
      const microBob = Math.sin(time * 1.0 + i * 2.1) * 0.01 * breathingAmp
      group.position.set(
        point.x + binormal.x * latOff + sway,
        point.y + MEMBRANE_THICKNESS * 0.38 + 0.02 + microBob,
        point.z + binormal.z * latOff
      )
    })

    const ringFade = 1 - spherePhase
    if (topHeadsRef.current) {
      const m = topHeadsRef.current.material as THREE.MeshPhongMaterial
      m.opacity = ringFade
      m.transparent = true
      m.depthWrite = ringFade > 0.5
    }
    if (botHeadsRef.current) {
      const m = botHeadsRef.current.material as THREE.MeshPhongMaterial
      m.opacity = ringFade
      m.transparent = true
      m.depthWrite = ringFade > 0.5
    }
    if (tailsRef.current) {
      const m = tailsRef.current.material as THREE.MeshPhongMaterial
      m.opacity = ringFade * 0.6
      m.transparent = true
      m.depthWrite = ringFade > 0.5
    }
    if (ribbonRef.current) {
      const m = ribbonRef.current.material as THREE.MeshPhongMaterial
      m.opacity = 0.6 * ringFade
    }
    PROTEIN_T_VALUES.forEach((_, i) => {
      const group = proteinGroupRefs.current[i]
      if (!group) return
      group.scale.setScalar(proteinScales[i] * ringFade)
    })

    // ── Hollow Exosome (Sphere + Rim) — continuous fast idle ──
    if (sphereRef.current) {
      const mat = sphereRef.current.material as THREE.MeshPhongMaterial
      mat.opacity = spherePhase * 0.12
      mat.depthWrite = false
      sphereRef.current.visible = spherePhase > 0.001

      const bx = Math.sin(time * 0.8) * 0.25
        + Math.sin(time * 0.35) * 0.12
        + Math.cos(time * 1.1) * 0.06
      const by = Math.cos(time * 0.6) * 0.3
        + Math.sin(time * 0.9) * 0.15
        + Math.cos(time * 0.45) * 0.08
      const bz = Math.sin(time * 0.7) * 0.18
        + Math.cos(time * 0.5) * 0.1
      sphereRef.current.position.set(bx, 0.15 + by, bz)

      const sc = 1 + Math.sin(time * 0.9) * 0.05
        + Math.sin(time * 0.55) * 0.03
        + Math.cos(time * 1.2) * 0.02
      sphereRef.current.scale.setScalar(sc)

      sphereRef.current.rotation.y = time * 0.25
      sphereRef.current.rotation.x = Math.sin(time * 0.4) * 0.15
      sphereRef.current.rotation.z = Math.cos(time * 0.3) * 0.08

      const geo = sphereRef.current.geometry as THREE.SphereGeometry
      const posAttr = geo.attributes.position as THREE.BufferAttribute
      if (!sphereRef.current.userData.origPositions) {
        sphereRef.current.userData.origPositions = new Float32Array(posAttr.array)
      }
      const orig = sphereRef.current.userData.origPositions as Float32Array
      for (let i = 0; i < posAttr.count; i++) {
        const ox = orig[i * 3]
        const oy = orig[i * 3 + 1]
        const oz = orig[i * 3 + 2]
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1
        const nx = ox / len, ny = oy / len, nz = oz / len
        const w1 = noise.noise3D(ox * 0.4 + time * 0.2, oy * 0.4 + time * 0.12, oz * 0.4 + time * 0.16) * 0.15
        const w2 = noise.noise3D(ox * 0.9 + time * 0.35, oy * 0.9 - time * 0.25, oz * 0.9 + time * 0.3) * 0.08
        const w3 = noise.noise3D(ox * 1.6 + time * 0.55, oy * 1.6 + time * 0.4, oz * 1.6 - time * 0.35) * 0.04
        const disp = (w1 + w2 + w3) * spherePhase
        posAttr.setXYZ(i, ox + nx * disp, oy + ny * disp, oz + nz * disp)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
    }

    if (rimRef.current) {
      const mat = rimRef.current.material as THREE.MeshPhongMaterial
      mat.opacity = spherePhase * 0.30
      mat.depthWrite = false
      rimRef.current.visible = spherePhase > 0.001

      const bx = Math.sin(time * 0.8) * 0.25
        + Math.sin(time * 0.35) * 0.12
        + Math.cos(time * 1.1) * 0.06
      const by = Math.cos(time * 0.6) * 0.3
        + Math.sin(time * 0.9) * 0.15
        + Math.cos(time * 0.45) * 0.08
      const bz = Math.sin(time * 0.7) * 0.18
        + Math.cos(time * 0.5) * 0.1
      rimRef.current.position.set(bx, 0.15 + by, bz)

      const sc = 1 + Math.sin(time * 0.9) * 0.05
        + Math.sin(time * 0.55) * 0.03
        + Math.cos(time * 1.2) * 0.02
      rimRef.current.scale.setScalar(sc)

      rimRef.current.rotation.y = time * 0.25
      rimRef.current.rotation.x = Math.sin(time * 0.4) * 0.15
      rimRef.current.rotation.z = Math.cos(time * 0.3) * 0.08
    }

    // ── Small Exosomes — enter then float freely inside ──
    for (let i = 0; i < 4; i++) {
      const exoGroup = smallExoRefs.current[i]
      if (!exoGroup) continue
      const cfg = SMALL_EXO_CONFIGS[i]
      const localT = Math.max(0, Math.min(1, (entryPhase - cfg.stagger) / (1 - cfg.stagger)))
      const et = easeInOutCubic(localT)

      const sX = cfg.start[0], sY = cfg.start[1], sZ = cfg.start[2]
      const eX = cfg.end[0], eY = cfg.end[1], eZ = cfg.end[2]

      const approachCurve = Math.sin(et * Math.PI * 0.5)
      const travelX = sX + (eX - sX) * approachCurve
      const travelY = sY + (eY - sY) * approachCurve + Math.sin(et * Math.PI) * 0.5
      const travelZ = sZ + (eZ - sZ) * approachCurve

      const settled = et > 0.95 ? 1 : 0
      const floatX = settled * (Math.sin(time * 0.7 + i * 2.3) * 0.12 + Math.sin(time * 1.1 + i * 1.5) * 0.06)
      const floatY = settled * (Math.cos(time * 0.5 + i * 1.8) * 0.1 + Math.sin(time * 0.85 + i * 2.0) * 0.07)
      const floatZ = settled * (Math.sin(time * 0.6 + i * 2.5) * 0.08 + Math.cos(time * 0.9 + i * 1.2) * 0.05)

      exoGroup.position.set(travelX + floatX, travelY + floatY, travelZ + floatZ)
      exoGroup.rotation.y = time * 0.6 + i * 1.2
      exoGroup.rotation.x = Math.sin(time * 0.4 + i * 0.9) * 0.2
      exoGroup.rotation.z = Math.cos(time * 0.5 + i * 1.1) * 0.15

      const fadeIn = Math.min(1, localT / 0.08)
      const scaleVal = fadeIn * 1.2
      exoGroup.scale.setScalar(scaleVal)
      exoGroup.visible = entryPhase > 0.001

      exoGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const m = obj.material as THREE.MeshPhongMaterial
          if (!m.userData) m.userData = {}
          if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity
          m.opacity = fadeIn * (m.userData.baseOpacity as number)
          m.transparent = true
          m.depthWrite = false
        }
      })
    }
  })

  const initPositions = useMemo(() => {
    const dummy = new THREE.Object3D()
    const topMats: THREE.Matrix4[] = []
    const botMats: THREE.Matrix4[] = []
    const tailMats: THREE.Matrix4[] = []
    for (let col = 0; col < COLS; col++) {
      const t = (col + 0.5) / COLS
      const { point, binormal } = getFrameAtT(
        computeBentFrames(straightSamples, 0), t
      )
      const n = noise.fbm(point.x * 0.12, point.y * 0.12, 0, 2) * 0.01
      for (let row = 0; row < ROWS; row++) {
        const rowT = (row / (ROWS - 1)) - 0.5
        const jx = point.x + binormal.x * rowT * MEMBRANE_WIDTH
        const jz = point.z + binormal.z * rowT * MEMBRANE_WIDTH
        const py = point.y + n
        dummy.position.set(jx, py + MEMBRANE_THICKNESS * 0.38, jz)
        dummy.updateMatrix()
        topMats.push(dummy.matrix.clone())
        dummy.position.set(jx, py - MEMBRANE_THICKNESS * 0.38, jz)
        dummy.updateMatrix()
        botMats.push(dummy.matrix.clone())
        dummy.position.set(jx, py, jz)
        dummy.updateMatrix()
        tailMats.push(dummy.matrix.clone())
      }
    }
    return { topMats, botMats, tailMats }
  }, [straightSamples, noise])

  useEffect(() => {
    if (!topHeadsRef.current || !botHeadsRef.current || !tailsRef.current) return
    initPositions.topMats.forEach((m, i) => topHeadsRef.current!.setMatrixAt(i, m))
    initPositions.botMats.forEach((m, i) => botHeadsRef.current!.setMatrixAt(i, m))
    initPositions.tailMats.forEach((m, i) => tailsRef.current!.setMatrixAt(i, m))
    topHeadsRef.current.instanceMatrix.needsUpdate = true
    botHeadsRef.current.instanceMatrix.needsUpdate = true
    tailsRef.current.instanceMatrix.needsUpdate = true
  }, [initPositions])

  return (
    <group ref={groupRef} position={[0, 0.15, -2.5]}>
      <mesh ref={ribbonRef} geometry={ribbonGeo} frustumCulled={false}>
        <meshPhongMaterial
          color={COLORS.coreRibbon}
          shininess={15}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh ref={topHeadsRef} args={[undefined, undefined, COLS * ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial color={COLORS.headTop} shininess={50} specular={COLORS.headTopSpec} />
      </instancedMesh>

      <instancedMesh ref={botHeadsRef} args={[undefined, undefined, COLS * ROWS]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial color={COLORS.headBottom} shininess={35} specular={COLORS.headBottomSpec} />
      </instancedMesh>

      <instancedMesh ref={tailsRef} args={[undefined, undefined, COLS * ROWS]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 5, 1]} />
        <meshPhongMaterial color={COLORS.tails} shininess={10} />
      </instancedMesh>

      {PROTEIN_T_VALUES.map((pt, i) => (
        <group
          key={i}
          ref={(el) => { proteinGroupRefs.current[i] = el }}
          scale={proteinScales[i]}
        >
          <mesh geometry={proteinGeo[i]} frustumCulled={false}>
            <meshPhongMaterial color={COLORS.proteinCap} shininess={40} specular={COLORS.proteinCapSpec} />
          </mesh>
        </group>
      ))}

      <mesh ref={sphereRef} frustumCulled={false} renderOrder={5}>
        <sphereGeometry args={[CIRCLE_R * 1.25, 80, 60]} />
        <meshPhongMaterial
          color="#90e8d8"
          transparent
          opacity={0}
          shininess={250}
          specular="#c0fff0"
          emissive="#50c8b0"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={rimRef} frustumCulled={false} renderOrder={6}>
        <sphereGeometry args={[CIRCLE_R * 1.3, 80, 60]} />
        <meshPhongMaterial
          color="#60e8d8"
          transparent
          opacity={0}
          shininess={300}
          specular="#b0fff8"
          emissive="#40d8c0"
          emissiveIntensity={2.0}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {SMALL_EXO_CONFIGS.map((_, i) => {
        const content = EXO_CONTENTS[i]
        return (
          <group
            key={`small-exo-${i}`}
            ref={(el) => { smallExoRefs.current[i] = el }}
            position={[SMALL_EXO_CONFIGS[i].start[0], SMALL_EXO_CONFIGS[i].start[1], SMALL_EXO_CONFIGS[i].start[2]]}
            scale={1.2}
          >
            <mesh geometry={EXO_SHELL_GEOMS[i].inner} frustumCulled={false} renderOrder={10}>
              <meshPhongMaterial
                color="#90e8d8"
                transparent
                opacity={0.15}
                shininess={200}
                specular="#c0fff0"
                emissive="#50c8b0"
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={EXO_SHELL_GEOMS[i].rim} frustumCulled={false} renderOrder={11}>
              <meshPhongMaterial
                color="#60e8d0"
                transparent
                opacity={0.10}
                shininess={300}
                specular="#b0fff8"
                emissive="#40d8c0"
                emissiveIntensity={1.2}
                side={THREE.BackSide}
                depthWrite={false}
              />
            </mesh>

            {content.dnas.map((dna, di) => (
              <group key={`dna-${di}`} position={dna.pos as [number, number, number]} rotation={dna.rot as [number, number, number]}>
                <mesh geometry={EXO_DNA_GEOMS[dna.gi]} frustumCulled={false} renderOrder={12}>
                  <meshPhongMaterial
                    color="#8878b0"
                    shininess={70}
                    specular="#c0b0e0"
                    emissive="#6050a0"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              </group>
            ))}

            {content.proteins.map((prot, pi) => (
              <group key={`prot-${pi}`} position={prot.pos as [number, number, number]} scale={prot.sc}>
                <mesh geometry={EXO_PROTEIN_GEOMS[prot.gi]} frustumCulled={false} renderOrder={12}>
                  <meshPhongMaterial
                    color="#e84890"
                    shininess={70}
                    specular="#ffb0d0"
                    emissive="#d02070"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}
    </group>
  )
}
