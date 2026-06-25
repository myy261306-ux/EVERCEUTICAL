"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { products, ProductCategory } from "@/data/siteData"

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

interface CategoryInfo {
  name: ProductCategory
  label: string
  description: string
  color: string
  icon: string
}

const categories: CategoryInfo[] = [
  {
    name: "EXOGENESIS",
    label: "EXOGENESIS",
    description: "Scalp & Vital exosome treatments with advanced peptide formulas",
    color: "#0ea5e9",
    icon: "🧬",
  },
  {
    name: "WHARTEXA",
    label: "WHARTEXA",
    description: "High-concentration exosome formulations for maximum impact",
    color: "#0284c7",
    icon: "⚡",
  },
  {
    name: "HYALIQUE-X",
    label: "HYALIQUE-X",
    description: "Dermal fillers, boosters & skin rejuvenation systems",
    color: "#0369a1",
    icon: "✨",
  },
]

export default function CategoryPreview() {
  const headerInView = useInView(0.2)

  const getCategoryCount = (category: ProductCategory) => {
    return products.filter((p) => p.category === category).length
  }

  return (
    <section className="relative py-8 md:py-16 px-5 sm:px-6 bg-transparent">

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerInView.ref}
          className="text-center mb-8"
          style={{
            opacity: headerInView.visible ? 1 : 0,
            transform: headerInView.visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span className="text-[10px] text-[#38bdf8] font-bold tracking-[0.25em] uppercase bg-[#38bdf8]/[0.08] px-4 py-1.5 rounded-full inline-block">
            Browse by Category
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mt-3 mb-2 leading-tight">
            Our <span className="text-[#38bdf8]">Product Lines</span>
          </h2>
          <p className="text-[#334155] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Explore our range of specialized exosome formulations tailored for different therapeutic needs.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/products?category=${category.name}`}
              className="group block"
              style={{
                opacity: headerInView.visible ? 1 : 0,
                transform: headerInView.visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${0.08 + index * 0.06}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${0.08 + index * 0.06}s`,
              }}
            >
              <div className="relative glass-card rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 text-center">
                {/* Icon */}
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: category.color + "12" }}
                >
                  {category.icon}
                </div>

                {/* Category Name */}
                <h3
                  className="text-lg font-bold mb-2 transition-colors"
                  style={{ color: category.color }}
                >
                  {category.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
                  {category.description}
                </p>

                {/* Product Count */}
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: category.color + "12", color: category.color }}
                  >
                    {getCategoryCount(category.name)} Products
                  </span>
                </div>

                {/* Hover Arrow */}
                <div
                  className="absolute bottom-6 right-6 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                  style={{ background: category.color + "12" }}
                >
                  <svg className="w-4 h-4" style={{ color: category.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
