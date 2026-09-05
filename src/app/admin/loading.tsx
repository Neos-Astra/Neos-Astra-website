export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between py-4 border-b border-[#1D2436]">
          <div className="h-6 w-48 bg-[#1D2436] rounded-md"></div>
          <div className="h-8 w-24 bg-[#1D2436] rounded-full"></div>
        </div>

        {/* Header skeleton */}
        <div className="space-y-2 pt-4">
          <div className="h-8 w-64 bg-[#1D2436] rounded-lg"></div>
          <div className="h-4 w-96 bg-[#1D2436]/60 rounded"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[#1D2436] bg-[#0F1420] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-[#1D2436] rounded"></div>
                <div className="h-8 w-8 bg-[#1D2436] rounded-lg"></div>
              </div>
              <div className="h-8 w-20 bg-[#1D2436] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
