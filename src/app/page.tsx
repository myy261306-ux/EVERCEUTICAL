import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import WhatAreExosomesSection from "@/components/WhatAreExosomesSection"
import FeaturedProducts from "@/components/FeaturedProducts"
import CategoryPreview from "@/components/CategoryPreview"
import ExosomeClassesSection from "@/components/ExosomeClassesSection"
import BenefitsSection from "@/components/BenefitsSection"
import FAQSection from "@/components/FAQSection"
import BehindTheScienceSection from "@/components/BehindTheScienceSection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <div className="h-4 md:h-6" />
        <WhatAreExosomesSection />
        <div className="h-6 md:h-8" />
        <FeaturedProducts />
        <div className="h-6 md:h-8" />
        <CategoryPreview />
        <div className="h-4 md:h-6" />
        <ExosomeClassesSection />
        <div className="h-4 md:h-6" />
        <BenefitsSection />
        <div className="h-4 md:h-6" />
        <FAQSection />
        <div className="h-4 md:h-6" />
        <BehindTheScienceSection />
        <Footer />
      </main>
    </>
  )
}
