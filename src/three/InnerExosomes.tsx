"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const DNA_LEN = 0.65
const DNA_R = 0.10
const DNA_STRAND_R = 0.018
const DNA_BP_R = 0.011

const SHELL_COL = new THREE.Color("#2888a0")
const SHELL_EMI = new THREE.Color("#106070")
const SHELL_SPEC = new THREE.Color("#80d0e0")

const PINK_COL = new THREE.Color("#d03080")
const PINK_EMI = new THREE.Color("#a01860")
const PINK_SPEC = new THREE.Color("#ff90c0")

const DNA_COL = new THREE.Color("#d0c8b0")
const DNA_EMI = new THREE.Color("#908860")

const RED_COL = new THREE.Color("#c02040")
const RED_EMI = new THREE.Color("#901830")

const RNA_COL = new THREE.Color("#b03050")
const RNA_EMI = new THREE.Color("#801830")

interface ExoConfig {
  gridPos: [number, number]
  staggerOffset: number
  phase: number
  rotSpeed: number
}

const GRID_POSITIONS: [number, number][] = [
  [-0.35, 0.30],
  [0.35, 0.30],
  [-0.35, -0.30],
  [0.35, -0.30],
]

const CONFIGS: ExoConfig[] = [
  { gridPos: GRID_POSITIONS[0], staggerOffset: 0, phase: 0, rotSpeed: 0.10 },
  { gridPos: GRID_POSITIONS[1], staggerOffset: 0.10, phase: 1.5, rotSpeed: -0.08 },
  { gridPos: GRID_POSITIONS[2], staggerOffset: 0.20, phase: 3.0, rotSpeed: 0.12 },
  { gridPos: GRID_POSITIONS[3], staggerOffset: 0.30, phase: 4.5, rotSpeed: -0.11 },
]

function buildDNA(): THREE.BufferGeometry {
  const pos: number[] = []
  const nrm: number[] = []
  const segs = 80
  const turns = 5

  for (let strand = 0; strand < 2; strand++) {
    const off = strand * Math.PI
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      const y = (t - 0.5) * DNA_LEN
      const a = t * Math.PI * 2 * turns + off
      const x = Math.cos(a) * DNA_R
      const z = Math.sin(a) * DNA_R
      const g = new THREE.SphereGeometry(DNA_STRAND_R, 6, 4)
      const m4 = new THREE.Matrix4().makeTranslation(x, y, z)
      g.applyMatrix4(m4)
      const p = g.attributes.position
      for (let j = 0; j < p.count; j++) {
        pos.push(p.getX(j), p.getY(j), p.getZ(j))
        const dx = p.getX(j) - x, dy = p.getY(j) - y, dz = p.getZ(j) - z
        const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
        nrm.push(dx / dl, dy / dl, dz / dl)
      }
      g.dispose()
    }
  }

  const bpCount = 28
  for (let i = 0; i < bpCount; i++) {
    const t = (i + 0.5) / bpCount
    const y = (t - 0.5) * DNA_LEN
    const a = t * Math.PI * 2 * turns
    const x1 = Math.cos(a) * DNA_R, z1 = Math.sin(a) * DNA_R
    const x2 = Math.cos(a + Math.PI) * DNA_R, z2 = Math.sin(a + Math.PI) * DNA_R
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2
    const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
    const bg = new THREE.CylinderGeometry(DNA_BP_R, DNA_BP_R, len, 5, 1)
    const bm = new THREE.Matrix4()
    bm.lookAt(new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2), new THREE.Vector3(0, 1, 0))
    bm.setPosition(new THREE.Vector3(mx, y, mz))
    bm.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
    bg.applyMatrix4(bm)
    const p = bg.attributes.position
    for (let j = 0; j < p.count; j++) {
      pos.push(p.getX(j), p.getY(j), p.getZ(j))
      nrm.push(0, 1, 0)
    }
    bg.dispose()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3))
  return geo
}

