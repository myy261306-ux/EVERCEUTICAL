"use client"

import { useState, useEffect, useRef } from "react"
import { exosomeTechnology } from "@/data/siteData"

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

export default function WhatAreExosomesSection() {
  const hero = useInView(0.2)
  const cards = useInView(0.1)
  const stats = useInView(0.2)
  const cta = useInView(0.2)

  const { features, stats: statItems } = exosomeTechnology

  return (
    <section
      id="learn"
      className="relative bg-transparent pt-10 pb-8 md:pt-14 md:pb-7 overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.04] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#0369a1]/[0.03] blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
        {/* ── HERO PANEL ── */}
        <div
          ref={hero.ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-6"
        >
          {/* Left: Premium glass content card */}
          <div
            className="relative"
            style={{
              opacity: hero.visible ? 1 : 0,
              transform: hero.visible ? "translateX(0) scale(1)" : "translateX(-60px) scale(0.95)",
              filter: hero.visible ? "blur(0px)" : "blur(6px)",
              transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Glass card */}
            <div className="relative glass-surface-strong rounded-2xl p-6 sm:p-8 md:p-10 overflow-hidden">
              {/* Accent line */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

              <span className="inline-block text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.1] px-4 py-1.5 rounded-full mb-3 border border-[#0ea5e9]/20">
                {exosomeTechnology.hero.label}
              </span>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-3 leading-tight">
                {exosomeTechnology.hero.title}
              </h2>

              <p className="text-sm text-[#38bdf8] font-medium mb-5 tracking-wide">
                {exosomeTechnology.hero.subtitle}
              </p>

              <p className="text-[#334155] text-sm md:text-[15px] leading-relaxed mb-5">
                {exosomeTechnology.hero.description}
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3">
                {statItems.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-[#f8fafc] backdrop-blur-sm rounded-full px-4 py-2 border border-[#e2e8f0]"
                    style={{
                      opacity: hero.visible ? 1 : 0,
                      transform: hero.visible ? "translateY(0) scale(1)" : "translateY(25px) scale(0.8)",
                      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.1}s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.1}s`,
                    }}
                  >
                    <span className="text-[13px] font-bold text-[#0f172a]">{s.value}</span>
                    <span className="text-[11px] text-[#64748b]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Exosome Structure Diagram */}
          <div
            className="hidden lg:flex items-center justify-center"
            style={{
              opacity: hero.visible ? 1 : 0,
              transform: hero.visible ? "translateX(0) scale(1)" : "translateX(60px) scale(0.95)",
              filter: hero.visible ? "blur(0px)" : "blur(6px)",
              transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s, filter 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            <div className="relative w-full max-w-[460px] aspect-square">
              {/* Dark backdrop circle to separate from bg */}
              <div className="absolute inset-[8%] rounded-full bg-[#0f172a]/60 blur-[2px]" />
              {/* Glow backdrop */}
              <div className="absolute inset-[12%] rounded-full bg-[#38bdf8]/[0.08] blur-[40px]" />

              <svg viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full" suppressHydrationWarning>
                <defs>
                  <filter id="exoGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="bigGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="18" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>

                  {/* Bright membrane gradient */}
                  <radialGradient id="membraneGrad" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#a0e8ff" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#40c0f0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1890c0" stopOpacity="0.12" />
                  </radialGradient>

                  {/* Bright inner core */}
                  <radialGradient id="coreGrad" cx="42%" cy="38%">
                    <stop offset="0%" stopColor="#b8f0ff" stopOpacity="0.6" />
                    <stop offset="35%" stopColor="#50c8f0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1890c0" stopOpacity="0.15" />
                  </radialGradient>

                  {/* Bright lipid bilayer */}
                  <linearGradient id="lipidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#80e0ff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#40b8e8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#80e0ff" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Bright protein */}
                  <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#c0f4ff" />
                    <stop offset="100%" stopColor="#40b8e8" />
                  </linearGradient>

                  {/* Bright RNA */}
                  <linearGradient id="rnaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffb860" />
                    <stop offset="50%" stopColor="#ff8040" />
                    <stop offset="100%" stopColor="#ffb860" />
                  </linearGradient>

                  {/* Label lines */}
                  <linearGradient id="labelLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60d8ff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#60d8ff" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="labelLineL" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#60d8ff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#60d8ff" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* ═══ AMBIENT PARTICLES (orbiting) ═══ */}
                <g opacity="0.5">
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const r = 208
                    const r2 = (v: number) => Math.round(v * 100) / 100
                    const cx = r2(230 + Math.cos(rad) * r)
                    const cy = r2(230 + Math.sin(rad) * r)
                    return (
                      <circle key={i} cx={cx} cy={cy} r={2.5} fill="#70e0ff" opacity={0.6} suppressHydrationWarning>
                        <animateTransform attributeName="transform" type="rotate" from={`${deg} 230 230`} to={`${deg + 360} 230 230`} dur={`${25 + i * 4}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2.5 + i * 0.5}s`} repeatCount="indefinite" />
                      </circle>
                    )
                  })}
                </g>

                {/* ═══ OUTER GLOW RING ═══ */}
                <circle cx="230" cy="230" r="178" fill="none" stroke="#50d0ff" strokeWidth="1.5" opacity="0.12" filter="url(#bigGlow)">
                  <animate attributeName="r" values="176;180;176" dur="4s" repeatCount="indefinite" />
                </circle>

                {/* ═══ OUTER LIPID BILAYER MEMBRANE ═══ */}
                {/* Membrane ring — bright and visible */}
                <circle cx="230" cy="230" r="170" fill="none" stroke="url(#lipidGrad)" strokeWidth="16" opacity="0.7" filter="url(#softGlow)">
                  <animate attributeName="opacity" values="0.6;0.8;0.6" dur="5s" repeatCount="indefinite" />
                </circle>

                {/* Phospholipid heads outer — bright cyan dots */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const angle = (i / 48) * Math.PI * 2
                  const x = Math.round((230 + Math.cos(angle) * 170) * 100) / 100
                  const y = Math.round((230 + Math.sin(angle) * 170) * 100) / 100
                  return (
                    <circle key={`oh-${i}`} cx={x} cy={y} r={3.5} fill="#90e8ff" opacity={0.55 + (i % 3) * 0.12} suppressHydrationWarning>
                      <animate attributeName="opacity" values={`${0.4 + (i % 3) * 0.1};${0.7 + (i % 3) * 0.1};${0.4 + (i % 3) * 0.1}`} dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
                    </circle>
                  )
                })}

                {/* Phospholipid heads inner */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const angle = (i / 48) * Math.PI * 2 + 0.065
                  const x = Math.round((230 + Math.cos(angle) * 156) * 100) / 100
                  const y = Math.round((230 + Math.sin(angle) * 156) * 100) / 100
                  return (
                    <circle key={`ih-${i}`} cx={x} cy={y} r={3} fill="#60c8f0" opacity={0.45 + (i % 3) * 0.1} suppressHydrationWarning />
                  )
                })}

                {/* Membrane fill (translucent bright) */}
                <circle cx="230" cy="230" r="163" fill="url(#membraneGrad)" />

                {/* Inner content area */}
                <circle cx="230" cy="230" r="148" fill="url(#coreGrad)" />

                {/* ═══ SURFACE PROTEINS / RECEPTORS ═══ */}
                {[30, 75, 120, 195, 250, 310, 355].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180
                  const r2 = (v: number) => Math.round(v * 100) / 100
                  const bx = r2(230 + Math.cos(rad) * 162)
                  const by = r2(230 + Math.sin(rad) * 162)
                  const tx = r2(230 + Math.cos(rad) * 188)
                  const ty = r2(230 + Math.sin(rad) * 188)
                  const perpX = r2(Math.cos(rad + Math.PI / 2) * 9)
                  const perpY = r2(Math.sin(rad + Math.PI / 2) * 9)
                  return (
                    <g key={`receptor-${i}`} opacity={0.85}>
                      <line x1={bx} y1={by} x2={tx} y2={ty} stroke="url(#proteinGrad)" strokeWidth="2.8" strokeLinecap="round" />
                      <line x1={tx} y1={ty} x2={r2(tx + perpX)} y2={r2(ty + perpY)} stroke="#b0f0ff" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1={tx} y1={ty} x2={r2(tx - perpX)} y2={r2(ty - perpY)} stroke="#b0f0ff" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx={r2(tx + perpX)} cy={r2(ty + perpY)} r={2.8} fill="#d0f8ff">
                        <animate attributeName="r" values="2.2;3.5;2.2" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                      <circle cx={r2(tx - perpX)} cy={r2(ty - perpY)} r={2.8} fill="#d0f8ff">
                        <animate attributeName="r" values="2.2;3.5;2.2" dur={`${2.8 + i * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                    </g>
                  )
                })}

                {/* Tetraspanin markers */}
                {[50, 100, 145, 210, 270, 330, 380].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180
                  const r2 = (v: number) => Math.round(v * 100) / 100
                  const x = r2(230 + Math.cos(rad) * 167)
                  const y = r2(230 + Math.sin(rad) * 167)
                  return (
                    <rect key={`m-${i}`} x={r2(x - 4.5)} y={r2(y - 3.5)} width={9} height={7} rx={2.5} fill="#50b8e0" opacity={0.6} transform={`rotate(${deg} ${x} ${y})`} />
                  )
                })}

                {/* ═══ INNER CARGO — RNA STRANDS ═══ */}
                <g opacity="0.85">
                  <path d="M178 198 Q198 182 218 198 Q238 214 258 198 Q278 182 298 198" fill="none" stroke="url(#rnaGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 3">
                    <animate attributeName="stroke-dashoffset" values="0;-16" dur="3s" repeatCount="indefinite" />
                  </path>
                  <path d="M168 248 Q188 232 208 248 Q228 264 248 248 Q268 232 288 248" fill="none" stroke="#ff9050" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.6">
                    <animate attributeName="stroke-dashoffset" values="0;-16" dur="4s" repeatCount="indefinite" />
                  </path>
                  <path d="M218 278 Q233 268 248 278" fill="none" stroke="#ffb060" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
                </g>

                {/* ═══ INNER CARGO — PROTEINS ═══ */}
                <ellipse cx="208" cy="233" rx="20" ry="15" fill="#30a8d8" opacity="0.45" filter="url(#softGlow)">
                  <animate attributeName="rx" values="19;21;19" dur="4s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="208" cy="233" rx="13" ry="10" fill="#60d0f0" opacity="0.4" />
                <circle cx="262" cy="223" r={8} fill="#40b8e8" opacity="0.4" />
                <circle cx="247" cy="263" r={6} fill="#38a8d8" opacity="0.35" />
                <circle cx="193" cy="258" r={7} fill="#50c0e8" opacity="0.38" />
                <circle cx="277" cy="243" r={5} fill="#30a0d0" opacity="0.3" />

                {/* ═══ LIPID RAFTS ═══ */}
                {[0, 90, 200, 320].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180
                  const r2 = (v: number) => Math.round(v * 100) / 100
                  const x = r2(230 + Math.cos(rad) * 164)
                  const y = r2(230 + Math.sin(rad) * 164)
                  return (
                    <ellipse key={`r-${i}`} cx={x} cy={y} rx={11} ry={5.5} fill="#70d8f8" opacity={0.2} transform={`rotate(${deg + 90} ${x} ${y})`} />
                  )
                })}

                {/* ═══ LABELS ═══ */}
                {/* Right: LIPID BILAYER */}
                <g opacity={hero.visible ? 1 : 0} style={{ transition: "opacity 1s ease 0.8s" }}>
                  <line x1="395" y1="150" x2="342" y2="192" stroke="url(#labelLine)" strokeWidth="1.2" />
                  <circle cx="342" cy="192" r="3" fill="#60d8ff" />
                  <text x="400" y="144" fill="#e0f4ff" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">LIPID BILAYER</text>
                  <text x="400" y="157" fill="#90c8e8" fontSize="8" fontFamily="system-ui, sans-serif">Membrane Shell</text>
                </g>

                {/* Right lower: SURFACE */}
                <g opacity={hero.visible ? 1 : 0} style={{ transition: "opacity 1s ease 1s" }}>
                  <line x1="400" y1="288" x2="350" y2="262" stroke="url(#labelLine)" strokeWidth="1.2" />
                  <circle cx="350" cy="262" r="3" fill="#60d8ff" />
                  <text x="405" y="282" fill="#e0f4ff" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">SURFACE</text>
                  <text x="405" y="295" fill="#90c8e8" fontSize="8" fontFamily="system-ui, sans-serif">Receptor Proteins</text>
                </g>

                {/* Left: RNA CARGO */}
                <g opacity={hero.visible ? 1 : 0} style={{ transition: "opacity 0.5s ease 0.3s" }}>
                  <line x1="58" y1="192" x2="162" y2="202" stroke="url(#labelLineL)" strokeWidth="1.2" />
                  <circle cx="162" cy="202" r="3" fill="#ffa050" />
                  <text x="14" y="184" fill="#ffd090" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">RNA CARGO</text>
                  <text x="14" y="197" fill="#c0a878" fontSize="8" fontFamily="system-ui, sans-serif">mRNA &amp; miRNA</text>
                </g>

                {/* Left lower: CARGO PROTEINS */}
                <g opacity={hero.visible ? 1 : 0} style={{ transition: "opacity 0.5s ease 0.4s" }}>
                  <line x1="58" y1="288" x2="152" y2="258" stroke="url(#labelLineL)" strokeWidth="1.2" />
                  <circle cx="152" cy="258" r="3" fill="#60d0f0" />
                  <text x="6" y="281" fill="#e0f4ff" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">CARGO PROTEINS</text>
                  <text x="6" y="294" fill="#90c8e8" fontSize="8" fontFamily="system-ui, sans-serif">Growth Factors &amp; Enzymes</text>
                </g>

                {/* Bottom: Size indicator */}
                <g opacity={hero.visible ? 1 : 0} style={{ transition: "opacity 0.5s ease 0.5s" }}>
                  <line x1="180" y1="412" x2="180" y2="388" stroke="#60d8ff" strokeWidth="0.8" opacity="0.5" />
                  <line x1="280" y1="412" x2="280" y2="388" stroke="#60d8ff" strokeWidth="0.8" opacity="0.5" />
                  <line x1="180" y1="407" x2="280" y2="407" stroke="#60d8ff" strokeWidth="1" opacity="0.6" />
                  <text x="230" y="424" textAnchor="middle" fill="#b0d8f0" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">30–150 nm</text>
                </g>

                {/* ═══ ROTATING DASHED RING ═══ */}
                <circle cx="230" cy="230" r="148" fill="none" stroke="#60d8ff" strokeWidth="0.6" strokeDasharray="3 6" opacity="0.2">
                  <animateTransform attributeName="transform" type="rotate" from="0 230 230" to="360 230 230" dur="60s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </div>

        {/* ── FEATURE CARDS GRID ── */}
        <div ref={cards.ref}>
          <div className="text-center mb-6">
            <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.1] px-4 py-1.5 rounded-full border border-[#0ea5e9]/20">
              Platform Capabilities
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-[#0f172a] mt-4">
              Advanced Exosome Technology
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative glass-card rounded-xl p-6 bg-white border border-[#e2e8f0]"
                style={{
                  opacity: cards.visible ? 1 : 0,
                  transform: cards.visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.85)",
                  transition: `opacity 1.0s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.1}s, transform 1.0s cubic-bezier(0.34,1.56,0.64,1) ${0.08 + i * 0.1}s, background 0.5s ease, border-color 0.5s ease`,
                }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center text-lg mb-4 group-hover:bg-[#0ea5e9]/20 transition-colors duration-300">
                  {f.icon}
                </div>

                <h4 className="text-[15px] font-bold text-[#0f172a] mb-2">
                  {f.title}
                </h4>

                <p className="text-[13px] text-[#334155] leading-relaxed">
                  {f.desc}
                </p>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#38bdf8]/0 to-transparent group-hover:via-[#38bdf8]/30 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div
          ref={cta.ref}
          className="mt-4 text-center"
          style={{
            opacity: cta.visible ? 1 : 0,
            transform: `translateY(${cta.visible ? 0 : 20}px)`,
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <a
            href="/research-technology"
            className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#0284c7] transition-all duration-300"
          >
            Explore Research & Technology
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
