"use client"

import { useState, useEffect, useRef } from "react"
import { faq } from "@/data/siteData"

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

function FaqCard({ item, index, visible }: { item: { q: string; a: string }; index: number; visible: boolean }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 25}px)`,
        transition: `opacity 0.6s ease ${0.08 + index * 0.07}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.07}s`,
      }}
    >
      <div
        className={`glass-card relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
          hovered || open ? "bg-white" : "bg-[#f8fafc]"
        }`}
        style={{
          border: `1px solid ${open ? "rgba(56,189,248,0.2)" : hovered ? "rgba(209,213,219,0.5)" : "rgba(229,231,235,1)"}`,
          boxShadow: "none",
        }}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-start gap-3 p-4 md:p-5">
          {/* Number badge */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500"
            style={{
              background: open
                ? "linear-gradient(135deg, #0ea5e9, #38bdf8)"
                : hovered
                ? "rgba(56,189,248,0.12)"
                : "rgba(56,189,248,0.06)",
              boxShadow: "none",
            }}
          >
            <span
              className="text-[10px] font-bold transition-colors duration-300"
              style={{ color: open ? "white" : "#38bdf8" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4
                className="text-[13px] font-bold leading-snug transition-colors duration-300"
                style={{ color: open ? "#38bdf8" : "#0f172a" }}
              >
                {item.q}
              </h4>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-400"
                style={{
                  background: open ? "rgba(56,189,248,0.12)" : "transparent",
                  transform: `rotate(${open ? 180 : 0}deg)`,
                }}
              >
                <svg className="w-3.5 h-3.5" style={{ color: open ? "#38bdf8" : "#94a3b8" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Answer */}
            <div
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: open ? "150px" : "0",
                opacity: open ? 1 : 0,
                marginTop: open ? "10px" : "0",
              }}
            >
              <p className="text-[12px] text-[#334155] leading-[1.7] border-t border-[#e2e8f0] pt-2.5">
                {item.a}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const header = useInView(0.15)
  const image = useInView(0.15)
  const faqList = useInView(0.05)

  return (
    <section
      id="faq"
      className="relative bg-transparent py-10 md:py-14 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-[#38bdf8]/[0.02] blur-[80px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10 relative">
        {/* ── HEADER ── */}
        <div
          ref={header.ref}
          className="text-center mb-7"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: `translateY(${header.visible ? 0 : 35}px)`,
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.1] px-4 py-1.5 rounded-full inline-block">
            Knowledge Center
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mt-5 mb-3 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#38bdf8] text-sm md:text-base font-medium mb-4">
            Everything You Need to Know About Exosome Technology
          </p>
          <p className="text-[#334155] text-sm max-w-xl mx-auto leading-relaxed hidden md:block">
            Explore answers to the most common questions about exosomes, regenerative science,
            clinical applications, and treatment expectations.
          </p>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">
          {/* LEFT: Image */}
          <div
            ref={image.ref}
            className="relative"
            style={{
              opacity: image.visible ? 1 : 0,
              transform: `translateX(${image.visible ? 0 : -40}px)`,
              transition: "opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s",
            }}
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[4/5] max-h-[300px] md:max-h-[500px] lg:max-h-[600px]">
              {/* Actual image */}
              <img
                src="/images/faq-doctor.jpg"
                alt="Medical Professional"
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
              />

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[20, 40, 60, 75, 85].map((x, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#38bdf8]/40"
                    style={{
                      left: `${x}%`,
                      top: `${15 + i * 15}%`,
                      animation: `floatSlow ${4 + i}s ease-in-out ${i * 0.8}s infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Molecular graphics overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 500">
                <circle cx="80" cy="120" r="30" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
                <circle cx="160" cy="80" r="20" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
                <line x1="80" y1="120" x2="160" y2="80" stroke="#38bdf8" strokeWidth="0.3" />
                <circle cx="300" cy="200" r="25" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
                <circle cx="250" cy="350" r="35" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
                <line x1="300" y1="200" x2="250" y2="350" stroke="#38bdf8" strokeWidth="0.3" />
              </svg>

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0f172a]/40 to-transparent" />

              {/* Blue overlay tint */}
              <div className="absolute inset-0 bg-[#0ea5e9]/[0.04]" />
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-4 right-4 md:-bottom-4 md:-right-4 glass-card bg-white backdrop-blur-xl rounded-2xl border border-[#e2e8f0] px-5 py-3">
              <p className="text-[10px] text-[#334155] font-medium">Trusted by</p>
              <p className="text-lg font-bold text-[#0f172a]">500+</p>
              <p className="text-[10px] text-[#334155]">Clinics Worldwide</p>
            </div>
          </div>

          {/* RIGHT: FAQ Accordion */}
          <div ref={faqList.ref}>
            <div className="space-y-2.5">
              {faq.map((item, i) => (
                <FaqCard key={i} item={item} index={i} visible={faqList.visible} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
