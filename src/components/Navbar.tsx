"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { navLinks } from "@/data/siteData"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const top = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      if (top) window.scrollTo(0, -parseInt(top, 10))
    }
  }, [mobileOpen])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
           ?           "bg-white/80 backdrop-blur-xl border-b border-[#e2e8f0]/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="group shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center">
                <img
                  src="/images/logo.png?v=3"
                  alt="EverCeutical Logo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] sm:text-sm md:text-base font-bold tracking-tight text-[#0f172a]">
                  Ever<span className="text-[#38bdf8]">Ceutical</span>
                </span>
                <span className="hidden sm:block text-[9px] md:text-[10px] text-[#64748b] font-medium tracking-wider uppercase -mt-[1px]">
                  Leaders in Exosome Innovation
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Links + CTA */}
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.04, duration: 0.35 }}
                  >
                    <Link
                      href={link.href}
                      className={`relative text-xs font-semibold tracking-wide transition-all duration-300 group inline-block py-0.5 ${
                        isActive ? "text-[#38bdf8]" : "text-[#334155] hover:text-[#0f172a]"
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="navDot"
                          className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#38bdf8]"
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        />
                      )}
                      <span className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#38bdf8]/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="hidden md:block">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0ea5e9] text-white text-xs font-semibold transition-all duration-300 hover:bg-[#0284c7] hover:scale-[1.03]"
              >
                Get In Touch
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-2 h-2 text-white transition-transform group-hover:translate-x-[0.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] transition-colors"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-[3.5px]">
                <motion.span animate={mobileOpen ? { rotate: 45, y: 4.5 } : {}} className="block w-[18px] h-[1.5px] bg-[#334155] rounded-full origin-center" />
                <motion.span animate={mobileOpen ? { opacity: 0 } : {}} className="block w-[18px] h-[1.5px] bg-[#334155] rounded-full" />
                <motion.span animate={mobileOpen ? { rotate: -45, y: -4.5 } : {}} className="block w-[18px] h-[1.5px] bg-[#334155] rounded-full origin-center" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden mt-0 bg-white/95 backdrop-blur-xl border-t border-[#e2e8f0]/50 overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 space-y-0.5">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href
                return (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i, duration: 0.2 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)} className={`block text-sm py-3 px-3.5 rounded-lg transition-all duration-200 font-medium ${isActive ? "text-[#38bdf8] bg-[#38bdf8]/10" : "text-[#334155] hover:text-[#0f172a] hover:bg-[#f8fafc]"}`}>
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.25 }} className="pt-2">
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold">
                  Get In Touch
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
