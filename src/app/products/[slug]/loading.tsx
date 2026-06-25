export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#f0f4f7]">
      {/* Hero skeleton */}
      <div className="min-h-[100vh] flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="h-6 w-28 bg-[#e2e8f0] rounded-full animate-pulse" />
              <div className="h-12 w-3/4 bg-[#e2e8f0] rounded-xl animate-pulse" />
              <div className="h-5 w-1/2 bg-[#e2e8f0] rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-[#e2e8f0] rounded-lg animate-pulse" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-36 bg-[#e2e8f0] rounded-full animate-pulse" />
                <div className="h-12 w-36 bg-[#e2e8f0] rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[280px] md:max-w-[360px] lg:max-w-[420px] h-[280px] md:h-[360px] lg:h-[420px] bg-[#e2e8f0] rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