function buildProteinBlob(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 3)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const len = Math.sqrt(x * x + y * y + z * z) || 1
    const nx = x / len, ny = y / len, nz = z / len
    const n1 = Math.sin(nx * 4 + seed) * Math.cos(ny * 3 + seed + 5) * Math.sin(nz * 5 + seed + 10)
    const n2 = Math.sin(nx * 7 + seed + 20) * Math.cos(ny * 6 + seed + 30) * Math.sin(nz * 8 + seed + 40)
    const disp = (n1 * 0.5 + n2 * 0.5) * 0.25 * radius
    const r = len + disp
    pos.setXYZ(i, nx * r, ny * r, nz * r)
  }
  geo.computeVertexNormals()
  return geo
}

function buildRNACurve(): THREE.BufferGeometry {
  const pos: number[] = []
  const nrm: number[] = []
  const segs = 40
  const len = 0.30

  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const y = (t - 0.5) * len
    const x = Math.sin(t * Math.PI * 3) * 0.04
    const z = Math.cos(t * Math.PI * 3) * 0.04
    const g = new THREE.SphereGeometry(0.008, 5, 4)
    const m4 = new THREE.Matrix4().makeTranslation(x, y, z)
    g.applyMatrix4(m4)
    const p = g.attributes.position
    for (let j = 0; j < p.count; j++) {
      pos.push(p.getX(j), p.getY(j), p.getZ(j))
      nrm.push(0, 1, 0)
    }
    g.dispose()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3))
  return geo
}

