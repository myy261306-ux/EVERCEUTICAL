"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

import { contactInfo } from "@/data/scrapedData"

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

function ContactInfoCard({ icon, label, value, index, visible }: { icon: React.ReactNode; label: string; value: string; index: number; visible: boolean }) {
  const tiltRef = useMouseTilt()

  return (
    <div
      ref={tiltRef}
      className="group relative rounded-2xl p-6 cursor-default glass-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 40}px) scale(${visible ? 1 : 0.92})`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.15}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.15}s`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#38bdf8] mb-1">{label}</p>
          <p className="text-sm text-[#0f172a] font-medium leading-relaxed">{value}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-6 right-6 h-[1.5px] transition-all duration-500"
        style={{ background: "linear-gradient(to right, transparent, transparent, transparent)" }} />
    </div>
  )
}

function FaqItem({ item, index, visible }: { item: { question: string; answer: string }; index: number; visible: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group relative rounded-2xl overflow-hidden glass-card"
      style={{
        boxShadow: "none",
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 40}px) scale(${visible ? 1 : 0.95})`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.12}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.12}s`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold text-[#0f172a] pr-4 leading-relaxed">{item.question}</span>
        <div className={`w-8 h-8 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 transition-all duration-400 ${open ? "rotate-180 bg-[#0ea5e9]/20" : ""}`}>
          <svg className="w-4 h-4 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: open ? "300px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
        }}
      >
        <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-[#334155] leading-relaxed">{item.answer}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-6 right-6 h-[1.5px] transition-all duration-500"
        style={{ background: open ? "linear-gradient(to right, transparent, #38bdf8, transparent)" : "linear-gradient(to right, transparent, transparent, transparent)" }} />
    </div>
  )
}

