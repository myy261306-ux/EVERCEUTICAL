"use client"

import { useState, useEffect, useMemo } from "react"
import { exosomeClasses } from "@/data/siteData"

const RING_DESKTOP = 540
const RING_TABLET = 420
const RING_MOBILE = 240
const NODE_R_DESKTOP = 42
const NODE_R_TABLET = 34
const NODE_R_MOBILE = 20
const OUTER_R = 0.92
const CENTER_CIRCLE_R = 48

function degToRad(d: number) {
  return (d * Math.PI) / 180
}

function getNodePos(i: number, total: number, ring: number) {
  const angleDeg = (360 / total) * i - 90
  const rad = degToRad(angleDeg)
  const r = ring / 2 * OUTER_R
  const cx = ring / 2
  const cy = ring / 2
  return {
    x: cx + Math.cos(rad) * r,
    y: cy + Math.sin(rad) * r,
    angle: angleDeg,
    angleRad: rad,
  }
}

export default function ExosomeClassesSection() {
  const [bp, setBp] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop")
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const el = document.getElementById("classes")
    if (!el) return
    const isMobile = window.innerWidth < 768
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShow(true) },
      { threshold: 0.05, rootMargin: isMobile ? "400px 0px 0px 0px" : "0px 0px -20px 0px" }
    )
    obs.observe(el)
    const timer = setTimeout(() => setShow(true), isMobile ? 500 : 2000)
    return () => { obs.disconnect(); clearTimeout(timer) }
  }, [])

  const ringSize = bp === "mobile" ? RING_MOBILE : bp === "tablet" ? RING_TABLET : RING_DESKTOP
  const nodeR = bp === "mobile" ? NODE_R_MOBILE : bp === "tablet" ? NODE_R_TABLET : NODE_R_DESKTOP
  const center = ringSize / 2
  const outerR = center * OUTER_R

  const nodes = useMemo(
    () => exosomeClasses.map((cls, i) => ({ ...cls, pos: getNodePos(i, exosomeClasses.length, ringSize) })),
    [ringSize],
  )

  const pad = bp === "mobile" ? 40 : 40
  const svgW = ringSize + pad * 2
  const cx = center + pad
  const cy = center + pad

  return (
    <section
      id="classes"
      className="relative flex flex-col items-center justify-center bg-transparent py-10 md:py-12 overflow-x-hidden"
    >
      {/* Title */}
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 text-center mb-6 md:mb-7 z-10">
        <span className="text-xs text-[#38bdf8] font-semibold tracking-[0.2em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full">
          Our Science
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mt-4 mb-2 leading-tight">
          Exosome <span className="text-[#38bdf8]">Classes</span>
        </h2>
        <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto">
          Scientifically Sourced Exosome Types for Advanced Therapeutic &amp; Aesthetic Use
        </p>
      </div>

      {/* Ring Container */}
      <div className="relative z-10" style={{ width: ringSize, height: ringSize, overflow: "visible" }}>

        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgW}
          viewBox={`0 0 ${svgW} ${svgW}`}
          style={{ left: -pad, top: -pad }}
        >
          <defs>
            {/* Gradient for collision spread (warm blend) */}
            <linearGradient id="grad-spread" gradientUnits="userSpaceOnUse"
              x1={cx - outerR} y1={cy} x2={cx + outerR} y2={cy}>
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="33%" stopColor="#0ea5e9" />
              <stop offset="66%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Gradient for connector lines (single line, node color → lighter) */}
            {nodes.map((n, i) => (
              <linearGradient
                key={`conn-${i}`}
                id={`conn-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={n.pos.x + pad} y1={n.pos.y + pad}
                x2={cx} y2={cy}
              >
                <stop offset="0%" stopColor={n.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={n.color} stopOpacity={0.4} />
              </linearGradient>
            ))}

            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-sm">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ====== OUTER RING: slow sequential fill → collision → gradient ====== */}
          {/* Base ring (neutral track) */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#d0dbe6" strokeWidth={3}
            opacity={show ? 0.5 : 0} style={{ transition: "opacity 0.8s ease" }} />

          {/* ── Fill 1: DEEP BLUE — sweeps from right (0°) ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0284c7" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(0deg)",
              animationName: show ? "ring-fill, ring-fill-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "0s, 0s",
              opacity: 0,
            }} />

          {/* ── Fill 2: CRIMSON — sweeps from left (180°) ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0ea5e9" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(180deg)",
              animationName: show ? "ring-fill, ring-fill-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "8s, 8s",
              opacity: 0,
            }} />

          {/* ── Fill 3: EMERALD — sweeps from bottom (90°) ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0ea5e9" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(90deg)",
              animationName: show ? "ring-fill, ring-fill-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "16s, 16s",
              opacity: 0,
            }} />

          {/* ── Flash 1: ORANGE — collides with Fill 1 ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0284c7" strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(180deg)",
              animationName: show ? "ring-flash, ring-flash-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "0s, 0s",
              opacity: 0,
            }} />

          {/* ── Flash 2: CYAN — collides with Fill 2 ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#00b4d8" strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(0deg)",
              animationName: show ? "ring-flash, ring-flash-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "8s, 8s",
              opacity: 0,
            }} />

          {/* ── Flash 3: MAGENTA — collides with Fill 3 ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0369a1" strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(270deg)",
              animationName: show ? "ring-flash, ring-flash-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "16s, 16s",
              opacity: 0,
            }} />

          {/* ── Gradient spread: collision creates blended color that fills ring ── */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="url(#grad-spread)" strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * (outerR + 6)}`}
            style={{
              ["--circ" as string]: `${2 * Math.PI * (outerR + 6)}`,
              transformOrigin: `${cx}px ${cy}px`, transform: "rotate(0deg)",
              animationName: show ? "ring-gradient, ring-gradient-vis" : "none, none",
              animationDuration: "36s, 36s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationIterationCount: "infinite, infinite",
              animationDelay: "24s, 24s",
              opacity: 0,
            }} />

          {/* Subtle glow */}
          <circle cx={cx} cy={cy} r={outerR + 6} fill="none"
            stroke="#0284c7" strokeWidth={8} filter="url(#glow)"
            opacity={show ? 0.06 : 0} style={{ transition: "opacity 1s ease" }} />

          {/* Middle ring - faint */}
          <circle cx={cx} cy={cy} r={center * 0.55} fill="none"
            stroke="#38bdf8" strokeWidth={1} strokeDasharray="5 8"
            opacity={show ? 0.35 : 0} style={{ transition: "opacity 0.8s ease 0.3s" }} />

          {/* Center circle - exosome boundary */}
          <circle cx={cx} cy={cy} r={CENTER_CIRCLE_R} fill="none"
            stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="3 4"
            opacity={show ? 0.4 : 0} style={{ transition: "opacity 0.8s ease 0.4s" }} />

          {/* ====== SINGLE CONNECTOR LINES (not double) ====== */}
          {nodes.map((node, i) => {
            const sx = node.pos.x + pad
            const sy = node.pos.y + pad
            const dx = cx - sx
            const dy = cy - sy
            const len = Math.sqrt(dx * dx + dy * dy)

            // Line ends well outside center circle
            const shorten = CENTER_CIRCLE_R + 38
            const ex = cx - (dx / len) * shorten
            const ey = cy - (dy / len) * shorten

            const d = i * 100 + 200

            return (
              <g key={`conn-${i}`}>
                {/* Glow under line */}
                <line x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={node.color} strokeWidth={7} filter="url(#glow)"
                  opacity={show ? 0.1 : 0}
                  style={{ transition: `opacity 0.6s ease ${d}ms` }} />

                {/* Main single connector line */}
                <line x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={`url(#conn-${i})`} strokeWidth={3} strokeLinecap="round"
                  opacity={show ? 0.85 : 0}
                  style={{ transition: `opacity 0.6s ease ${d}ms` }} />
              </g>
            )
          })}

          {/* ====== PROFESSIONAL ARROW HEADS at center end of each line ====== */}
          {nodes.map((node, i) => {
            const sx = node.pos.x + pad
            const sy = node.pos.y + pad
            const dx = cx - sx
            const dy = cy - sy
            const len = Math.sqrt(dx * dx + dy * dy)

            // Arrow tip well OUTSIDE center circle
            const shorten = CENTER_CIRCLE_R + 38
            const tipX = cx - (dx / len) * shorten
            const tipY = cy - (dy / len) * shorten

            // Arrow angle (pointing toward center)
            const angle = Math.atan2(dy, dx)

            // Professional arrow: chevron-style with proper proportions
            const arrowLen = 14
            const arrowWidth = 8

            // Base of arrow (behind tip)
            const baseX = tipX + Math.cos(angle + Math.PI) * arrowLen
            const baseY = tipY + Math.sin(angle + Math.PI) * arrowLen

            // Two side points
            const perpX = Math.cos(angle + Math.PI / 2) * arrowWidth
            const perpY = Math.sin(angle + Math.PI / 2) * arrowWidth

            const p1x = baseX + perpX
            const p1y = baseY + perpY
            const p2x = baseX - perpX
            const p2y = baseY - perpY

            const d = i * 100 + 500

            return (
              <g key={`arrow-${i}`}>
                {/* Arrow glow */}
                <polygon
                  points={`${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`}
                  fill={node.color} filter="url(#glow)"
                  opacity={show ? 0.25 : 0}
                  style={{ transition: `opacity 0.5s ease ${d}ms`,
                    transformOrigin: `${tipX}px ${tipY}px`,
                    transform: show ? "scale(1)" : "scale(0)" }} />

                {/* Arrow solid */}
                <polygon
                  points={`${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`}
                  fill={node.color}
                  opacity={show ? 0.9 : 0}
                  style={{ transition: `opacity 0.5s ease ${d}ms`,
                    transformOrigin: `${tipX}px ${tipY}px`,
                    transform: show ? "scale(1)" : "scale(0)" }} />
              </g>
            )
          })}

          {/* Animated particles flowing along each connector */}
          {nodes.map((node, i) => {
            const sx = node.pos.x + pad
            const sy = node.pos.y + pad
            const dx = cx - sx
            const dy = cy - sy
            const len = Math.sqrt(dx * dx + dy * dy)
            const shorten = CENTER_CIRCLE_R + 6
            const ex = cx - (dx / len) * shorten
            const ey = cy - (dy / len) * shorten

            // Cross-browser compatible: use CSS animation instead of animateMotion
            const duration = 3 + i * 0.4
            return (
              <g key={`ptcl-${i}`}>
                {/* Fallback: Use transform animation for cross-browser support */}
                <circle r={2.5} fill={node.color} opacity={0.8} filter="url(#glow-sm)">
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`${sx},${sy}; ${ex},${ey}; ${sx},${sy}`}
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                  />
                  <animate attributeName="r" values="1.5;3.5;1.5" dur={`${duration}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${duration}s`} repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}
        </svg>

        {/* ====== NODE CARDS ====== */}
        {nodes.map((node, i) => {
          const d = i * 100 + 100
          return (
            <div
              key={`nd-${i}`}
              className="absolute flex flex-col items-center"
              style={{
                left: node.pos.x - nodeR,
                top: node.pos.y - nodeR - 18,
                width: nodeR * 2,
                opacity: show ? 1 : 0,
                transform: `scale(${show ? 1 : 0.15})`,
                transition: `opacity 0.7s ease ${d}ms, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${d}ms`,
              }}
            >
              <div
                className="rounded-full bg-white flex items-center justify-center overflow-hidden border-2"
                style={{
                  width: nodeR * 2,
                  height: nodeR * 2,
                  borderColor: node.color + "40",
                  boxShadow: "none",
                }}
              >
                <img src={node.icon} alt={node.name}
                  className="w-[65%] h-[65%] object-contain" draggable={false} loading="lazy" />
              </div>
              <p className="mt-1.5 text-[9px] md:text-[11px] font-bold text-center leading-tight whitespace-nowrap text-[#0f172a]">
                {node.name}
              </p>
              <p className="hidden md:block text-[8px] md:text-[9px] text-[#334155] text-center mt-0.5">
                {node.tagline}
              </p>
            </div>
          )
        })}

        {/* Center educational diagram */}
        <div id="ring-center" className="absolute pointer-events-none flex items-center justify-center"
          style={{ left: center - CENTER_CIRCLE_R, top: center - CENTER_CIRCLE_R,
            width: CENTER_CIRCLE_R * 2, height: CENTER_CIRCLE_R * 2 }}>
          <svg width={CENTER_CIRCLE_R * 2} height={CENTER_CIRCLE_R * 2} viewBox="0 0 96 96">
            {/* Connecting lines from center to ring nodes */}
            {nodes.map((node, i) => {
              const rad = (node.pos.angleRad)
              const lineLen = CENTER_CIRCLE_R - 8
              const ex = CENTER_CIRCLE_R + Math.cos(rad) * lineLen
              const ey = CENTER_CIRCLE_R + Math.sin(rad) * lineLen
              return (
                <line key={`center-line-${i}`}
                  x1={CENTER_CIRCLE_R} y1={CENTER_CIRCLE_R}
                  x2={ex} y2={ey}
                  stroke={node.color} strokeWidth={0.8} opacity={0.3} />
              )
            })}
            {/* Center label */}
            <text x={CENTER_CIRCLE_R} y={CENTER_CIRCLE_R - 3}
              textAnchor="middle" dominantBaseline="middle"
              fill="#38bdf8" fontSize={7} fontWeight={700} letterSpacing={1.2}
              fontFamily="system-ui, sans-serif">EXOSOME</text>
            <text x={CENTER_CIRCLE_R} y={CENTER_CIRCLE_R + 7}
              textAnchor="middle" dominantBaseline="middle"
              fill="#94a3b8" fontSize={4.5} fontWeight={400}
              fontFamily="system-ui, sans-serif">Classes</text>
          </svg>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-6 md:mt-7 max-w-2xl mx-auto text-center z-10 px-5 sm:px-6"
        style={{ opacity: show ? 1 : 0, transform: `translateY(${show ? 0 : 15}px)`,
          transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s" }}>
        <h3 className="text-lg md:text-xl font-bold text-[#0f172a] mb-2">
          Next-Generation Regenerative Technology
        </h3>
        <p className="text-[#334155] text-sm leading-relaxed">
          Each exosome class is uniquely derived from specialized cell sources,
          engineered for targeted therapeutic and aesthetic applications.
        </p>
      </div>
    </section>
  )
}
