"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

import { blogPosts, type BlogPost } from "@/data/scrapedData"

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
      className="absolute rounded-full bg-[#38bdf8]/10 pointer-events-none"
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

const categories = ["All", "Research", "Science", "Technology", "Clinical"]

const categoryColors: Record<string, string> = {
  Research: "#38bdf8",
  Science: "#0ea5e9",
  Technology: "#0284c7",
  Clinical: "#0369a1",
}

const whyReadCards = [
  {
    title: "Evidence-Based Insights",
    desc: "Every article is backed by peer-reviewed research and clinical data from Vesco Science's laboratory findings.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    color: "#38bdf8",
  },
  {
    title: "Clinical Applications",
    desc: "Learn how exosome therapies are being applied in real clinical settings for skin rejuvenation and hair restoration.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    color: "#0ea5e9",
  },
  {
    title: "Industry Firsts",
    desc: "Stay ahead with coverage of breakthroughs in exosome counting, lyophilization, and next-gen formulations.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: "#0284c7",
  },
]

const categoryDetails: Record<string, { icon: React.ReactNode; desc: string; count: number }> = {
  Research: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    desc: "Deep dives into exosome isolation, purification, and clinical trial results.",
    count: 2,
  },
  Science: {
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2" />
        <path d="M8.5 2h7" />
        <path d="M7 16h10" />
      </svg>
    ),
    desc: "Understanding the biology behind HUC-MSCs and pneumofibroblast exosomes.",
    count: 2,
  },
  Technology: {
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    desc: "How exosome concentrations are measured and formulated for clinical use.",
    count: 2,
  },
  Clinical: {
    icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    desc: "Real-world results, patient outcomes, and therapy comparisons.",
    count: 1,
  },
}

