"use client"

import { useMemo, useRef, useEffect } from "react"
import * as THREE from "three"
import { SimplexNoise } from "./SimplexNoise"

const CURVE_SEGS = 220
const MEMBRANE_WIDTH = 2.4
const MEMBRANE_THICKNESS = 0.28
const COLS = 160
const ROWS = 16
const HEAD_RADIUS = 0.028
const TAIL_RADIUS = 0.014
const TAIL_GAP = 0.18

const COLORS = {
  headTop: new THREE.Color("#d4a84c"),
  headTopSpec: new THREE.Color("#f0d888"),
  headBottom: new THREE.Color("#b89030"),
  headBottomSpec: new THREE.Color("#d0b050"),
  tails: new THREE.Color("#5a6a40"),
  tailsDark: new THREE.Color("#4a5a32"),
  coreRibbon: new THREE.Color("#4a5a38"),
  proteinCap: new THREE.Color("#d47090"),
  proteinCapSpec: new THREE.Color("#f0b0c8"),
  proteinStem: new THREE.Color("#4a7a58"),
  channelBody: new THREE.Color("#7a8a48"),
  lipHeadTop: new THREE.Color("#c8a040"),
  lipHeadBot: new THREE.Color("#a08028"),
  lipTail: new THREE.Color("#5a6840"),
}

function buildCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10.0, 2.4, -2.2),
    new THREE.Vector3(-8.0, 1.5, -1.5),
    new THREE.Vector3(-6.0, 0.7, -0.8),
    new THREE.Vector3(-4.0, 0.2, -0.1),
    new THREE.Vector3(-2.0, 0.0, 0.3),
    new THREE.Vector3(0.0, -0.05, 0.25),
    new THREE.Vector3(2.0, 0.08, -0.05),
    new THREE.Vector3(4.0, 0.35, -0.5),
    new THREE.Vector3(6.0, 0.85, -1.0),
    new THREE.Vector3(8.0, 1.6, -1.6),
    new THREE.Vector3(10.0, 2.6, -2.3),
  ], false, "catmullrom", 0.5)
}

function getCurveFrame(curve: THREE.CatmullRomCurve3, t: number) {
  const pt = curve.getPointAt(t)
  const tan = curve.getTangentAt(t).normalize()
  const up = new THREE.Vector3(0, 1, 0)
  const binormal = new THREE.Vector3().crossVectors(tan, up).normalize()
  if (binormal.length() < 0.001) binormal.set(1, 0, 0)
  const normal = new THREE.Vector3().crossVectors(binormal, tan).normalize()
  return { point: pt, tangent: tan, binormal, normal }
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
    const nx = cos
    const nz = sin

    for (let i = 0; i <= heightSegs; i++) {
      const y = -halfH + (i / heightSegs) * height
      positions.push(cx + nx * radius, cy + y, cz + nz * radius)
      normals.push(nx, 0, nz)
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
    for (const idx of g.indices) {
      allIdx.push(idx + vertexOffset)
    }
    vertexOffset += g.positions.length / 3
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(allNorm, 3))
  geo.setIndex(allIdx)
  geo.computeVertexNormals()
  return geo
}

