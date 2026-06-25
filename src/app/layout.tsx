import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import BackgroundMembrane from "@/components/BackgroundMembrane"
import LenisProvider from "@/components/LenisProvider"
import { LoadingProvider } from "@/components/LoadingContext"
import LoadingScreen from "@/components/LoadingScreen"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "EverCeutical | Where Science Meets Cellular Innovation",
  description:
    "Advanced exosome biotechnology engineered for regenerative medicine, aesthetic dermatology, and cellular optimization.",
  icons: {
    icon: [
      { url: "images/logo.png", type: "image/png" },
    ],
    shortcut: "images/logo.png",
    apple: [
      { url: "images/logo.png", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body className={`${inter.className} antialiased`} style={{ background: "#ffffff" }}>
        <LoadingProvider>
          <LoadingScreen />
          <LenisProvider>
            <BackgroundMembrane />
            <div className="relative" style={{ zIndex: 10 }}>
              {children}
            </div>
          </LenisProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
