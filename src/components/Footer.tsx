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
      { threshold: isMobile ? 0.01 : threshold, rootMargin: rootMargin ?? (isMobile ? "200px 0px 0px 0px" : "0px 0px -30px 0px") }
    )
    obs.observe(el)
    const timer = isMobile ? setTimeout(() => setVisible(true), 1500) : setTimeout(() => setVisible(true), 4000)
    return () => { obs.disconnect(); clearTimeout(timer) }
  }, [threshold, rootMargin])

  return { ref, visible }
}

const socialLinks = [
  { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", href: "https://www.facebook.com/EverCeutical" },
  { name: "Instagram", icon: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm4.5-7.5a1 1 0 110-2 1 1 0 010 2z", href: "https://www.instagram.com/everceutical/" },
  { name: "TikTok", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.2a8.16 8.16 0 005.58 2.17v-3.45a4.85 4.85 0 01-3.77-1.59V6.69h3.77z", href: "https://www.tiktok.com/@everceutical" },
  { name: "YouTube", icon: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z", href: "https://www.youtube.com/@EverCeutical" },
  { name: "Email", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6", href: "mailto:everceutical@gmail.com" },
]

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Exosome Technology", href: "/research-technology" },
  { label: "Applications", href: "#benefits" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "/contact" },
]

const techLinks = [
  "Advanced Exosomes",
  "Regenerative Science",
  "Research & Innovation",
  "Manufacturing Process",
  "Quality Standards",
  "Clinical Excellence",
]

const trustBadges = [
  "Research Driven",
  "Clinical Quality",
  "Advanced Biotechnology",
  "Innovation Focused",
]

export default function Footer() {
  const footerRef = useInView(0.05)
  const [email, setEmail] = useState("")

  return (
    <footer
      ref={footerRef.ref}
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.98) 50%, rgba(248,250,252,1) 100%)",
      }}
    >
      {/* Subtle glow patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-[#0ea5e9]/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] rounded-full bg-[#0369a1]/[0.04] blur-[80px]" />
      </div>

      {/* ── NEWSLETTER SECTION ── */}
      <div
        className="border-b border-[#e2e8f0]"
        style={{
          opacity: footerRef.visible ? 1 : 0,
          transform: `translateY(${footerRef.visible ? 0 : 20}px)`,
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#0f172a] mb-1">
                Stay Updated With Scientific Innovations
              </h3>
              <p className="text-[13px] text-[#334155]">
                Subscribe to receive the latest news on exosome research and technology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 sm:w-72 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0ea5e9]/40 transition-colors"
              />
              <button className="px-6 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-[13px] font-semibold hover:bg-[#0284c7] transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-6">
          {/* Column 1: Brand */}
          <div
            style={{
              opacity: footerRef.visible ? 1 : 0,
              transform: `translateY(${footerRef.visible ? 0 : 20}px)`,
              transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/images/logo.png?v=3"
                  alt="EverCeutical Logo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <div>
                <span className="text-base font-bold text-[#0f172a]">
                  Ever<span className="text-[#38bdf8]">Ceutical</span>
                </span>
              </div>
            </div>

            <p className="text-[13px] text-[#334155] leading-relaxed mb-5">
              Advancing regenerative science through next-generation exosome technology,
              research-driven innovation, and clinical-quality biotechnology solutions.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s, i) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="w-9 h-9 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-[#0ea5e9] hover:text-white hover:border-[#0ea5e9] transition-all duration-300 hover:scale-105"
                  style={{
                    opacity: footerRef.visible ? 1 : 0,
                    transform: `scale(${footerRef.visible ? 1 : 0.5})`,
                    transition: `opacity 0.5s ease ${0.3 + i * 0.06}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.06}s`,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div
            style={{
              opacity: footerRef.visible ? 1 : 0,
              transform: `translateY(${footerRef.visible ? 0 : 20}px)`,
              transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
            }}
          >
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-[13px] text-[#334155] hover:text-[#38bdf8] transition-colors duration-300 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#0ea5e9]/40 group-hover:bg-[#38bdf8] transition-colors duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Technology */}
          <div
            style={{
              opacity: footerRef.visible ? 1 : 0,
              transform: `translateY(${footerRef.visible ? 0 : 20}px)`,
              transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
            }}
          >
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-4 tracking-wide">Technology</h4>
            <ul className="space-y-2.5">
              {techLinks.map((item, i) => (
                <li key={i}>
                  <span className="text-[13px] text-[#334155] inline-flex items-center gap-1.5 group cursor-default">
                    <span className="w-1 h-1 rounded-full bg-[#0ea5e9]/40 group-hover:bg-[#38bdf8] transition-colors duration-300" />
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div
            style={{
              opacity: footerRef.visible ? 1 : 0,
              transform: `translateY(${footerRef.visible ? 0 : 20}px)`,
              transition: "opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s",
            }}
          >
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-4 tracking-wide">Contact Information</h4>
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] text-[#64748b]">Location</p>
                  <p className="text-[13px] text-[#334155]">Seoul, South Korea</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] text-[#64748b]">Email</p>
                  <p className="text-[13px] text-[#334155]">everceutical@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] text-[#64748b]">Phone</p>
                  <p className="text-[13px] text-[#334155]">+82 (0) 2-1234-5678</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0ea5e9]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] text-[#64748b]">Business Hours</p>
                  <p className="text-[13px] text-[#334155]">Mon – Fri, 9:00 AM – 6:00 PM KST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div
        className="border-t border-[#e2e8f0]"
        style={{
          opacity: footerRef.visible ? 1 : 0,
          transition: "opacity 0.7s ease 0.5s",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] text-[#38bdf8]/70 font-medium"
              >
                <svg className="w-4 h-4 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LEGAL SECTION ── */}
      <div className="border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#94a3b8]">
            <p>© 2026 EverCeutical. All Rights Reserved.</p>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <a href="#" className="py-1 hover:text-[#38bdf8] transition-colors">Privacy Policy</a>
              <span className="text-[#334155]">|</span>
              <a href="#" className="py-1 hover:text-[#38bdf8] transition-colors">Terms &amp; Conditions</a>
              <span className="text-[#334155]">|</span>
              <a href="#" className="py-1 hover:text-[#38bdf8] transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
