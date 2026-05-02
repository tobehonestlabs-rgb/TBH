export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center"
      style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif" }}>
      <div className="text-[40px] font-black tracking-tight text-[#0D0D0D] mb-4">TBH</div>
      <h1 className="text-[22px] font-extrabold text-[#0D0D0D] mb-2">You're offline</h1>
      <p className="text-[15px] text-[#888] leading-relaxed mb-8">Check your connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-4 bg-[#0D0D0D] text-white font-bold text-[16px] rounded-[28px] active:scale-95 transition-transform"
      >
        Retry
      </button>
    </main>
  )
}
