"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const SHELL_R = 0.32
const PINK_R = 0.14
const DNA_LEN = 0.44
const DNA_R = 0.06
const DNA_STRAND_R = 0.016
const DNA_BP_R = 0.010

const SHELL_COL = new THREE.Color("#55e0c0")
const SHELL_EMI = new THREE.Color("#30c8a0")
const SHELL_SPEC = new THREE.Color("#b0ffe8")

const PINK_COL = new THREE.Color("#e04090")
const PINK_EMI = new THREE.Color("#c02070")
const PINK_SPEC = new THREE.Color("#ffb0d8")

const DNA_COL = new THREE.Color("#186058")
const DNA_EMI = new THREE.Color("#104840")

interface ExoConfig {
  startPos: [number, number, number]
  endPos: [number, number, number]
  staggerOffset: number
  phase: number
  rotSpeed: number
}

const CONFIGS: ExoConfig[] = [
  {
    startPos: [-4.5, 2.8, 0.0],
    endPos: [-0.38, 0.28, 0.0],
    staggerOffset: 0,
    phase: 0,
    rotSpeed: 0.10,
  },
  {
    startPos: [4.5, 2.8, 0.0],
    endPos: [0.38, 0.28, 0.0],
    staggerOffset: 0.10,
    phase: 1.5,
    rotSpeed: -0.08,
  },
  {
    startPos: [-4.5, -2.8, 0.0],
    endPos: [-0.38, -0.42, 0.0],
    staggerOffset: 0.20,
    phase: 3.0,
    rotSpeed: 0.12,
  },
  {
    startPos: [4.5, -2.8, 0.0],
    endPos: [0.38, -0.42, 0.0],
    staggerOffset: 0.30,
    phase: 4.5,
    rotSpeed: -0.11,
  },
]

function buildDNA(): THREE.BufferGeometry {
  const pos: number[] = []
  const nrm: number[] = []
  const segs = 60
  const turns = 4

  for (let strand = 0; strand < 2; strand++) {
    const off = strand * Math.PI
    for (let i = 0; i <= segs; i++) {
      const t = i / segs
      const y = (t - 0.5) * DNA_LEN
      const a = t * Math.PI * 2 * turns + off
      const x = Math.cos(a) * DNA_R
      const z = Math.sin(a) * DNA_R
      const g = new THREE.SphereGeometry(DNA_STRAND_R, 8, 6)
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

  const bpCount = 20
  for (let i = 0; i < bpCount; i++) {
    const t = (i + 0.5) / bpCount
    const y = (t - 0.5) * DNA_LEN
    const a = t * Math.PI * 2 * turns
    const x1 = Math.cos(a) * DNA_R, z1 = Math.sin(a) * DNA_R
    const x2 = Math.cos(a + Math.PI) * DNA_R, z2 = Math.sin(a + Math.PI) * DNA_R
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2
    const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
    const bg = new THREE.CylinderGeometry(DNA_BP_R, DNA_BP_R, len, 6, 1)
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

function Exosome({ cfg, sectionBoundsRef }: { cfg: ExoConfig; sectionBoundsRef: React.MutableRefObject<{ start: number; end: number }[]> }) {
  const grp = useRef<THREE.Group>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const rimRef = useRef<THREE.Mesh>(null)
  const pinks = useRef<THREE.Mesh[]>([])
  const dnas = useRef<THREE.Mesh[]>([])

  const prevScroll = useRef(0)
  const animVal = useRef(0)
  const settled = useRef(false)

  const pinkPos = useMemo(() => [
    [0.08, 0.08, 0.05],
    [-0.07, 0.04, -0.06],
    [0.03, -0.08, 0.04],
    [-0.04, -0.05, -0.03],
  ] as [number, number, number][], [])

  const dnaPos = useMemo(() => [
    { p: [0.08, 0.02, 0.03] as [number, number, number], r: [0.5, 0.8, 0.15] as [number, number, number] },
    { p: [-0.07, -0.02, -0.03] as [number, number, number], r: [-0.4, 1.1, -0.25] as [number, number, number] },
  ], [])

  const dnaGeo = useMemo(() => buildDNA(), [])

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

    const cx = cfg.startPos[0] + (cfg.endPos[0] - cfg.startPos[0]) * e
    const cy = cfg.startPos[1] + (cfg.endPos[1] - cfg.startPos[1]) * e
    const cz = cfg.startPos[2] + (cfg.endPos[2] - cfg.startPos[2]) * e

    const stl = settled.current && e > 0.98
    const bob = stl ? Math.sin(t * 0.3 + cfg.phase) * 0.006 : 0
    const sway = stl ? Math.cos(t * 0.2 + cfg.phase) * 0.004 : 0

    grp.current.position.set(cx + sway, cy + bob, cz)
    grp.current.scale.setScalar(SHELL_R)

    if (stl) grp.current.rotation.y += cfg.rotSpeed * 0.016

    if (shellRef.current) {
      const m = shellRef.current.material as THREE.MeshPhongMaterial
      m.opacity = 0.30
      m.emissiveIntensity = 0.3 + Math.sin(t * 0.4 + cfg.phase) * 0.1
    }
    if (rimRef.current) {
      const m = rimRef.current.material as THREE.MeshPhongMaterial
      m.opacity = 0.50
      m.emissiveIntensity = 0.7 + Math.sin(t * 0.5 + cfg.phase) * 0.15
    }

    pinks.current.forEach((ref, i) => {
      if (!ref) return
      const d = pinkPos[i]
      const b = Math.sin(t * 0.3 + i * 1.7) * 0.004
      ref.position.set(d[0], d[1] + b, d[2])
      ref.rotation.y = t * 0.06 + i * 1.5
      const m = ref.material as THREE.MeshPhongMaterial
      m.opacity = 0.95
      m.emissiveIntensity = 0.4 + Math.sin(t * 0.45 + i) * 0.1
    })

    dnas.current.forEach((ref, i) => {
      if (!ref) return
      const d = dnaPos[i]
      const sp = t * 0.04 * (i % 2 === 0 ? 1 : -1)
      ref.position.set(d.p[0], d.p[1], d.p[2])
      ref.rotation.set(d.r[0] + sp, d.r[1], d.r[2])
      const m = ref.material as THREE.MeshPhongMaterial
      m.opacity = 0.92
    })
  })

  return (
    <group ref={grp} visible={false}>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 40, 30]} />
        <meshPhongMaterial
          color={SHELL_COL}
          shininess={130}
          specular={SHELL_SPEC}
          transparent
          opacity={0.30}
          emissive={SHELL_EMI}
          emissiveIntensity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={rimRef} scale={1.03}>
        <sphereGeometry args={[1, 40, 30]} />
        <meshPhongMaterial
          color={new THREE.Color("#90ffee")}
          shininess={220}
          specular={new THREE.Color("#ffffff")}
          transparent
          opacity={0.50}
          emissive={new THREE.Color("#70ffe0")}
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
        >
          <sphereGeometry args={[PINK_R, 18, 14]} />
          <meshPhongMaterial
            color={PINK_COL}
            shininess={180}
            specular={PINK_SPEC}
            transparent
            opacity={0.95}
            emissive={PINK_EMI}
            emissiveIntensity={0.6}
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
            shininess={90}
            specular={new THREE.Color("#80ddcc")}
            transparent
            opacity={0.92}
            emissive={DNA_EMI}
            emissiveIntensity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function InnerExosomes() {
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

  return (
    <group>
      {CONFIGS.map((c, i) => <Exosome key={i} cfg={c} sectionBoundsRef={sectionBoundsRef} />)}
    </group>
  )
}
