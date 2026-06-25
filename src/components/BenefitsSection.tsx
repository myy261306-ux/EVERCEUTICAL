"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { benefitDetails, type BenefitDetail } from "@/data/siteData"

function useInView(threshold = 0.15, rootMargin?: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isMobile = window.innerWidth < 768
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: isMobile ? 0.01 : threshold, rootMargin: isMobile ? "400px 0px 0px 0px" : "0px 0px -20px 0px" }
    )
    obs.observe(el)
    const timer = isMobile ? setTimeout(() => setVisible(true), 500) : setTimeout(() => setVisible(true), 2000)
    return () => { obs.disconnect(); clearTimeout(timer) }
  }, [threshold, rootMargin])

  return { ref, visible }
}

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <div
      className="absolute rounded-full bg-[#0ea5e9]/10 pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: "-10%",
        animation: `floatUp ${12 + delay * 2}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

function CategoryLabel({ label, sub, visible }: { label: string; sub: string; visible: boolean }) {
  return (
    <div
      className="flex items-center gap-4 mb-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(${visible ? 0 : -30}px)`,
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-[#38bdf8]/10" />
      <div className="text-center shrink-0">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#64748b] mb-1">{sub}</p>
        <h3 className="text-lg md:text-xl font-bold text-[#0f172a]">{label}</h3>
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#38bdf8]/30 to-[#38bdf8]/10" />
    </div>
  )
}