function SocialCard({ platform, url, icon, color, index, visible }: { platform: string; url: string; icon: React.ReactNode; color: string; index: number; visible: boolean }) {
  const tiltRef = useMouseTilt()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={tiltRef}
      className="group relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
      style={{
        background: hovered ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, ${color}10 100%)` : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? color + "40" : "rgba(255,255,255,0.08)"}`,
        boxShadow: "none",
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 50}px) scale(${visible ? 1 : 0.9})`,
        transition: `opacity 1.2s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.18}s, transform 1.2s cubic-bezier(0.22,1,0.36,1) ${0.2 + index * 0.18}s, background 0.5s ease, border-color 0.5s ease`,
      }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500"
          style={{
            backgroundColor: color + "15",
            transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-[#0f172a] mb-2 transition-colors duration-300" style={{ color: hovered ? color : undefined }}>
          {platform}
        </h3>
        <p className="text-xs text-[#64748b] font-medium">Follow us on {platform}</p>
      </a>
      <div className="absolute bottom-0 left-8 right-8 h-[2px] transition-all duration-500"
        style={{ background: hovered ? `linear-gradient(to right, transparent, ${color}80, transparent)` : "linear-gradient(to right, transparent, transparent, transparent)" }} />
    </div>
  )
}

export default function ContactPage() {
  const hero = useInView(0.1, "0px")
  const formSection = useInView(0.15)
  const faqSection = useInView(0.2)
  const locationSection = useInView(0.2)
  const socialSection = useInView(0.2)
  const newsletterSection = useInView(0.3)
  const ctaSection = useInView(0.3)

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [newsletterEmail, setNewsletterEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterEmail("")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent overflow-x-hidden">

        {/* HERO */}
        <section className="relative min-h-[100vh] flex items-center justify-center bg-transparent overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[#0ea5e9]/[0.04] blur-3xl" />
            <div className="absolute bottom-10 right-[15%] w-60 h-60 rounded-full bg-[#38bdf8]/[0.03] blur-3xl" />
            {[12, 25, 40, 55, 70, 85].map((x, i) => (
              <FloatingParticle key={i} delay={i * 1.2} x={x} size={3 + (i % 3) * 2} />
            ))}
          </div>

          <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center z-10" ref={hero.ref}>
            <div style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 30}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
              <span className="text-xs text-[#38bdf8] font-semibold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-5 py-2 rounded-full border border-[#0ea5e9]/10 inline-block mb-5">
                EverCeutical Support
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#0f172a] leading-tight mb-6"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 40}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s" }}>
              Get in <span className="text-[#38bdf8]">Touch</span>
            </h1>
            <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 25}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s" }}>
              Have questions about our exosome therapy products or want to explore partnership opportunities?
              We&apos;re here to help you find the right solution for your practice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 20}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s" }}>
              <a href="#contact-form" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300">
                Send a Message
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </a>
              <a href="#faq" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full border border-[#cbd5e1] text-[#334155] text-sm font-semibold hover:border-[#0ea5e9]/30 hover:text-[#38bdf8] transition-all duration-300">
                View FAQ
              </a>
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

        {/* CONTACT FORM + INFO CARDS */}
        <section id="contact-form" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#38bdf8]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={formSection.ref} className="text-center mb-8"
              style={{ opacity: formSection.visible ? 1 : 0, transform: `translateY(${formSection.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Contact Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                Send Us a <span className="text-[#38bdf8]">Message</span>
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Reach out for product inquiries, wholesale orders, or partnership opportunities.
                Our team typically responds within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-start">
              <div style={{
                opacity: formSection.visible ? 1 : 0,
                transform: formSection.visible ? "translateX(0)" : "translateX(-60px)",
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.2s",
              }}>
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-[11px] font-bold text-[#38bdf8] tracking-wider uppercase mb-2 block">Name</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9]/40 focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#38bdf8] tracking-wider uppercase mb-2 block">Email</label>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9]/40 focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#38bdf8] tracking-wider uppercase mb-2 block">Phone</label>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9]/40 focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#38bdf8] tracking-wider uppercase mb-2 block">Message</label>
                      <textarea
                        placeholder="Your Message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9]/40 focus:ring-2 focus:ring-[#0ea5e9]/10 transition-all duration-300 resize-none"
                      />
                    </div>
                    <button type="submit" className="w-full px-6 py-3.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-5"
                style={{
                  opacity: formSection.visible ? 1 : 0,
                  transform: formSection.visible ? "translateX(0)" : "translateX(60px)",
                  transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.35s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.35s",
                }}>
                <ContactInfoCard
                  index={0}
                  visible={formSection.visible}
                  label="Email Us"
                  value={contactInfo.email}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                />
                <ContactInfoCard
                  index={1}
                  visible={formSection.visible}
                  label="Visit Us"
                  value={contactInfo.address}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                />
                <ContactInfoCard
                  index={2}
                  visible={formSection.visible}
                  label="Business Hours"
                  value={contactInfo.businessHours}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#0ea5e9]/[0.02] blur-[120px]" />
          </div>

          <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 z-10">
            <div ref={faqSection.ref} className="text-center mb-8"
              style={{ opacity: faqSection.visible ? 1 : 0, transform: `translateY(${faqSection.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Got Questions?</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                Frequently Asked <span className="text-[#38bdf8]">Questions</span>
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Find quick answers to common questions about our exosome therapy products,
                ordering process, and clinical applications.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.faq.map((item, i) => (
                <FaqItem key={i} item={item} index={i} visible={faqSection.visible} />
              ))}
            </div>
          </div>
        </section>

        {/* OFFICE LOCATION */}
        <section id="location" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-[#38bdf8]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
            <div ref={locationSection.ref} className="text-center mb-8"
              style={{ opacity: locationSection.visible ? 1 : 0, transform: `translateY(${locationSection.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Our Office</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                Find <span className="text-[#38bdf8]">Us</span>
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Visit our headquarters in Seoul, South Korea — the heart of exosome biotechnology innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
              <div style={{
                opacity: locationSection.visible ? 1 : 0,
                transform: locationSection.visible ? "translateX(0)" : "translateX(-60px)",
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.2s",
              }}>
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h3 className="text-lg md:text-xl font-bold text-[#0f172a] mb-6">Headquarters</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-[#38bdf8] mb-1">Address</p>
                         <p className="text-sm text-[#334155] leading-relaxed">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-[#38bdf8] mb-1">Email</p>
                        <p className="text-sm text-[#334155]">{contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-[#38bdf8] mb-1">Business Hours</p>
                        <p className="text-sm text-[#334155]">{contactInfo.businessHours}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-[#38bdf8] mb-1">Phone</p>
                        <p className="text-sm text-[#334155]">{contactInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                opacity: locationSection.visible ? 1 : 0,
                transform: locationSection.visible ? "translateX(0)" : "translateX(60px)",
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.35s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.35s",
              }}>
                <div className="relative rounded-2xl overflow-hidden h-[280px] sm:h-[400px] glass-surface">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.4!2d127.1!3d37.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDI0JzAwLjAiTiAxMjfCsDA2JzAwLjAiRQ!5e0!3m2!1sen!2skr!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="EverCeutical Office Location"
                  />
                  <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/[0.08]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA */}
        <section id="social" className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
            <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] rounded-full bg-[#38bdf8]/[0.02] blur-3xl" />
          </div>

          <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 z-10">
            <div ref={socialSection.ref} className="text-center mb-8"
              style={{ opacity: socialSection.visible ? 1 : 0, transform: `translateY(${socialSection.visible ? 0 : 50}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">Stay Connected</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
                Follow <span className="text-[#38bdf8]">EverCeutical</span>
              </h2>
              <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Stay up to date with the latest exosome research, product launches, and clinical insights across our social channels.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <SocialCard
                platform="Facebook"
                url={contactInfo.social.facebook}
                color="#1877F2"
                index={0}
                visible={socialSection.visible}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                }
              />
              <SocialCard
                platform="Instagram"
                url={contactInfo.social.instagram}
                color="#E4405F"
                index={1}
                visible={socialSection.visible}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                }
              />
              <SocialCard
                platform="TikTok"
                url={contactInfo.social.tiktok}
                color="#000000"
                index={2}
                visible={socialSection.visible}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-3.77-1.59V6.69h3.77z" />
                  </svg>
                }
              />
              <SocialCard
                platform="YouTube"
                url={contactInfo.social.youtube}
                color="#FF0000"
                index={3}
                visible={socialSection.visible}
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* NEWSLETTER CTA */}
        <section className="relative bg-transparent py-10 md:py-14 overflow-hidden">
          <div className="w-full max-w-3xl mx-auto px-5 sm:px-6">
            <div ref={newsletterSection.ref}
              className="relative rounded-3xl p-7 md:p-10 lg:p-14 text-center overflow-hidden bg-[#f8fafc] border border-[#e2e8f0]"
              style={{
                opacity: newsletterSection.visible ? 1 : 0,
                transform: `translateY(${newsletterSection.visible ? 0 : 40}px) scale(${newsletterSection.visible ? 1 : 0.95})`,
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)",
              }}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#0ea5e9]/[0.05] blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#38bdf8]/[0.04] blur-2xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center mx-auto mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
                  Stay Informed
                </h2>
                <p className="text-[#334155] text-sm mb-8 max-w-md mx-auto">
                  Get the latest exosome research and clinical insights delivered to your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full sm:flex-1 px-5 py-3 rounded-full text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 transition-all duration-300 bg-white border border-[#e2e8f0]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300 hover:scale-105"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="relative bg-transparent py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
            <div ref={ctaSection.ref} style={{ opacity: ctaSection.visible ? 1 : 0, transform: `translateY(${ctaSection.visible ? 0 : 60}px) scale(${ctaSection.visible ? 1 : 0.9})`, transition: "opacity 1.5s cubic-bezier(0.22,1,0.36,1), transform 1.5s cubic-bezier(0.22,1,0.36,1)" }}>
              <div className="relative rounded-3xl p-5 md:p-8 lg:p-12 xl:p-16 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white/[0.08] blur-2xl" />
                  <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/[0.06] blur-2xl" />
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white/[0.08]" style={{
                      width: 4 + i * 2,
                      height: 4 + i * 2,
                      top: `${15 + i * 12}%`,
                      right: `${10 + i * 14}%`,
                      animation: `floatUp ${10 + i * 2}s ease-in-out ${i * 0.8}s infinite`,
                    }} />
                  ))}
                </div>

                <div className="relative z-10">
                  <span className="inline-block text-[10px] text-white/60 font-bold tracking-[0.25em] uppercase bg-white/[0.08] px-4 py-1.5 rounded-full mb-3">
                    Partner With Us
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    Ready to Transform <span className="text-[#38bdf8]">Your Practice</span>?
                  </h2>
                  <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-5">
                    Join leading clinics worldwide in offering cutting-edge exosome therapy.
                    Discover how EverCeutical can elevate your practice.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/about-us" className="px-8 py-3.5 rounded-full bg-[#0ea5e9] text-white text-sm font-bold hover:bg-[#0284c7] transition-all duration-300 hover:scale-105">
                      About Us
                    </Link>
                    <Link href="/research-technology" className="px-8 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      Research &amp; Technology
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
