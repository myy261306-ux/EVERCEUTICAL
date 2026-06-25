"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BeforeAfterSlider from "@/components/BeforeAfterSlider"
import { products } from "@/data/siteData"

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
      { threshold: isMobile ? 0.01 : threshold, rootMargin: isMobile ? "300px 0px 0px 0px" : "0px 0px -30px 0px" }
    )
    obs.observe(el)
    const timer = isMobile ? setTimeout(() => setVisible(true), 600) : setTimeout(() => setVisible(true), 2500)
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
    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [])
  return ref
}

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <div
      className="absolute rounded-full bg-[#0ea5e9]/10 pointer-events-none"
      style={{
        width: size, height: size, left: `${x}%`, bottom: "-10%",
        animation: `floatUp ${12 + delay * 2}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

export default function ProductPageClient({ slug }: { slug: string }) {
  const product = products.find((p) => p.id === slug)

  const hero = useInView(0.1, "0px")
  const kitContents = useInView(0.2)
  const peptidesSection = useInView(0.2)
  const benefitsSection = useInView(0.2)
  const idealFor = useInView(0.2)
  const howToUse = useInView(0.2)
  const caseStudies = useInView(0.15)
  const importantNote = useInView(0.2)
  const bottomCta = useInView(0.3)
  const productImageRef = useMouseTilt()

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Product Not Found</h1>
          <p className="text-[#334155] mb-8">The product you are looking for does not exist.</p>
          <Link href="/products" className="inline-flex items-center px-6 py-3 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300">
            Back to Products
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const accent = product.accentColor

  return (
    <main className="relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] md:min-h-[100vh] flex items-center justify-center bg-transparent overflow-hidden pt-16 md:pt-0">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: `${accent}08` }} />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
          {[12, 25, 40, 55, 70, 85].map((x, i) => (
            <FloatingParticle key={i} delay={i * 1.2} x={x} size={3 + (i % 3) * 2} />
          ))}
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-20" ref={hero.ref}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative z-20" style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateX(0)" : "translateX(-60px)", transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
              <span className="text-xs font-semibold tracking-[0.25em] uppercase px-5 py-2 rounded-full border inline-block mb-5" style={{ color: accent, borderColor: `${accent}20`, backgroundColor: `${accent}08` }}>
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0f172a] leading-tight mb-4">
                {product.subtitle}
              </h1>
              <p className="text-sm md:text-base font-medium mb-3" style={{ color: accent }}>{product.fullName}</p>
              <p className="text-[#334155] text-sm md:text-[15px] leading-relaxed mb-8 max-w-xl">{product.desc}</p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/contact" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full text-white text-sm font-semibold transition-all duration-300" style={{ backgroundColor: accent }}>
                  Get Started
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <a href="#kit-contents" className="inline-flex items-center px-6 md:px-8 py-3.5 rounded-full border border-[#e2e8f0] text-[#334155] text-sm font-semibold hover:border-[#cbd5e1] transition-all duration-300">
                  View Details
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end" style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateX(0) scale(1)" : "translateX(60px) scale(0.9)", transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s" }}>
              <div ref={productImageRef} className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px] rounded-3xl overflow-hidden" style={{ boxShadow: "none", animation: hero.visible ? "gentleFloat 6s ease-in-out infinite" : "none" }}>
                <img src={product.img} alt={product.fullName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-3xl" style={{ background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: hero.visible ? 1 : 0, transition: "opacity 0.8s ease 1s" }}>
            <span className="text-[10px] sm:text-[11px] text-[#94a3b8] tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border-2 border-[#e2e8f0] rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-[scrollBounce_1.5s_infinite]" />
          </div>
        </div>
      </section>

      {/* Kit Contents */}
      <section id="kit-contents" className="relative bg-transparent py-10 md:py-16 overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ backgroundColor: `${accent}05` }} />
        </div>
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
          <div ref={kitContents.ref} className="text-center mb-8" style={{ opacity: kitContents.visible ? 1 : 0, transform: `translateY(${kitContents.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>What&apos;s Inside</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">Kit <span style={{ color: accent }}>Contents</span></h2>
            <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">Every kit contains precision-formulated components for optimal regenerative results.</p>
          </div>
          <div className="space-y-5 max-w-3xl mx-auto">
            {product.kitContent.map((item, i) => (
              <KitCard key={i} item={item} index={i} visible={kitContents.visible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* Peptides */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{ backgroundColor: `${accent}05` }} />
        </div>
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
          <div ref={peptidesSection.ref} className="text-center mb-8" style={{ opacity: peptidesSection.visible ? 1 : 0, transform: `translateY(${peptidesSection.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Scientific Formulation</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">Powered by <span style={{ color: accent }}>Peptides</span></h2>
            <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">{product.peptides.length} bioactive peptides work synergistically to deliver targeted regenerative signals.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {product.peptides.map((peptide, i) => (
              <PeptideCard key={i} peptide={peptide} index={i} visible={peptidesSection.visible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl" style={{ backgroundColor: `${accent}05` }} />
        </div>
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
          <div ref={benefitsSection.ref} className="text-center mb-8" style={{ opacity: benefitsSection.visible ? 1 : 0, transform: `translateY(${benefitsSection.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Clinical Outcomes</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">Key <span style={{ color: accent }}>Benefits</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {product.benefits.map((benefit, i) => (
              <BenefitCard key={i} benefit={benefit} index={i} visible={benefitsSection.visible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
          <div ref={idealFor.ref} className="text-center mb-8" style={{ opacity: idealFor.visible ? 1 : 0, transform: `translateY(${idealFor.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Who It&apos;s For</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">Ideal <span style={{ color: accent }}>For</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {(product.idealFor || []).map((item, i) => (
              <IdealForCard key={i} item={item} index={i} visible={idealFor.visible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 z-10">
          <div ref={howToUse.ref} className="text-center mb-8" style={{ opacity: howToUse.visible ? 1 : 0, transform: `translateY(${howToUse.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Application Guide</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">How to <span style={{ color: accent }}>Use</span></h2>
          </div>
          <div className="space-y-5 md:space-y-6">
            {(product.howToUse || []).map((step, i) => (
              <HowToUseStep key={i} step={step} index={i} visible={howToUse.visible} accent={accent} />
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      {product.caseStudies && product.caseStudies.length > 0 && (
        <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[120px]" style={{ backgroundColor: `${accent}04` }} />
          </div>
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 z-10 relative">
            <div ref={caseStudies.ref} className="text-center mb-8" style={{ opacity: caseStudies.visible ? 1 : 0, transform: `translateY(${caseStudies.visible ? 0 : 50}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full inline-block mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Real Results</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">Before & <span style={{ color: accent }}>After</span></h2>
              <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">Documented clinical outcomes from real patients.</p>
            </div>

            <div className="space-y-8">
              {product.caseStudies.map((cs, i) => (
                <div
                  key={i}
                  style={{
                    opacity: caseStudies.visible ? 1 : 0,
                    transform: caseStudies.visible ? "translateY(0)" : "translateY(30px)",
                    transition: `opacity 0.8s ease ${i * 0.2}s, transform 0.8s ease ${i * 0.2}s`,
                  }}
                >
                  <BeforeAfterSlider
                    beforeImage={cs.beforeImage}
                    afterImage={cs.afterImage}
                  />
                  <div className="mt-6 max-w-2xl mx-auto text-center px-4">
                    <h4 className="text-lg font-bold text-[#0f172a] mb-1">{cs.name}</h4>
                    <p className="text-xs text-[#94a3b8] mb-2">{cs.gender}, Age {cs.age} — {cs.concern}</p>
                    <p className="text-sm text-[#334155] mb-3">{cs.results}</p>
                    <div className="relative pl-3 border-l-2 inline-block text-left" style={{ borderColor: `${accent}30` }}>
                      <p className="text-sm text-[#334155] italic">&ldquo;{cs.feedback}&rdquo;</p>
                    </div>
                    <p className="text-xs font-semibold mt-2" style={{ color: accent }}>{cs.sessions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Important Note */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 z-10">
          <div ref={importantNote.ref} style={{ opacity: importantNote.visible ? 1 : 0, transform: `translateY(${importantNote.visible ? 0 : 40}px)`, transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="glass-card p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 left-8 right-8 h-[2px]" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}10` }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">Important Note</h3>
                  <p className="text-sm text-[#334155] leading-relaxed">{product.importantNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-transparent py-10 md:py-16 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 z-10 relative">
          <div ref={bottomCta.ref} style={{ opacity: bottomCta.visible ? 1 : 0, transform: `translateY(${bottomCta.visible ? 0 : 60}px) scale(${bottomCta.visible ? 1 : 0.9})`, transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="glass-surface p-6 sm:p-8 md:p-10 lg:p-14 text-center overflow-hidden">
              <div className="absolute top-0 left-8 right-8 h-[2px]" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accent}40, transparent)` }} />
              <span className="inline-block text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full mb-3" style={{ color: accent, backgroundColor: `${accent}08` }}>Get Started</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0f172a] mb-2 leading-tight">Ready to Get <span style={{ color: accent }}>Started</span>?</h2>
              <p className="text-[#334155] text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-5">Contact us to learn more or place an order.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 md:px-8 py-3.5 rounded-full transition-all duration-300" style={{ backgroundColor: accent }}>
                  Contact Us
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/products" className="inline-flex items-center gap-2 border border-[#e2e8f0] text-[#334155] text-sm font-semibold px-6 md:px-8 py-3.5 rounded-full hover:border-[#cbd5e1] transition-all duration-300">
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

// ─── Sub Components ──────────────────────────────────────────

function KitCard({ item, index, visible, accent }: { item: string; index: number; visible: boolean; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative rounded-2xl overflow-hidden cursor-default glass-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(60px)",
      transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.1}s`,
    }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500" style={{ backgroundColor: `${accent}10`, transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
              {index === 0 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-1">Vial {index + 1}</h4>
            <p className="text-[13px] text-[#334155] leading-relaxed">{item}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PeptideCard({ peptide, index, visible, accent }: { peptide: { name: string; function: string }; index: number; visible: boolean; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative rounded-xl overflow-hidden glass-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 50}px) scale(${visible ? 1 : 0.92})`,
      transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.05 + index * 0.05}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.05 + index * 0.05}s`,
    }}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500" style={{ backgroundColor: `${accent}10`, transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-1 leading-snug">{peptide.name}</h4>
            <p className="text-[11px] sm:text-[12px] text-[#94a3b8] leading-relaxed">{peptide.function}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitCard({ benefit, index, visible, accent }: { benefit: string; index: number; visible: boolean; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative rounded-xl overflow-hidden glass-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 50}px) scale(${visible ? 1 : 0.92})`,
      transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.06}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.06}s`,
    }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500" style={{ backgroundColor: `${accent}15`, transform: hovered ? "scale(1.2)" : "scale(1)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[13px] text-[#334155] leading-relaxed font-medium">{benefit}</p>
        </div>
      </div>
    </div>
  )
}

function IdealForCard({ item, index, visible, accent }: { item: string; index: number; visible: boolean; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative rounded-xl overflow-hidden glass-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : `translateX(${index % 2 === 0 ? -60 : 60}px)`,
      transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.08}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.08 + index * 0.08}s`,
    }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500" style={{ backgroundColor: `${accent}10`, transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#334155] leading-relaxed font-medium">{item}</p>
        </div>
      </div>
    </div>
  )
}

function HowToUseStep({ step, index, visible, accent }: { step: string; index: number; visible: boolean; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="group relative rounded-xl overflow-hidden glass-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-60px)",
      transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + index * 0.1}s`,
    }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500" style={{ backgroundColor: `${accent}10`, transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)" }}>
            <span className="text-sm font-bold" style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>Step {index + 1}</p>
            <p className="text-[14px] text-[#334155] leading-relaxed">{step}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