const BenefitCard = (function () {
  function Card({ benefit, globalIndex, visible, expanded, onToggle }: {
    benefit: BenefitDetail
    globalIndex: number
    visible: boolean
    expanded: boolean
    onToggle: (idx: number) => void
  }) {
    const [hovered, setHovered] = useState(false)

    return (
      <div
        className="group relative cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onToggle(globalIndex) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 40}px) scale(${visible ? 1 : 0.95})`,
          transition: `opacity 0.5s ease ${0.05 + globalIndex * 0.05}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.05 + globalIndex * 0.05}s`,
          zIndex: expanded ? 10 : 1,
        }}
      >
        <div
          className="rounded-2xl transition-all duration-500"
          style={{
            background: hovered
              ? `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${benefit.color}12 100%)`
              : "rgba(249,250,251,0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${expanded ? benefit.color + "30" : hovered ? benefit.color + "25" : "rgba(229,231,235,1)"}`,
            boxShadow: "none",
          }}
        >
          <div className="relative p-6">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-500"
                  style={{
                    backgroundColor: benefit.color + "15",
                    transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
                  }}
                >
                  {benefit.icon}
                </div>
                <div
                  className="absolute inset-[-3px] rounded-xl border transition-all duration-500"
                  style={{
                    borderColor: hovered ? benefit.color + "30" : "transparent",
                    transform: hovered ? "scale(1)" : "scale(0.8)",
                    opacity: hovered ? 1 : 0,
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[15px] font-bold text-[#0f172a] transition-colors duration-300"
                    style={{ color: hovered ? benefit.color : undefined }}>
                    {benefit.title}
                  </h4>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{
                      backgroundColor: expanded ? benefit.color + "15" : "transparent",
                      transform: `rotate(${expanded ? 180 : 0}deg)`,
                    }}
                  >
                    <svg className="w-3.5 h-3.5" style={{ color: expanded ? benefit.color : "rgba(255,255,255,0.4)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <p className="text-[13px] text-[#334155] mt-1.5 leading-relaxed">
                  {benefit.shortDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Expanded content — inside the same card */}
          <div
            style={{
              maxHeight: expanded ? "200px" : "0px",
              opacity: expanded ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease 0.05s",
            }}
          >
            <div className="px-6 pb-6">
              <div className="border-t border-[#e2e8f0] pt-4">
                <p className="text-[13px] text-[#334155] leading-[1.8]">
                  {benefit.fullDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return Card
})()

export default function BenefitsSection() {
  const header = useInView(0.15)
  const focalPoint = useInView(0.2)
  const regenSection = useInView(0.08)
  const aesSection = useInView(0.08)
  const summary = useInView(0.15)

  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set())

  const regenerative = useMemo(() => benefitDetails.filter((b) => b.category === "regenerative"), [])
  const aesthetic = useMemo(() => benefitDetails.filter((b) => b.category === "aesthetic"), [])

  const handleToggle = useCallback((idx: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }, [])

  return (
    <section
      id="benefits"
      className="relative bg-transparent py-10 md:py-14 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#0ea5e9]/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[#0ea5e9]/[0.02] blur-[80px]" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[15, 30, 50, 65, 80].map((x, i) => (
          <FloatingParticle key={i} delay={i * 1.5} x={x} size={4 + (i % 3) * 2} />
        ))}
      </div>

      <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 z-10 relative">
        <div
          ref={header.ref}
          className="text-center mb-8"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: `translateY(${header.visible ? 0 : 40}px)`,
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.15] px-4 py-1.5 rounded-full inline-block">
            Clinical Applications
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-5 mb-4 leading-tight">
            Applications{" "}
            <span className="text-[#38bdf8]">&amp;</span>{" "}
            Benefits
          </h2>
          <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Exosome technology delivers measurable outcomes across regenerative medicine,
            dermatology, and aesthetic applications — backed by science, driven by results.
          </p>
        </div>

        <div
          ref={focalPoint.ref}
          className="flex justify-center mb-8"
          style={{
            opacity: focalPoint.visible ? 1 : 0,
            transform: `scale(${focalPoint.visible ? 1 : 0.5})`,
            transition: "opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s",
          }}
        >
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full border border-[#38bdf8]/15"
              style={{ animation: "spin 25s linear infinite" }}>
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#38bdf8]/50 -top-1 left-1/2 -translate-x-1/2" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#0ea5e9]/50 -bottom-1 left-1/2 -translate-x-1/2" />
            </div>
            <div className="absolute inset-3 rounded-full border border-[#38bdf8]/10"
              style={{ animation: "spin 18s linear infinite reverse" }}>
              <div className="absolute w-2 h-2 rounded-full bg-[#38bdf8]/50 top-1/2 -right-1 -translate-y-1/2" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-[#0284c7]/50 top-1/2 -left-1 -translate-y-1/2" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-[#0ea5e9]/[0.15] flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-lg">💎</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-[#0ea5e9]/[0.06] blur-xl" />
          </div>
        </div>

        <div ref={regenSection.ref}>
          <CategoryLabel label="Regenerative Benefits" sub="Cellular Repair & Recovery" visible={regenSection.visible} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-start">
            {regenerative.map((b, i) => (
              <BenefitCard
                key={`regen-${i}`}
                benefit={b}
                globalIndex={i}
                visible={regenSection.visible}
                expanded={expandedSet.has(i)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>

        <div ref={aesSection.ref}>
          <CategoryLabel label="Aesthetic Benefits" sub="Appearance & Vitality" visible={aesSection.visible} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-start">
            {aesthetic.map((b, i) => {
              const globalIdx = regenerative.length + i
              return (
                <BenefitCard
                  key={`aes-${i}`}
                  benefit={b}
                  globalIndex={globalIdx}
                  visible={aesSection.visible}
                  expanded={expandedSet.has(globalIdx)}
                  onToggle={handleToggle}
                />
              )
            })}
          </div>
        </div>

        <div
          ref={summary.ref}
          className="text-center max-w-2xl mx-auto"
          style={{
            opacity: summary.visible ? 1 : 0,
            transform: `translateY(${summary.visible ? 0 : 30}px)`,
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="glass-card rounded-2xl p-8 bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-[#334155] text-sm leading-relaxed mb-6">
              Every exosome treatment is backed by rigorous research, manufactured under strict quality protocols,
              and designed to deliver consistent, measurable regenerative outcomes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-center">
              {[
                { val: "10B+", label: "Exosomes Per Vial" },
                { val: "99.9%", label: "Purity Standard" },
                { val: "GMP", label: "Manufacturing" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-xl font-bold text-[#0f172a]">{s.val}</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
