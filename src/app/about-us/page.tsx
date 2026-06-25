"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

import { aboutUs } from "@/data/scrapedData"

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
      { threshold: isMobile ? 0.01 : threshold, rootMargin: rootMargin ?? (isMobile ? "200px 0px 0px 0px" : "0px 0px -30px 0px") }
    )
    obs.observe(el)
    const timer = isMobile ? setTimeout(() => setVisible(true), 1500) : setTimeout(() => setVisible(true), 4000)
    return () => { obs.disconnect(); clearTimeout(timer) }
  }, [threshold, rootMargin])

  return { ref, visible }
}

function useMouseTilt() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px) scale(1.02)`
    }
    const handleLeave = () => {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)"
    }
    const handleTouchStart = () => {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(-4px) scale(1.01)"
    }
    const handleTouchEnd = () => {
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)"
    }
    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchend", handleTouchEnd)
    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])
  return ref
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

export default function AboutUsPage() {
  const hero = useInView(0.1, "0px")
  const mission = useInView(0.2)
  const about = useInView(0.2)
  const vesco = useInView(0.15)
  const facility = useInView(0.15)
  const rd = useInView(0.2)
  const exosomes = useInView(0.15)
  const quality = useInView(0.2)
  const cta = useInView(0.3)

  return (
    <>
      <Navbar />
      <main className="relative">
        {/* HERO SECTION */}
        <section className="relative min-h-[100vh] flex items-center justify-center bg-transparent overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#5b7c91]/[0.04] blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
            {[12, 25, 40, 55, 70, 85].map((x, i) => (
              <FloatingParticle key={i} delay={i * 1.2} x={x} size={3 + (i % 3) * 2} />
            ))}
          </div>

          <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center z-10" ref={hero.ref}>
            <div style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 30}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
              <span className="text-xs text-[#38bdf8] font-semibold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-5 py-2 rounded-full border border-[#0ea5e9]/25 inline-block mb-5">
                {aboutUs.hero.tagline}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#0f172a] leading-tight mb-6"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 40}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s" }}>
              {aboutUs.hero.title}
            </h1>
            <p className="text-sm text-[#38bdf8] font-medium mb-3 tracking-wide"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 25}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.45s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.45s" }}>
              {aboutUs.hero.subtitle}
            </p>
            <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 25}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s" }}>
              {aboutUs.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 20}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s" }}>
              <a href="#mission" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300">
                Our Mission
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </a>
              <Link href="/contact" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full border border-[#cbd5e1] text-[#334155] text-sm font-semibold hover:border-[#5b7c91]/30 hover:text-[#38bdf8] transition-all duration-300">
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ opacity: hero.visible ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
            <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase">Scroll</span>
            <div className="w-5 h-8 border-2 border-[#cbd5e1] rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-[#94a3b8] rounded-full animate-[scrollBounce_1.5s_infinite]" />
            </div>
          </div>
        </section>

        {/* MISSION & VISION SECTION */}
        <section id="mission" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={mission.ref} className="text-center mb-8"
              style={{ opacity: mission.visible ? 1 : 0, transform: `translateY(${mission.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Our Purpose</span>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                {aboutUs.mission.title.split(" & ")[0]} <span className="text-[#38bdf8]">&amp;</span> {aboutUs.mission.title.split(" & ")[1]}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MissionCard
                title="Our Mission"
                text={aboutUs.mission.mission}
                visible={mission.visible}
                index={0}
                color="#5b7c91"
              />
              <MissionCard
                title="Our Vision"
                text={aboutUs.mission.vision}
                visible={mission.visible}
                index={1}
                color="#0f172a"
              />
            </div>
          </div>
        </section>

        {/* ABOUT EVERCEUTICAL SECTION */}
        <section id="about" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={about.ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div style={{
                opacity: about.visible ? 1 : 0,
                transform: about.visible ? "translateX(0) perspective(1000px) rotateY(0deg)" : "translateX(-80px) perspective(1000px) rotateY(8deg)",
                transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)",
              }}>
                <div className="relative glass-card rounded-2xl border border-[#e2e8f0] p-5 md:p-8 lg:p-10 overflow-hidden bg-white">
                  <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#5b7c91]/40 to-transparent" />
                  <span className="inline-block text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.1] px-4 py-1.5 rounded-full mb-5"
                    style={{ opacity: about.visible ? 1 : 0, transform: `translateY(${about.visible ? 0 : 20}px)`, transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s" }}>
                    Who We Are
                  </span>
                   <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-4 leading-tight"
                    style={{ opacity: about.visible ? 1 : 0, transform: `translateY(${about.visible ? 0 : 25}px)`, transition: "opacity 1.1s ease 0.55s, transform 1.1s ease 0.55s" }}>
                    {aboutUs.about.title}
                  </h2>
                  <p className="text-[#334155] text-sm md:text-[15px] leading-relaxed mb-8"
                    style={{ opacity: about.visible ? 1 : 0, transform: `translateY(${about.visible ? 0 : 20}px)`, transition: "opacity 1s ease 0.7s, transform 1s ease 0.7s" }}>
                    {aboutUs.about.description}
                  </p>
                </div>
              </div>

              <div
                style={{
                  opacity: about.visible ? 1 : 0,
                  transform: about.visible ? "translateX(0) scale(1)" : "translateX(80px) scale(0.8)",
                  transition: "opacity 1.4s ease 0.3s, transform 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s",
                }}>
                <StatsCard highlights={aboutUs.about.highlights} />
              </div>
            </div>
          </div>
        </section>

        {/* VESCO SCIENCE PARTNERSHIP SECTION */}
        <section id="vesco" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#5b7c91]/[0.02] blur-[120px]" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10 relative">
            <div ref={vesco.ref} className="text-center mb-8"
              style={{ opacity: vesco.visible ? 1 : 0, transform: `translateY(${vesco.visible ? 0 : 50}px) scale(${vesco.visible ? 1 : 0.9})`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">{aboutUs.vesco.subtitle}</span>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                {aboutUs.vesco.title.split(" by ")[0]} <span className="text-[#38bdf8]">by</span> {aboutUs.vesco.title.split(" by ")[1]}
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {aboutUs.vesco.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {aboutUs.vesco.capabilities.map((cap, i) => (
                <VescoCard key={i} capability={cap} index={i} visible={vesco.visible} />
              ))}
            </div>
          </div>
        </section>

        {/* WORLD-CLASS FACILITY SECTION */}
        <section id="facility" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={facility.ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div style={{
                opacity: facility.visible ? 1 : 0,
                transform: facility.visible ? "translateX(0)" : "translateX(-60px)",
                transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)",
              }}>
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={aboutUs.images.facility}
                    alt="World-Class Production Facility"
                    className="w-full h-[300px] md:h-[400px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>

              <div style={{
                opacity: facility.visible ? 1 : 0,
                transform: facility.visible ? "translateX(0)" : "translateX(60px)",
                transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s",
              }}>
                <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block mb-5">
                  Our Infrastructure
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-4 leading-tight">
                  {aboutUs.facility.title}
                </h2>
                <p className="text-[#334155] text-sm md:text-[15px] leading-relaxed mb-6">
                  {aboutUs.facility.description}
                </p>
                <p className="text-[#38bdf8] text-xs font-medium mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {aboutUs.facility.address}
                </p>
                <div className="flex flex-wrap gap-3">
                  {aboutUs.facility.standards.map((std, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#f8fafc] backdrop-blur-sm rounded-full px-4 py-2 border border-[#e2e8f0] transition-all duration-300"
                      style={{ opacity: facility.visible ? 1 : 0, transform: `translateY(${facility.visible ? 0 : 20}px) scale(${facility.visible ? 1 : 0.8})`, transition: `opacity 0.9s ease ${0.5 + i * 0.12}s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.12}s` }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5b7c91]" />
                      <span className="text-[12px] font-semibold text-[#38bdf8]">{std}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* R&D & EXPERT TEAM SECTION */}
        <section id="rd" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
            {[18, 35, 52, 68, 82].map((x, i) => (
              <FloatingParticle key={i} delay={i * 1.5 + 0.5} x={x} size={3 + (i % 2) * 2} />
            ))}
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={rd.ref} className="text-center mb-8"
              style={{ opacity: rd.visible ? 1 : 0, transform: `translateY(${rd.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Our People</span>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                {aboutUs.rd.title.split(" & ")[0]} <span className="text-[#38bdf8]">&amp;</span> {aboutUs.rd.title.split(" & ")[1]}
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {aboutUs.rd.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {aboutUs.rd.team.map((member, i) => (
                <TeamCard key={i} member={member} index={i} visible={rd.visible} />
              ))}
            </div>
          </div>
        </section>

        {/* UNDERSTANDING EXOSOMES SECTION */}
        <section id="exosomes" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 z-10">
            <div ref={exosomes.ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div style={{
                opacity: exosomes.visible ? 1 : 0,
                transform: exosomes.visible ? "translateX(0)" : "translateX(-60px)",
                transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)",
              }}>
                <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block mb-5">
                  The Science
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-4 leading-tight">
                  {aboutUs.exosomes.title}
                </h2>
                <p className="text-[#334155] text-sm md:text-[15px] leading-relaxed">
                  {aboutUs.exosomes.description}
                </p>
              </div>

              <div style={{
                opacity: exosomes.visible ? 1 : 0,
                transform: exosomes.visible ? "translateX(0) scale(1)" : "translateX(60px) scale(0.9)",
                transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s",
              }}>
                <div className="relative rounded-2xl overflow-hidden glass-card border border-white/[0.08] p-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${aboutUs.exosomes.videoId}`}
                      title={aboutUs.exosomes.videoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm font-semibold text-[#38bdf8]">{aboutUs.exosomes.videoTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUALITY ASSURANCE SECTION */}
        <section id="quality" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 z-10">
            <div ref={quality.ref} className="text-center mb-8"
              style={{ opacity: quality.visible ? 1 : 0, transform: `translateY(${quality.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Our Standards</span>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                {aboutUs.quality.title.split(" & ")[0]} <span className="text-[#38bdf8]">&amp;</span> {aboutUs.quality.title.split(" & ")[1]}
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {aboutUs.quality.description}
              </p>
            </div>

            <div style={{
              opacity: quality.visible ? 1 : 0,
              transform: `translateY(${quality.visible ? 0 : 40}px) scale(${quality.visible ? 1 : 0.95})`,
              transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s",
            }}>
              <div className="relative glass-card rounded-2xl border border-[#e2e8f0] p-5 md:p-8 lg:p-12 overflow-hidden bg-white">
                <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#5b7c91]/40 to-transparent" />
                <div className="flex flex-wrap justify-center gap-4">
                  {aboutUs.quality.protocols.map((protocol, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#f8fafc] backdrop-blur-sm rounded-xl px-6 py-4 border border-[#e2e8f0] transition-all duration-300"
                      style={{ opacity: quality.visible ? 1 : 0, transform: `translateY(${quality.visible ? 0 : 25}px) scale(${quality.visible ? 1 : 0.85})`, transition: `opacity 0.9s ease ${0.5 + i * 0.12}s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.12}s` }}>
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <span className="text-[13px] font-semibold text-[#38bdf8]">{protocol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN THE MOVEMENT CTA SECTION */}
        <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#5b7c91]/[0.03] blur-3xl" />
          </div>

          <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 z-10 relative">
            <div ref={cta.ref} style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 60}px) scale(${cta.visible ? 1 : 0.9})`, transition: "opacity 1.5s cubic-bezier(0.22,1,0.36,1), transform 1.5s cubic-bezier(0.22,1,0.36,1)" }}>
              <div className="relative rounded-3xl p-5 md:p-8 lg:p-12 xl:p-16 text-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)" }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white/[0.04] blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/[0.03] blur-2xl" />
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white/[0.04]" style={{
                      width: 4 + i * 2,
                      height: 4 + i * 2,
                      top: `${15 + i * 12}%`,
                      right: `${10 + i * 14}%`,
                      animation: `floatUp ${10 + i * 2}s ease-in-out ${i * 0.8}s infinite`,
                    }} />
                  ))}
                </div>

                <div className="relative z-10">
                  <span className="inline-block text-[10px] text-white/60 font-bold tracking-[0.25em] uppercase bg-white/[0.08] px-4 py-1.5 rounded-full mb-3"
                    style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 15}px)`, transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s" }}>
                    {aboutUs.cta.title}
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight"
                    style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 20}px)`, transition: "opacity 1.1s ease 0.55s, transform 1.1s ease 0.55s" }}>
                    Ready to Experience <span className="text-[#38bdf8]">Advanced</span> Exosomes?
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-5"
                    style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 20}px)`, transition: "opacity 1s ease 0.7s, transform 1s ease 0.7s" }}>
                    {aboutUs.cta.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 20}px)`, transition: "opacity 1s ease 0.85s, transform 1s ease 0.85s" }}>
                    <Link href="/contact" className="inline-flex items-center gap-2 bg-[#0ea5e9] text-white text-sm font-bold px-6 md:px-8 py-3.5 rounded-full hover:bg-[#0284c7] transition-all duration-300">
                      Get in Touch
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                    <Link href="/research-technology" className="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-semibold px-6 md:px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300">
                      Explore Research
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function MissionCard({ title, text, visible, index, color }: { title: string; text: string; visible: boolean; index: number; color: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(50px) scale(0.92)`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.18}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.18}s`,
        background: hovered ? `linear-gradient(135deg, rgba(255,255,255,1) 0%, ${color}08 100%)` : "rgba(249,250,251,1)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${hovered ? color + "20" : "rgba(229,231,235,1)"}`,
        boxShadow: "none",
      }}>
      <div className="relative p-5 md:p-8 lg:p-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
          style={{ backgroundColor: color + "10", transform: hovered ? "scale(1.15) rotate(-8deg)" : "scale(1) rotate(0deg)" }}>
          <svg className="w-6 h-6" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {index === 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            )}
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-[#0f172a] mb-3">{title}</h3>
        <p className="text-[#334155] text-sm leading-relaxed">{text}</p>
        <div className="absolute bottom-0 left-8 right-8 h-[2px] transition-all duration-500"
          style={{ background: hovered ? `linear-gradient(to right, transparent, ${color}40, transparent)` : "linear-gradient(to right, transparent, transparent, transparent)" }} />
      </div>
    </div>
  )
}

