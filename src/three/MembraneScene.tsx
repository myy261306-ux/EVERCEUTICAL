"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { useState, useEffect, Component, type ReactNode } from "react"
import * as THREE from "three"
import BilayerMembrane from "./ExosomeParticles"

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() { return }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function getCameraConfig() {
  if (typeof window === "undefined") return { fov: 36, posZ: 7.0, posY: 0.5, groupScale: 1.0, dpr: [1, 1.5] as [number, number] }
  const w = window.innerWidth
  if (w < 400) return { fov: 62, posZ: 4.5, posY: 0.15, groupScale: 0.48, dpr: [1, 1] as [number, number] }
  if (w < 640) return { fov: 56, posZ: 5.0, posY: 0.2, groupScale: 0.55, dpr: [1, 1] as [number, number] }
  if (w < 768) return { fov: 50, posZ: 5.5, posY: 0.3, groupScale: 0.65, dpr: [1, 1.2] as [number, number] }
  if (w < 1024) return { fov: 42, posZ: 6.2, posY: 0.4, groupScale: 0.82, dpr: [1, 1.5] as [number, number] }
  return { fov: 36, posZ: 7.0, posY: 0.5, groupScale: 1.0, dpr: [1, 1.5] as [number, number] }
}

function ResponsiveCamera() {
  const { camera } = useThree()

  useEffect(() => {
    const cfg = getCameraConfig()
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = cfg.fov
    cam.position.set(0, cfg.posY, cfg.posZ)
    cam.updateProjectionMatrix()

    function onResize() {
      const c = getCameraConfig()
      const p = camera as THREE.PerspectiveCamera
      p.fov = c.fov
      p.position.set(0, c.posY, c.posZ)
      p.updateProjectionMatrix()
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [camera])

  return null
}

function Scene() {
  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={0.45} color="#e0f0f0" />
      <directionalLight position={[5, 8, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 5, 3]} intensity={1.0} color="#f0e8d8" />
      <pointLight position={[0, 3, 4]} intensity={1.0} color="#80e8d0" distance={18} decay={2} />
      <pointLight position={[-6, 2, 2]} intensity={0.6} color="#60d0b8" distance={14} decay={2} />
      <pointLight position={[6, 2, 2]} intensity={0.6} color="#60d0b8" distance={14} decay={2} />
      <pointLight position={[0, 0, 3]} intensity={2.0} color="#40c8a8" distance={12} decay={2} />
      <pointLight position={[0, 0, -2]} intensity={0.8} color="#30b898" distance={10} decay={2} />

      <BilayerMembrane />
    </>
  )
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch {
    return false
  }
}

export default function MembraneScene() {
  const [webglOk, setWebglOk] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [camCfg, setCamCfg] = useState(getCameraConfig)

  useEffect(() => {
    setMounted(true)
    if (!checkWebGLSupport()) setWebglOk(false)

    function onResize() {
      setCamCfg(getCameraConfig())
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (!mounted || !webglOk) return null

  return (
    <WebGLErrorBoundary>
      <Canvas
        camera={{ position: [0, camCfg.posY, camCfg.posZ], fov: camCfg.fov, near: 0.1, far: 50 }}
        dpr={camCfg.dpr}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100dvh",
          zIndex: 0,
          pointerEvents: "none",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.3
        }}
      >
        <Scene />
      </Canvas>
    </WebGLErrorBoundary>
  )
}
