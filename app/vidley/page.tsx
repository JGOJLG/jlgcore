export default function VidleyTools(){
  return <main className="min-h-screen bg-[#f5f1e9] px-5 py-10 text-[#26322c]">
    <div className="mx-auto max-w-3xl">
      <a href="/" className="text-sm underline">← JLG Core</a>
      <section className="mt-6 rounded-[30px] border border-[#c7d9dc] bg-[#dce8ea] p-7 sm:p-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#6f7f82]">VIDLEY DIGITAL</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.055em]">Vidley Tools</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#5d6b6e]">Quick access to the Vidley website and private business tools.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a href="https://vidleydigital.com" target="_blank" rel="noreferrer" className="rounded-[20px] border border-black/10 bg-white/65 p-5 hover:bg-white"><p className="text-[10px] uppercase tracking-[0.2em] text-[#7c8881]">Website</p><h2 className="mt-2 text-xl font-semibold">Vidley Digital</h2><p className="mt-2 text-xs text-[#6f7974]">vidleydigital.com ↗</p></a>
          <a href="https://jlg-collective-git-main-jgohire.vercel.app/vidley/coupons" target="_blank" rel="noreferrer" className="rounded-[20px] border border-black/10 bg-white/65 p-5 hover:bg-white"><p className="text-[10px] uppercase tracking-[0.2em] text-[#7c8881]">Private Tool</p><h2 className="mt-2 text-xl font-semibold">Coupon Manager</h2><p className="mt-2 text-xs text-[#6f7974]">Create, pause and delete Vidley coupon codes ↗</p></a>
        </div>
      </section>
    </div>
  </main>
}