function BlogCard({ post, index, visible }: { post: BlogPost; index: number; visible: boolean }) {
  const tiltRef = useMouseTilt()

  return (
    <div
      ref={tiltRef}
      className="glass-card group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : `translateY(60px) scale(0.92)`,
        transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + index * 0.14}s`,
      }}
    >
      <Link href={`/blogs/${post.slug}`} className="block">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${categoryColors[post.category] || "#38bdf8"}22, ${categoryColors[post.category] || "#38bdf8"}44)`,
              }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={categoryColors[post.category] || "#38bdf8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Date badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-white text-[11px] sm:text-xs font-semibold tracking-wide"
            style={{
              background: "rgba(12,25,41,0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            {post.date}
          </div>
          {/* Category pill */}
          <div
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase"
            style={{
              background: `${categoryColors[post.category] || "#38bdf8"}22`,
              color: categoryColors[post.category] || "#38bdf8",
              backdropFilter: "blur(8px)",
              border: `1px solid ${categoryColors[post.category] || "#38bdf8"}33`,
            }}
          >
            {post.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(107,114,128,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs text-[#64748b] font-medium">{post.readTime}</span>
          </div>
          <h3 className="text-lg font-bold text-[#0f172a] mb-3 leading-snug line-clamp-2 group-hover:text-[#38bdf8] transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-sm text-[#64748b] leading-relaxed line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center text-[#38bdf8] text-sm font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
            Read More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: "none",
        }}
      />
    </div>
  )
}

function FeaturedCard({ post, visible }: { post: BlogPost; visible: boolean }) {
  return (
    <div
      className="glass-card relative rounded-3xl overflow-hidden group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) perspective(1000px) rotateY(0deg)" : "translateX(-80px) perspective(1000px) rotateY(8deg)",
        transition: "opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <Link href={`/blogs/${post.slug}`} className="flex flex-col lg:flex-row">
        {/* Image side */}
        <div className="relative lg:w-[55%] h-60 md:h-72 lg:h-[420px] overflow-hidden">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${categoryColors[post.category] || "#38bdf8"}22, ${categoryColors[post.category] || "#38bdf8"}44)`,
              }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={categoryColors[post.category] || "#38bdf8"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 lg:block hidden" />
          {/* Featured badge */}
          <div className="absolute top-5 left-5 px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-white"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}>
            Latest Research
          </div>
        </div>

        {/* Content side */}
        <div className="lg:w-[45%] p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase"
              style={{
                background: `${categoryColors[post.category] || "#38bdf8"}15`,
                color: categoryColors[post.category] || "#38bdf8",
              }}
            >
              {post.category}
            </span>
            <span className="text-xs text-[#64748b]">{post.date}</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0f172a] mb-4 leading-tight group-hover:text-[#38bdf8] transition-colors duration-300">
            {post.title}
          </h2>
          <p className="text-[#64748b] text-sm leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center text-[#38bdf8] text-sm font-semibold gap-2 group-hover:gap-3 transition-all duration-300">
              Read Full Article
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b] text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {post.readTime}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function BlogsPage() {
  const hero = useInView(0.1, "0px")
  const whyRead = useInView(0.2)
  const featured = useInView(0.2)
  const categoriesSection = useInView(0.2)
  const gridHeader = useInView(0.3)
  const grid = useInView(0.1)
  const newsletter = useInView(0.3)
  const stats = useInView(0.3)
  const cta = useInView(0.3)

  const [activeCategory, setActiveCategory] = useState("All")
  const [email, setEmail] = useState("")

  const featuredPost = blogPosts[0]
  const filteredPosts = activeCategory === "All"
    ? blogPosts.slice(1)
    : blogPosts.filter((p) => p.category === activeCategory && p.id !== featuredPost.id)

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-transparent overflow-x-hidden">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[#38bdf8]/[0.04] blur-3xl" />
            <div className="absolute bottom-10 right-[15%] w-60 h-60 rounded-full bg-[#0ea5e9]/[0.03] blur-3xl" />
            {[...Array(8)].map((_, i) => (
              <FloatingParticle key={i} delay={i * 1.5} x={10 + i * 11} size={6 + (i % 3) * 4} />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div ref={hero.ref}>
              <div style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 30}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
                <span className="text-xs text-[#38bdf8] font-semibold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-5 py-2 rounded-full border border-[#0ea5e9]/10 inline-block mb-3">
                  EverCeutical Insights
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#0f172a] leading-tight mb-4"
                style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 40}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s" }}>
                News <span className="text-[#38bdf8]">&amp;</span> <br className="hidden sm:block" />Research Blog
              </h1>
              <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-7"
                style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 25}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.5s" }}>
                Stay updated with the latest breakthroughs in exosome therapy, clinical research, and regenerative medicine from the EverCeutical team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
                style={{ opacity: hero.visible ? 1 : 0, transform: `translateY(${hero.visible ? 0 : 20}px)`, transition: "opacity 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s, transform 1.2s cubic-bezier(0.22,1,0.36,1) 0.7s" }}>
                <a href="#articles" className="px-8 py-3.5 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300 hover:scale-105">
                  Browse Articles
                </a>
                <Link href="/research-technology" className="px-8 py-3.5 rounded-full border border-[#38bdf8]/20 text-[#38bdf8] text-sm font-semibold hover:bg-[#0ea5e9] hover:text-white transition-all duration-300 hover:scale-105">
                  Research &amp; Technology
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ WHY READ OUR BLOG ═══════════ */}
        <section className="relative py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-6">
            <div ref={whyRead.ref}>
              <div className="text-center mb-7"
                style={{ opacity: whyRead.visible ? 1 : 0, transform: `translateY(${whyRead.visible ? 0 : 40}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
                <span className="inline-block text-[10px] sm:text-[11px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full mb-3">
                  Why EverCeutical
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">
                  Why Read <span className="text-[#38bdf8]">Our Blog</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {whyReadCards.map((card, i) => (
                  <div
                    key={card.title}
                    className="glass-card group relative rounded-2xl p-7 text-center"
                    style={{
                      opacity: whyRead.visible ? 1 : 0,
                      transform: `translateY(${whyRead.visible ? 0 : 50}px) scale(${whyRead.visible ? 1 : 0.92})`,
                      transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.15}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.15}s`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: `${card.color}10`,
                        border: `1px solid ${card.color}20`,
                      }}
                    >
                      {card.icon}
                    </div>
                    <h3 className="text-base font-bold text-[#0f172a] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">
                      {card.desc}
                    </p>
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: "none",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURED POST ═══════════ */}
        <section className="relative py-5 md:py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div ref={featured.ref}>
              <FeaturedCard post={featuredPost} visible={featured.visible} />
            </div>
          </div>
        </section>

        {/* ═══════════ CATEGORIES OVERVIEW ═══════════ */}
        <section className="relative py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div ref={categoriesSection.ref}>
              <div className="text-center mb-7"
                style={{ opacity: categoriesSection.visible ? 1 : 0, transform: `translateY(${categoriesSection.visible ? 0 : 40}px)`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
                <span className="inline-block text-[10px] sm:text-[11px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full mb-3">
                  Browse Topics
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">
                  Explore by <span className="text-[#38bdf8]">Category</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryDetails).map(([name, info], i) => (
                  <button
                    key={name}
                    onClick={() => {
                      setActiveCategory(name)
                      document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="glass-card group relative rounded-2xl p-5 md:p-6 text-left cursor-pointer"
                    style={{
                      border: `1px solid ${categoryColors[name]}15`,
                      opacity: categoriesSection.visible ? 1 : 0,
                      transform: `translateY(${categoriesSection.visible ? 0 : 40}px) scale(${categoriesSection.visible ? 1 : 0.92})`,
                      transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.12}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.12}s`,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                      style={{
                        background: `${categoryColors[name]}10`,
                        border: `1px solid ${categoryColors[name]}20`,
                      }}
                    >
                      {info.icon}
                    </div>

                    {/* Count */}
                    <div
                      className="text-2xl font-bold mb-1 transition-colors duration-300"
                      style={{ color: categoryColors[name] }}
                    >
                      {info.count}
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-[#0f172a] mb-1.5">
                      {name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                      {info.desc}
                    </p>

                    {/* Hover arrow */}
                    <div
                      className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                      style={{
                        background: `${categoryColors[name]}10`,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={categoryColors[name]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>

                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: "none",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BLOG GRID ═══════════ */}
        <section id="articles" className="relative py-10 md:py-16">
          <div className="max-w-6xl mx-auto px-6">

            {/* Section header + filters */}
            <div ref={gridHeader.ref} className="text-center mb-8"
              style={{ opacity: gridHeader.visible ? 1 : 0, transform: `translateY(${gridHeader.visible ? 0 : 50}px) scale(${gridHeader.visible ? 1 : 0.9})`, transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)" }}>
              <span className="inline-block text-[10px] sm:text-[11px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full mb-3">
                All Articles
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
                Explore Our <span className="text-[#38bdf8]">Research</span>
              </h2>

              {/* Category filters */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
                    style={{
                      background: activeCategory === cat
                        ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                        : "rgba(241,245,249,1)",
                      color: activeCategory === cat ? "#ffffff" : "#64748b",
                      border: activeCategory === cat
                        ? "1px solid transparent"
                        : "1px solid rgba(229,231,235,1)",
                      boxShadow: "none",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div ref={grid.ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} visible={grid.visible} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 text-[#64748b] text-sm">
                No articles found in this category.
              </div>
            )}
          </div>
        </section>

        {/* ═══════════ NEWSLETTER ═══════════ */}
        <section className="relative py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-6">
            <div ref={newsletter.ref}
              className="relative rounded-3xl p-7 md:p-10 lg:p-14 text-center overflow-hidden bg-[#f8fafc] border border-[#e2e8f0]"
              style={{
                opacity: newsletter.visible ? 1 : 0,
                transform: `translateY(${newsletter.visible ? 0 : 40}px) scale(${newsletter.visible ? 1 : 0.95})`,
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)",
              }}>
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#0ea5e9]/[0.05] blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#0ea5e9]/[0.04] blur-2xl" />

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
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

        {/* ═══════════ STATS BAR ═══════════ */}
        <section className="relative py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-6">
            <div ref={stats.ref}
              className="relative rounded-3xl overflow-hidden bg-[#f8fafc] border border-[#e2e8f0]"
              style={{
                opacity: stats.visible ? 1 : 0,
                transform: `translateY(${stats.visible ? 0 : 40}px) scale(${stats.visible ? 1 : 0.95})`,
                transition: "opacity 1.3s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)",
              }}>
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { value: "7+", label: "Published Articles", color: "#38bdf8" },
                  { value: "4", label: "Research Categories", color: "#0ea5e9" },
                  { value: "10B+", label: "Exosomes Studied", color: "#0284c7" },
                  { value: "99.9%", label: "Purity Standard", color: "#0369a1" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="relative p-6 md:p-8 text-center"
                    style={{
                      opacity: stats.visible ? 1 : 0,
                      transform: `translateY(${stats.visible ? 0 : 20}px)`,
                      transition: `opacity 1s ease ${0.3 + i * 0.12}s, transform 1s ease ${0.3 + i * 0.12}s`,
                    }}
                  >
                    {/* Divider (not on first) */}
                    {i > 0 && (
                      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-[#e2e8f0]" />
                    )}
                    <div
                      className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-[#64748b] font-medium tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BOTTOM CTA ═══════════ */}
        <section className="relative py-10 md:py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div ref={cta.ref} style={{ opacity: cta.visible ? 1 : 0, transform: `translateY(${cta.visible ? 0 : 60}px) scale(${cta.visible ? 1 : 0.9})`, transition: "opacity 1.5s cubic-bezier(0.22,1,0.36,1), transform 1.5s cubic-bezier(0.22,1,0.36,1)" }}>
              <div className="relative rounded-3xl p-5 md:p-8 lg:p-12 xl:p-16 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                }}>
                {/* Decorative elements */}
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
                  <span className="inline-block text-[10px] text-white/60 font-bold tracking-[0.25em] uppercase bg-white/[0.08] px-4 py-1.5 rounded-full mb-3">
                    Explore Products
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    Ready to Experience <span className="text-[#38bdf8]">Advanced</span> Exosomes?
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-5">
                    Discover our range of advanced exosome formulations designed for professional clinical use in regenerative medicine.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/products" className="px-8 py-3.5 rounded-full bg-[#0ea5e9] text-white text-sm font-bold hover:bg-[#0284c7] transition-all duration-300 hover:scale-105">
                      View Products
                    </Link>
                    <Link href="/contact" className="px-8 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      Contact Us
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