function buildThickRibbon(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  width: number,
  thickness: number,
  noise: SimplexNoise
): THREE.BufferGeometry {
  const halfW = width / 2
  const halfH = thickness / 2
  const vertsPerStep = 8
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const { point, binormal, normal } = getCurveFrame(curve, t)
    const n = noise.fbm(point.x * 0.12, point.y * 0.12, 0, 2) * 0.01

    const bx = binormal.x
    const bz = binormal.z
    const nx = normal.x
    const nz = normal.z

    const cx = point.x
    const cy = point.y + n
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
      [nx, 0.3, nz],
      [-nx, 0.3, -nz],
      [-nx, -0.3, -nz],
      [nx, -0.3, nz],
      [0, 1, 0],
      [0, -1, 0],
      [bx, 0, bz],
      [-bx, 0, -bz],
    ]

    for (let j = 0; j < vertsPerStep; j++) {
      positions.push(v[j][0], v[j][1], v[j][2])
      normals.push(faceNormals[j][0], faceNormals[j][1], faceNormals[j][2])
      uvs.push(t, j < 4 ? 0.5 : (j < 6 ? 1 : 0))
    }

    if (i < segments) {
      const o = i * vertsPerStep
      const no = (i + 1) * vertsPerStep
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
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

interface ProteinData {
  position: THREE.Vector3
  tangent: THREE.Vector3
  binormal: THREE.Vector3
  isChannel: boolean
  scale: number
}

function buildProteinGeometry(isChannel: boolean): THREE.BufferGeometry {
  const parts: { positions: number[]; normals: number[]; indices: number[] }[] = []

  const stem = buildCylinderVerts(0, 0.12, 0, 0.018, 0.22, 6, 1)
  parts.push(stem)

  const capGeo = buildSphereVerts(0, 0.3, 0, 0.09, 10, 8)
  parts.push(capGeo)

  const bumpGeo1 = buildSphereVerts(0.04, 0.36, 0.02, 0.04, 6, 5)
  parts.push(bumpGeo1)
  const bumpGeo2 = buildSphereVerts(-0.03, 0.34, -0.03, 0.035, 6, 5)
  parts.push(bumpGeo2)
  const bumpGeo3 = buildSphereVerts(0.01, 0.38, -0.02, 0.03, 6, 5)
  parts.push(bumpGeo3)

  if (isChannel) {
    const channel = buildCylinderVerts(0, 0.0, 0, 0.03, 0.14, 8, 1)
    parts.push(channel)
  }

  return mergeBufferGeos(parts)
}

export default function BilayerMembrane() {
  const groupRef = useRef<THREE.Group>(null)
  const topHeadsRef = useRef<THREE.InstancedMesh>(null)
  const botHeadsRef = useRef<THREE.InstancedMesh>(null)
  const tailsRef = useRef<THREE.InstancedMesh>(null)

  const noise = useMemo(() => new SimplexNoise(42), [])

  const {
    coreGeo,
    topHeadsData, botHeadsData, tailsData,
    proteinData
  } = useMemo(() => {
    const curve = buildCurve()
    const coreGeo = buildThickRibbon(curve, CURVE_SEGS, MEMBRANE_WIDTH, MEMBRANE_THICKNESS, noise)

    const topPositions: THREE.Vector3[] = []
    const botPositions: THREE.Vector3[] = []
    const tailPositions: THREE.Vector3[] = []

    for (let col = 0; col < COLS; col++) {
      const t = (col + 0.5) / COLS
      const { point, binormal } = getCurveFrame(curve, t)
      const n = noise.fbm(point.x * 0.12, point.y * 0.12, 0, 2) * 0.01

      for (let row = 0; row < ROWS; row++) {
        const rowT = (row / (ROWS - 1)) - 0.5
        const offX = binormal.x * rowT * MEMBRANE_WIDTH
        const offZ = binormal.z * rowT * MEMBRANE_WIDTH

        const px = point.x + offX
        const py = point.y + n
        const pz = point.z + offZ

        const jitterX = noise.noise3D(px * 10, 0, pz * 10) * 0.004
        const jitterZ = noise.noise3D(px * 10 + 300, 0, pz * 10 + 300) * 0.004

        const jx = px + jitterX
        const jz = pz + jitterZ

        const headTopY = py + MEMBRANE_THICKNESS * 0.38
        const headBotY = py - MEMBRANE_THICKNESS * 0.38
        const tailMidY = py

        topPositions.push(new THREE.Vector3(jx, headTopY, jz))
        botPositions.push(new THREE.Vector3(jx, headBotY, jz))
        tailPositions.push(new THREE.Vector3(jx, tailMidY, jz))
      }
    }

    const proteins: ProteinData[] = []
    const proteinTs = [0.08, 0.22, 0.38, 0.52, 0.68, 0.82, 0.94]
    proteinTs.forEach((pt, i) => {
      const frame = getCurveFrame(curve, pt)
      const n = noise.fbm(frame.point.x * 0.12, frame.point.y * 0.12, 0, 2) * 0.01
      const latOff = ((i % 3) - 1) * MEMBRANE_WIDTH * 0.22
      proteins.push({
        position: new THREE.Vector3(
          frame.point.x + frame.binormal.x * latOff,
          frame.point.y + n + MEMBRANE_THICKNESS * 0.38 + 0.02,
          frame.point.z + frame.binormal.z * latOff
        ),
        tangent: frame.tangent.clone(),
        binormal: frame.binormal.clone(),
        isChannel: i % 4 === 2,
        scale: 0.9 + (i % 3) * 0.15,
      })
    })

    return {
      coreGeo,
      topHeadsData: topPositions, botHeadsData: botPositions,
      tailsData: tailPositions,
      proteinData: proteins,
    }
  }, [noise])

  const proteinGeo = useMemo(() => {
    return proteinData.map(p => buildProteinGeometry(p.isChannel))
  }, [proteinData])

  useEffect(() => {
    if (!topHeadsRef.current) return
    const dummy = new THREE.Object3D()
    topHeadsData.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.updateMatrix()
      topHeadsRef.current!.setMatrixAt(i, dummy.matrix)
    })
    topHeadsRef.current.instanceMatrix.needsUpdate = true
  }, [topHeadsData])

  useEffect(() => {
    if (!botHeadsRef.current) return
    const dummy = new THREE.Object3D()
    botHeadsData.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.updateMatrix()
      botHeadsRef.current!.setMatrixAt(i, dummy.matrix)
    })
    botHeadsRef.current.instanceMatrix.needsUpdate = true
  }, [botHeadsData])

  useEffect(() => {
    if (!tailsRef.current) return
    const dummy = new THREE.Object3D()
    tailsData.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.updateMatrix()
      tailsRef.current!.setMatrixAt(i, dummy.matrix)
    })
    tailsRef.current.instanceMatrix.needsUpdate = true
  }, [tailsData])

  return (
    <group ref={groupRef} position={[0, 0.15, -2.5]}>
      <mesh geometry={coreGeo} frustumCulled={false}>
        <meshPhongMaterial
          color={COLORS.coreRibbon}
          shininess={15}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh ref={topHeadsRef} args={[undefined, undefined, topHeadsData.length]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS, 7, 5]} />
        <meshPhongMaterial
          color={COLORS.headTop}
          shininess={50}
          specular={COLORS.headTopSpec}
        />
      </instancedMesh>

      <instancedMesh ref={botHeadsRef} args={[undefined, undefined, botHeadsData.length]} frustumCulled={false}>
        <sphereGeometry args={[HEAD_RADIUS * 0.9, 6, 4]} />
        <meshPhongMaterial
          color={COLORS.headBottom}
          shininess={35}
          specular={COLORS.headBottomSpec}
        />
      </instancedMesh>

      <instancedMesh ref={tailsRef} args={[undefined, undefined, tailsData.length]} frustumCulled={false}>
        <cylinderGeometry args={[TAIL_RADIUS, TAIL_RADIUS, TAIL_GAP, 5, 1]} />
        <meshPhongMaterial
          color={COLORS.tails}
          shininess={10}
        />
      </instancedMesh>

      {proteinData.map((p, i) => (
        <group
          key={i}
          position={[p.position.x, p.position.y, p.position.z]}
          scale={p.scale}
        >
          <mesh geometry={proteinGeo[i]} frustumCulled={false}>
            <meshPhongMaterial
              color={COLORS.proteinCap}
              shininess={40}
              specular={COLORS.proteinCapSpec}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
