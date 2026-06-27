"use client"

import { EffectComposer, Bloom } from "@react-three/postprocessing"

export default function PostProcessingMobile() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  )
}
