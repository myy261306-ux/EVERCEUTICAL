"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Link from "next/link"
import { products } from "@/data/siteData"

const featuredProducts = products.filter((p) => p.featured).slice(0, 4)

const CARD_W_DESKTOP = 240
const CARD_H_DESKTOP = 320
const CARD_W_MOBILE = 200
const CARD_H_MOBILE = 280
const RADIUS_DESKTOP = 420
const RADIUS_MOBILE = 160
const AUTO_DEG = 90
const AUTO_INTERVAL = 5000
const PAUSE_MS = 10000
const DRAG_SENSITIVITY = 0.3

function degToRad(d: number) { return (d * Math.PI) / 180 }

function getOrbitPos(angleDeg: number, radius: number) {
  const rad = degToRad(angleDeg)
  const x = Math.sin(rad) * radius
  const z = Math.cos(rad) * radius
  const rotY = -angleDeg
  const normalizedZ = (z + radius) / (2 * radius)
  const scale = 0.55 + normalizedZ * 0.35
  const opacity = 0.6 + normalizedZ * 0.4
  return { x, z, rotY, scale, opacity }
}

export default function FeaturedProducts() {
  const [mounted, setMounted] = useState(false)
  const [orbitAngle, setOrbitAngle] = useState(0)
  const [bp, setBp] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const pausedRef = useRef(false)
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragRef = useRef({ active: false, startX: 0, currentAngle: 0, lastAngle: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const touchRef = useRef({ startX: 0, startTime: 0 })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop")
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const isMobile = bp === "mobile"
  const radius = isMobile ? RADIUS_MOBILE : bp === "tablet" ? 320 : RADIUS_DESKTOP
  const cardW = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP
  const cardH = isMobile ? CARD_H_MOBILE : CARD_H_DESKTOP

  const pauseAuto = useCallback(() => {
    pausedRef.current = true
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => { pausedRef.current = false }, PAUSE_MS)
  }, [])

  useEffect(() => {
    autoRef.current = setInterval(() => {
      if (!pausedRef.current) setOrbitAngle((prev) => prev + AUTO_DEG)
    }, AUTO_INTERVAL)
    return () => {
      if (autoRef.current) clearInterval(autoRef.current)
      if (resumeRef.current) clearTimeout(resumeRef.current)
    }
  }, [])

  const snapToNearest = useCallback(() => {
    setOrbitAngle((prev) => Math.round(prev / AUTO_DEG) * AUTO_DEG)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return
    pausedRef.current = true
    if (resumeRef.current) clearTimeout(resumeRef.current)
    dragRef.current = { active: true, startX: e.clientX, currentAngle: orbitAngle, lastAngle: orbitAngle }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [orbitAngle])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    setOrbitAngle(dragRef.current.currentAngle + dx * DRAG_SENSITIVITY)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    snapToNearest()
    pauseAuto()
  }, [snapToNearest, pauseAuto])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    pausedRef.current = true
    if (resumeRef.current) clearTimeout(resumeRef.current)
    touchRef.current = { startX: e.touches[0].clientX, startTime: Date.now() }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX
    const dt = Date.now() - touchRef.current.startTime
    const velocity = Math.abs(dx) / dt
    if (Math.abs(dx) > 30 || velocity > 0.2) {
      setOrbitAngle((prev) => prev + (dx < 0 ? AUTO_DEG : -AUTO_DEG))
    }
    pauseAuto()
  }, [pauseAuto])

  const cards = useMemo(() => {
    return featuredProducts.map((product, idx) => {
      const cardAngle = idx * 90
      const relativeAngle = cardAngle - (orbitAngle % 360)
      const normalizedAngle = ((relativeAngle % 360) + 360) % 360
      const pos = getOrbitPos(normalizedAngle, radius)
      const isFront = normalizedAngle < 30 || normalizedAngle > 330
      return { product, idx, pos, isFront, normalizedAngle }
    }).sort((a, b) => a.pos.z - b.pos.z)
  }, [orbitAngle, radius])

  const transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, z-index 0s"

  if (!mounted) return null

  return (
    <section
      id="products"
      className="relative flex flex-col items-center justify-center overflow-hidden pt-4 pb-8 md:pt-6 md:pb-12 z-10"
    >
      <div className="text-center mb-5 md:mb-6 px-5 sm:px-6 z-20 relative">
        <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">
          Our Best Sellers
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mt-4 mb-2 leading-tight">
          Products
        </h2>
        <p className="text-[#64748b] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          High-purity exosome formulations trusted by professionals worldwide.
        </p>
      </div>

      <div
        className="relative w-full max-w-[1400px] mx-auto"
        style={{
          WebkitPerspective: isMobile ? 1200 : 2500,
          perspective: isMobile ? 1200 : 2500,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          ref={containerRef}
          className="relative mx-auto select-none"
          style={{
            height: `${cardH + (isMobile ? 50 : 40)}px`,
            width: "100%",
            transformStyle: "preserve-3d",
            cursor: dragRef.current.active ? "grabbing" : "grab",
            touchAction: "pan-y",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {cards.map(({ product, idx, pos, isFront }) => (
            <div
              key={idx}
              className="absolute"
              style={{
                width: `${cardW}px`,
                height: `${cardH}px`,
                left: "50%",
                top: "50%",
                marginLeft: `${-cardW / 2}px`,
                marginTop: `${-cardH / 2}px`,
                transformStyle: "preserve-3d",
                transform: `translateX(${pos.x.toFixed(3)}px) translateZ(${pos.z.toFixed(3)}px) scale(${pos.scale.toFixed(4)}) rotateY(${pos.rotY.toFixed(3)}deg)`,
                opacity: Number(pos.opacity.toFixed(4)),
                zIndex: Math.round(pos.z + 500),
                transition: dragRef.current.active ? "none" : transition,
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <div
                className="glass-card relative w-full h-full rounded-2xl overflow-hidden"
                style={{
                  boxShadow: "none",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    border: isFront ? `2px solid ${product.accentColor}25` : "2px solid transparent",
                    transition: dragRef.current.active ? "none" : "border 0.6s ease",
                  }}
                />
                <div className="relative w-full h-[35%] overflow-hidden bg-[#f8fafc]">
                  <img src={product.img} alt={product.fullName} className="w-full h-full object-cover" draggable={false} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f1f5f9] via-[#f1f5f9]/20 to-transparent" />
                </div>
                <div className={`relative ${isMobile ? 'px-3 pb-3 pt-2' : 'px-4 pb-4 pt-2'} flex flex-col h-[62%]`}>
                  <span
                    className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold tracking-wider uppercase mb-0.5`}
                    style={{ color: product.accentColor }}
                  >
                    {product.category}
                  </span>
                  <h4
                    className={`${isMobile ? 'text-[11px]' : 'text-[13px]'} font-bold leading-snug`}
                    style={{
                       color: isFront ? "#111827" : "#64748b",
                      transition: dragRef.current.active ? "none" : "color 0.6s ease",
                    }}
                  >
                    {product.fullName}
                  </h4>
                  <p className={`${isMobile ? 'text-[9px] mt-0.5 line-clamp-2' : 'text-[11px] mt-1 line-clamp-2'} text-[#64748b] leading-relaxed`}>{product.desc}</p>
                  <div className={`${isMobile ? 'mt-1.5 space-y-0.5' : 'mt-2 space-y-1'}`}>
                    {product.benefits.slice(0, isMobile ? 2 : 3).map((b, j) => (
                      <div key={j} className="flex items-start gap-1" style={{ opacity: isFront ? 1 : 0.5 }}>
                        <svg className={`${isMobile ? 'w-2 h-2 mt-[1px]' : 'w-2.5 h-2.5 mt-[2px]'} shrink-0`} style={{ color: product.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`${isMobile ? 'text-[8px] line-clamp-1' : 'text-[10px] line-clamp-1'} text-[#64748b] leading-snug`}>{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-auto ${isMobile ? 'pt-1.5' : 'pt-2'}`}>
                    <span className={`${isMobile ? 'text-[8px] px-2 py-[2px]' : 'text-[10px] px-2 py-[3px]'} rounded-full font-medium`} style={{ background: product.accentColor + "12", color: product.accentColor }}>
                      {product.peptides.length} Peptides
                    </span>
                    <span className={`${isMobile ? 'text-[8px] px-2 py-[2px]' : 'text-[10px] px-2 py-[3px]'} rounded-full bg-[#f1f5f9] text-[#64748b] font-medium`}>
                      {product.size}
                    </span>
                  </div>
                  {isFront && (
                    <Link
                      href={product.href}
                      onClick={(e) => e.stopPropagation()}
                      className={`${isMobile ? 'mt-2 py-2 text-[10px]' : 'mt-2.5 py-2 text-[11px]'} flex items-center justify-center gap-1.5 w-full rounded-lg text-white font-semibold`}
                      style={{
                        background: `linear-gradient(135deg, ${product.accentColor}, ${product.accentColor}bb)`,
                        boxShadow: "none",
                      }}
                    >
                      View More
                      <svg className={isMobile ? 'w-2 h-2' : 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isMobile && (
        <div className="mt-3 text-center">
          <p className="text-[9px] text-[#64748b] tracking-widest uppercase flex items-center justify-center gap-1.5">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Swipe to explore
          </p>
        </div>
      )}

      <div className="mt-5 text-center z-10">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
        >
          View All Products
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
