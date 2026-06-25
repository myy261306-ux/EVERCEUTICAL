"use client"

import dynamic from "next/dynamic"

const MembraneScene = dynamic(() => import("@/three/MembraneScene"), {
  ssr: false,
  loading: () => null,
})

export default function BackgroundMembrane() {
  return <MembraneScene />
}
