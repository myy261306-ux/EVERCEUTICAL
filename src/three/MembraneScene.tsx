"use client"

import { Canvas } from "@react-three/fiber"
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

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[5, 8, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-4, 5, 3]} intensity={1.2} color="#f0e8d8" />
      <pointLight position={[0, 3, 4]} intensity={0.8} color="#ffffff" distance={18} decay={2} />
      <pointLight position={[-6, 2, 2]} intensity={0.5} color="#e8e0d0" distance={14} decay={2} />
      <pointLight position={[6, 2, 2]} intensity={0.5} color="#e8e0d0" distance={14} decay={2} />

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

  useEffect(() => {
    setMounted(true)
    if (!checkWebGLSupport()) setWebglOk(false)
  }, [])

  if (!mounted || !webglOk) return null

  return (
    <WebGLErrorBoundary>
      <Canvas
        camera={{ position: [0, 0.5, 7.0], fov: 36, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
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
          height: "100vh",
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
