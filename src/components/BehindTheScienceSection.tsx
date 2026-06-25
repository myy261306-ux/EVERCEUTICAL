"use client"

import { useState, useEffect, useRef } from "react"

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

interface VideoCardData {
  badge: string
  title: string
  desc: string
  youtubeId: string
  buttonLabel: string
  link: string
}

const videos: VideoCardData[] = [
  {
    badge: "Behind The Scenes",
    title: "Isolation of Exosomes",
    desc: "A comprehensive look at our laboratory protocol for isolating high-purity exosomes from human umbilical cord mesenchymal stem cells — showcasing the precision, sterility, and quality standards behind every EverCeutical product.",
    youtubeId: "jBywLJuNLvc",
    buttonLabel: "Watch Full Process",
    link: "https://youtu.be/jBywLJuNLvc?si=z1bH5QlIw6DZqnzy",
  },
  {
    badge: "Scientific Innovation",
    title: "Introducing EverCeutical",
    desc: "Discover the vision, science, and innovation that drive EverCeutical's next-generation exosome platform — from research and development to clinical-grade biotechnology solutions.",
    youtubeId: "kp1wviVg9nc",
    buttonLabel: "Discover Our Vision",
    link: "https://youtu.be/kp1wviVg9nc?si=7Aw-whVgX3CxDuJN",
  },
]

function VideoCard({
  data,
  index,
  visible,
}: {
  data: VideoCardData
  index: number
  visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 40}px)`,
        transition: `opacity 0.5s ease ${0.1 + index * 0.08}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.08}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="glass-card relative rounded-[20px] overflow-hidden transition-all duration-500"
        style={{
          background: hovered ? "rgba(255,255,255,1)" : "rgba(249,250,251,1)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? "rgba(56,189,248,0.25)" : "rgba(229,231,235,1)"}`,
          boxShadow: "none",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
        }}
      >
        <div className="relative w-full aspect-video bg-[#f1f5f9] overflow-hidden">
          {!playing ? (
            <div className="relative w-full h-full">
              <img
                src={`https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`}
                alt={data.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`
                }}
              />
              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 border border-[#e2e8f0]">
                  <svg className="w-3 h-3 text-[#38bdf8]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[10px] text-[#334155] font-medium tracking-wider uppercase">{data.badge}</span>
                </div>
              </div>

              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play"
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover/play:scale-110"
                  style={{
                    boxShadow: "none",
                  }}
                >
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>

              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f1f5f9] to-transparent" />
            </div>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${data.youtubeId}?autoplay=1&rel=0`}
              title={data.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          )}
        </div>

        <div className="p-5 sm:p-6 md:p-7">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0f172a] mb-2 leading-snug">
            {data.title}
          </h3>

          <p className="text-[12px] sm:text-[13px] text-[#334155] leading-relaxed mb-4">
            {data.desc}
          </p>

          <div className="flex items-center justify-between">
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-[#38bdf8] hover:text-[#0f172a] transition-colors group/link"
            >
              {data.buttonLabel}
              <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {playing && (
              <button
                onClick={() => setPlaying(false)}
                className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
                Pause
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BehindTheScienceSection() {
  const header = useInView(0.15)
  const cards = useInView(0.08)

  return (
    <section
      id="behind-the-science"
      className="relative bg-transparent py-10 sm:py-14 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.02] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#38bdf8]/[0.015] blur-[80px]" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#38bdf8]/15"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `floatSlow ${6 + i * 0.8}s ease-in-out ${i * 1.2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10 relative">
        <div
          ref={header.ref}
          className="text-center mb-5 sm:mb-7"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: `translateY(${header.visible ? 0 : 40}px)`,
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">
            Behind The Science
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-5 mb-4 leading-tight">
            Inside the World of{" "}
            <span className="text-[#38bdf8]">Advanced Exosome</span>{" "}
            Technology
          </h2>
          <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Discover the science, innovation, and manufacturing excellence behind
            EverCeutical&apos;s next-generation exosome platform through exclusive behind-the-scenes content.
          </p>
        </div>

        <div ref={cards.ref} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {videos.map((v, i) => (
            <VideoCard
              key={v.youtubeId}
              data={v}
              index={i}
              visible={cards.visible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