function StatsCard({ highlights }: { highlights: { value: string; label: string }[] }) {
  const tiltRef = useMouseTilt()

  return (
    <div ref={tiltRef} className="relative glass-card rounded-2xl border border-[#e2e8f0] p-5 md:p-8 lg:p-10 overflow-hidden bg-white">
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#5b7c91]/40 to-transparent" />
      <div className="grid grid-cols-2 gap-6">
        {highlights.map((h, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#38bdf8] mb-1">{h.value}</div>
            <div className="text-[11px] text-[#94a3b8] font-medium tracking-wide">{h.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VescoCard({ capability, index, visible }: { capability: { title: string; desc: string }; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false)
  const icons = [
    <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b7c91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  ]
  const colors = ["#0ea5e9", "#0284c7", "#0369a1", "#38bdf8"]

  return (
    <div
      className="group relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(50px) scale(0.92)`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s`,
        background: hovered ? "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)" : "rgba(249,250,251,1)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${hovered ? "rgba(56,189,248,0.2)" : "rgba(229,231,235,1)"}`,
        boxShadow: "none",
      }}>
      <div className="p-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-500"
          style={{ backgroundColor: colors[index] + "15", transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)" }}>
          {icons[index]}
        </div>
        <h4 className="text-[15px] font-bold text-[#0f172a] mb-2">{capability.title}</h4>
        <p className="text-[13px] text-[#334155] leading-relaxed">{capability.desc}</p>
        <div className="absolute bottom-0 left-6 right-6 h-[1.5px] transition-all duration-500"
          style={{ background: hovered ? `linear-gradient(to right, transparent, ${colors[index]}30, transparent)` : "linear-gradient(to right, transparent, transparent, transparent)" }} />
      </div>
    </div>
  )
}

function TeamCard({ member, index, visible }: { member: { role: string; desc: string }; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false)
  const icons = [
    <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16h10" /></svg>,
    <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  ]

  return (
    <div
      className="group relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(50px) scale(0.92)`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s`,
        background: hovered ? "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)" : "rgba(249,250,251,1)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${hovered ? "rgba(56,189,248,0.2)" : "rgba(229,231,235,1)"}`,
        boxShadow: "none",
      }}>
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center mx-auto mb-4 transition-all duration-500"
          style={{ transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)" }}>
          {icons[index]}
        </div>
        <h4 className="text-[15px] font-bold text-[#0f172a] mb-2">{member.role}</h4>
        <p className="text-[13px] text-[#334155] leading-relaxed">{member.desc}</p>
        <div className="absolute bottom-0 left-6 right-6 h-[1.5px] transition-all duration-500"
          style={{ background: hovered ? "linear-gradient(to right, transparent, rgba(91,124,145,0.3), transparent)" : "linear-gradient(to right, transparent, transparent, transparent)" }} />
      </div>
    </div>
  )
}