"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { products, productCategories } from "@/data/siteData"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"

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

const stats = [
  { value: "10B+", label: "Exosome Particles" },
  { value: "99.9%", label: "Purity Standard" },
  { value: "100+", label: "Bioactive Molecules" },
  { value: "10-150nm", label: "Nanoscale Vesicles" },
]

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const heroRef = useInView(0.1)
  const statsRef = useInView(0.1)
  const gridRef = useInView(0.05)
  const ctaRef = useInView(0.1)

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section
        ref={heroRef.ref}
        className="relative pt-24 pb-10 md:pt-32 md:pb-16 px-5 sm:px-6 bg-transparent"
      >
        <div className="max-w-7xl mx-auto text-center">
          <div
            style={{
              opacity: heroRef.visible ? 1 : 0,
              transform: heroRef.visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <span className="text-[10px] sm:text-[11px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#0ea5e9]/[0.08] px-4 py-1.5 rounded-full inline-block">
              Our Products
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
              Advanced Exosome <span className="text-[#38bdf8]">Solutions</span>
            </h1>
            <p className="text-[#334155] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Explore our complete range of clinically engineered exosome formulations designed for targeted regenerative and aesthetic applications.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section ref={statsRef.ref} className="py-6 sm:py-8 px-5 sm:px-6 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center"
                style={{
                  opacity: statsRef.visible ? 1 : 0,
                  transform: statsRef.visible ? "translateY(0)" : "translateY(15px)",
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}
              >
                <div className="text-xl md:text-2xl font-bold text-[#38bdf8]">{stat.value}</div>
                <div className="text-[11px] sm:text-xs text-[#64748b] font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Products Grid */}
      <section ref={gridRef.ref} className="py-8 md:py-12 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter Tabs */}
          <div
            className="mb-7"
            style={{
              opacity: gridRef.visible ? 1 : 0,
              transform: gridRef.visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#0f172a]">
                All Products
                <span className="text-sm font-normal text-[#64748b] ml-2">({filteredProducts.length})</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {productCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                    activeCategory === cat.value
                      ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                      : "bg-[#f8fafc] text-[#334155] border-[#e2e8f0] hover:border-[#38bdf8]/30 hover:text-[#38bdf8]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                style={{
                  opacity: gridRef.visible ? 1 : 0,
                  transform: gridRef.visible ? "translateY(0) scale(1)" : "translateY(25px) scale(0.97)",
                  transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${0.05 + (index % 4) * 0.07}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.05 + (index % 4) * 0.07}s`,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#94a3b8] text-sm">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef.ref} className="py-10 px-5 sm:px-6 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div
          className="max-w-4xl mx-auto text-center"
          style={{
            opacity: ctaRef.visible ? 1 : 0,
            transform: ctaRef.visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
            Need Help Choosing?
          </h2>
          <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto mb-6">
            Our team of experts is ready to help you find the right exosome formulation for your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-all duration-300"
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#334155] text-sm font-semibold hover:border-[#38bdf8]/30 hover:text-[#38bdf8] transition-all duration-300"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