function Exosome({ cfg, shellR, centerY, sectionBoundsRef }: {
  cfg: ExoConfig
  shellR: number
  centerY: number
  sectionBoundsRef: React.MutableRefObject<{ start: number; end: number }[]>
}) {
  const grp = useRef<THREE.Group>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const rimRef = useRef<THREE.Mesh>(null)
  const pinks = useRef<THREE.Mesh[]>([])
  const dnas = useRef<THREE.Mesh[]>([])
  const reds = useRef<THREE.Mesh[]>([])
  const rnas = useRef<THREE.Mesh[]>([])

  const prevScroll = useRef(0)
  const animVal = useRef(0)
  const settled = useRef(false)

  const pinkPos = useMemo(() => [
    [0.18, 0.15, 0.12],
    [-0.16, 0.10, -0.14],
    [0.08, -0.18, 0.10],
    [-0.10, -0.12, -0.08],
  ] as [number, number, number][], [])

  const dnaPos = useMemo(() => [
    { p: [0.16, 0.03, 0.08] as [number, number, number], r: [0.5, 0.8, 0.15] as [number, number, number] },
    { p: [-0.14, -0.04, -0.08] as [number, number, number], r: [-0.4, 1.1, -0.25] as [number, number, number] },
  ], [])

  const redPos = useMemo(() => [
    [0.20, -0.06, 0.15],
    [-0.18, 0.18, 0.06],
    [0.05, 0.20, -0.12],
    [-0.12, -0.20, 0.05],
    [0.15, -0.15, -0.10],
  ] as [number, number, number][], [])

  const rnaPos = useMemo(() => [
    { p: [0.08, 0.05, 0.09] as [number, number, number], r: [0.8, 0.3, 0.5] as [number, number, number] },
    { p: [-0.05, -0.07, -0.06] as [number, number, number], r: [-0.6, 1.2, -0.4] as [number, number, number] },
  ], [])

  const dnaGeo = useMemo(() => buildDNA(), [])
  const proteinGeos = useMemo(() => [
    buildProteinBlob(0.16, 1.0),
    buildProteinBlob(0.14, 2.5),
    buildProteinBlob(0.12, 4.0),
    buildProteinBlob(0.15, 6.0),
  ], [])
  const rnaGeo = useMemo(() => buildRNACurve(), [])

  useFrame(({ clock }) => {
    if (!grp.current) return
    const t = clock.getElapsedTime()

    const sH = document.documentElement.scrollHeight - window.innerHeight
    const raw = sH > 0 ? Math.max(0, Math.min(1, window.scrollY / sH)) : 0

    const bounds = sectionBoundsRef.current
    const nSec = Math.max(1, bounds.length)
    let sec5Prog: number
    if (nSec >= 8) {
      const s5Start = bounds[5]?.start ?? 0.625
      const s5End = bounds[5]?.end ?? 0.75
      sec5Prog = s5End > s5Start
        ? Math.max(0, Math.min(1, (raw - s5Start) / (s5End - s5Start)))
        : 0
    } else {
      sec5Prog = Math.max(0, Math.min(1, (raw - 0.65) / 0.20))
    }

    const entryDur = 0.7
    const rawEntry = Math.max(0, Math.min(1, (sec5Prog - cfg.staggerOffset) / entryDur))

    const fwd = raw >= prevScroll.current
    prevScroll.current = raw

    let entry: number
    if (fwd) {
      entry = rawEntry
      animVal.current = Math.max(animVal.current, entry)
      if (animVal.current >= 0.99) settled.current = true
    } else {
      entry = rawEntry
      animVal.current = entry
      if (entry < 0.01) settled.current = false
    }

    const vis = entry > 0.001
    grp.current.visible = vis
    if (!vis) return

    const e = entry * entry * (3 - 2 * entry)

    const gridX = cfg.gridPos[0] * shellR * 3.0
    const gridY = cfg.gridPos[1] * shellR * 3.0

    const startPosX = cfg.gridPos[0] > 0 ? 4.5 : -4.5
    const startPosY = cfg.gridPos[1] > 0 ? 2.8 : -2.8

    const cx = startPosX + (gridX - startPosX) * e
    const cy = startPosY + (centerY + gridY - startPosY) * e
    const cz = 0.0

    const stl = settled.current && e > 0.98
    const bob = stl ? Math.sin(t * 0.3 + cfg.phase) * 0.008 : 0
    const sway = stl ? Math.cos(t * 0.2 + cfg.phase) * 0.005 : 0

    grp.current.position.set(cx + sway, cy + bob, cz)
    grp.current.scale.setScalar(shellR)

    if (stl) {
      grp.current.rotation.y += cfg.rotSpeed * 0.016
      grp.current.rotation.x = Math.sin(t * 0.15 + cfg.phase) * 0.04
      grp.current.rotation.z = Math.cos(t * 0.12 + cfg.phase) * 0.03
    }

    if (shellRef.current) {
      const m = shellRef.current.material as THREE.MeshPhongMaterial
      m.opacity = 0.28
      m.emissiveIntensity = 0.25 + Math.sin(t * 0.4 + cfg.phase) * 0.1
    }
    if (rimRef.current) {
      const m = rimRef.current.material as THREE.MeshPhongMaterial
      m.opacity = 0.50
      m.emissiveIntensity = 0.65 + Math.sin(t * 0.5 + cfg.phase) * 0.15
    }

    pinks.current.forEach((ref, i) => {
      if (!ref) return
      const d = pinkPos[i]
      const bx = Math.sin(t * 0.4 + i * 1.7) * 0.015
      const by = Math.sin(t * 0.3 + i * 2.1) * 0.018
      const bz = Math.cos(t * 0.35 + i * 1.3) * 0.012
      ref.position.set(d[0] + bx, d[1] + by, d[2] + bz)
      ref.rotation.y = t * 0.12 + i * 1.5
      ref.rotation.x = Math.sin(t * 0.25 + i) * 0.2
      ref.rotation.z = Math.cos(t * 0.2 + i * 0.8) * 0.15
      const m = ref.material as THREE.MeshPhongMaterial
      m.opacity = 0.95
      m.emissiveIntensity = 0.45 + Math.sin(t * 0.45 + i) * 0.15
    })

    dnas.current.forEach((ref, i) => {
      if (!ref) return
      const d = dnaPos[i]
      const sp = t * 0.06 * (i % 2 === 0 ? 1 : -1)
      const bx = Math.sin(t * 0.25 + i * 3) * 0.012
      const by = Math.cos(t * 0.3 + i * 2) * 0.010
      ref.position.set(d.p[0] + bx, d.p[1] + by, d.p[2])
      ref.rotation.set(d.r[0] + sp, d.r[1] + t * 0.03, d.r[2])
      const m = ref.material as THREE.MeshPhongMaterial
      m.opacity = 0.92
    })

    reds.current.forEach((ref, i) => {
      if (!ref) return
      const d = redPos[i]
      const bx = Math.sin(t * 0.5 + i * 2.3) * 0.018
      const by = Math.cos(t * 0.4 + i * 1.8) * 0.020
      const bz = Math.sin(t * 0.35 + i * 2.7) * 0.015
      ref.position.set(d[0] + bx, d[1] + by, d[2] + bz)
      ref.rotation.y = t * 0.10 + i * 2.1
      ref.rotation.x = Math.sin(t * 0.3 + i) * 0.25
      const m = ref.material as THREE.MeshPhongMaterial
      m.emissiveIntensity = 0.4 + Math.sin(t * 0.6 + i) * 0.15
    })

    rnas.current.forEach((ref, i) => {
      if (!ref) return
      const d = rnaPos[i]
      const bx = Math.sin(t * 0.3 + i * 2.5) * 0.010
      const bz = Math.cos(t * 0.35 + i * 1.5) * 0.012
      ref.position.set(d.p[0] + bx, d.p[1], d.p[2] + bz)
      ref.rotation.set(d.r[0] + t * 0.05, d.r[1] + t * 0.04, d.r[2] + t * 0.03)
    })
  })

  return (
    <group ref={grp} visible={false}>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 48, 36]} />
        <meshPhongMaterial
          color={SHELL_COL}
          shininess={200}
          specular={SHELL_SPEC}
          transparent
          opacity={0.28}
          emissive={SHELL_EMI}
          emissiveIntensity={0.25}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={rimRef} scale={1.025}>
        <sphereGeometry args={[1, 48, 36]} />
        <meshPhongMaterial
          color={new THREE.Color("#80d8f0")}
          shininess={300}
          specular={new THREE.Color("#ffffff")}
          transparent
          opacity={0.55}
          emissive={new THREE.Color("#70c8e0")}
          emissiveIntensity={0.7}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {pinkPos.map((p, i) => (
        <mesh
          key={`p${i}`}
          ref={(el) => { if (el) pinks.current[i] = el }}
          position={p}
          geometry={proteinGeos[i % proteinGeos.length]}
        >
          <meshPhongMaterial
            color={PINK_COL}
            shininess={180}
            specular={PINK_SPEC}
            transparent
            opacity={0.95}
            emissive={PINK_EMI}
            emissiveIntensity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}

      {dnaPos.map((d, i) => (
        <mesh
          key={`d${i}`}
          ref={(el) => { if (el) dnas.current[i] = el }}
          geometry={dnaGeo}
          position={d.p}
          rotation={d.r}
        >
          <meshPhongMaterial
            color={DNA_COL}
            shininess={120}
            specular={new THREE.Color("#f0e8d8")}
            transparent
            opacity={0.92}
            emissive={DNA_EMI}
            emissiveIntensity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}

      {redPos.map((p, i) => (
        <mesh
          key={`r${i}`}
          ref={(el) => { if (el) reds.current[i] = el }}
          position={p}
        >
          <sphereGeometry args={[0.055 + (i % 3) * 0.015, 12, 10]} />
          <meshPhongMaterial
            color={RED_COL}
            shininess={140}
            specular={new THREE.Color("#ffaaaa")}
            transparent
            opacity={0.92}
            emissive={RED_EMI}
            emissiveIntensity={0.35}
            depthWrite={false}
          />
        </mesh>
      ))}

      {rnaPos.map((d, i) => (
        <mesh
          key={`rna${i}`}
          ref={(el) => { if (el) rnas.current[i] = el }}
          geometry={rnaGeo}
          position={d.p}
          rotation={d.r}
        >
          <meshPhongMaterial
            color={RNA_COL}
            shininess={100}
            specular={new THREE.Color("#dda0b0")}
            transparent
            opacity={0.90}
            emissive={RNA_EMI}
            emissiveIntensity={0.35}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function InnerExosomes({ centerY = -0.5, outerR = 2.5 }: { centerY?: number; outerR?: number }) {
  const sectionBoundsRef = useRef<{ start: number; end: number }[]>([])

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

  const innerShellR = outerR * 0.32

  return (
    <group>
      {CONFIGS.map((c, i) => (
        <Exosome
          key={i}
          cfg={c}
          shellR={innerShellR}
          centerY={centerY}
          sectionBoundsRef={sectionBoundsRef}
        />
      ))}
    </group>
  )
}
