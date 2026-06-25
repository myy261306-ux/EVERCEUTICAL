"use client"

import { useState, useEffect, useRef } from "react"
import { useLoading } from "./LoadingContext"

export default function LoadingScreen() {
  const { allReady } = useLoading()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const progressRef = useRef(0)
  const [progressDisplay, setProgressDisplay] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    startTimeRef.current = Date.now()
  }, [])

  // Smooth progress using RAF (not setInterval) for butter-smooth animation
  useEffect(() => {
    if (!mounted) return

    function tick() {
      const elapsed = Date.now() - startTimeRef.current
      let target: number

      if (allReady) {
        target = 100
      } else {
        // Smooth ease-out curve: reaches ~85% in 3s, then crawls to 95%
        const t = Math.min(elapsed / 3000, 1)
        target = 100 * (1 - Math.pow(1 - t, 3))
        target = Math.min(target, 95)
      }

      // Lerp toward target for ultra-smooth movement
      progressRef.current += (target - progressRef.current) * 0.08
      setProgressDisplay(Math.round(progressRef.current))

      if (progressRef.current < 99.5) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mounted, allReady])

  // When allReady, complete to 100 and fade
  useEffect(() => {
    if (allReady && mounted) {
      progressRef.current = 100
      setProgressDisplay(100)
      const fadeTimer = setTimeout(() => setFading(true), 250)
      const hideTimer = setTimeout(() => setVisible(false), 650)
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [allReady, mounted])

  // Force hide after 4 seconds max
  useEffect(() => {
    const forceHide = setTimeout(() => {
      progressRef.current = 100
      setProgressDisplay(100)
      setFading(true)
      setTimeout(() => setVisible(false), 650)
    }, 4000)
    return () => clearTimeout(forceHide)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "#ffffff",
        transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1)",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo with animated ring */}
        <div className="relative w-16 h-16 md:w-20 md:h-20">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progressDisplay) / 100}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <img
            src="/images/logo.png?v=6"
            alt="EverCeutical"
            className="absolute inset-0 w-full h-full object-contain p-2.5 md:p-3"
          />
        </div>

        <h1 className="text-base md:text-lg font-bold text-[#0f172a] tracking-tight">
          Ever<span className="text-[#0ea5e9]">Ceutical</span>
        </h1>

        <div className="w-32 md:w-40">
          <div className="h-[2px] bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressDisplay}%`,
                background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
