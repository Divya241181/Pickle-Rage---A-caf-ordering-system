export default function HeroHeader({ tableNumber, type }) {
  return (
    <>
      <section className="relative h-[397px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPh8E7cagkbcYypONTOlfdrChtpHJBkKS6NGQiCY36a6gi_rZehaf-OexpdNl1oPmy1DtovfTJm7Pu2qXRkIgPzqMcVmVzybJ2zSVY3LjA4fuW5bZi5YVsYfda9mgiJ1upe0t8Ctfgknoh24fpEG_Mi01JIBxvc2cbrtBQRJT2E63ZTxrLoJ9L1k9XlE5Bs6zC_tOoAgRm5EURwLrOgw4C5VGdtIBRhtpmsMivebdWg8so-9bmXEDFSwL9ylfEGPakoL38Ww7ZFRU')` }}></div>
        <div className="relative z-20 h-full flex flex-col justify-end px-container-margin pb-xl">
          <span className="inline-block bg-secondary-container text-on-secondary-container px-md py-xs rounded-full font-label-md text-label-md mb-sm w-max uppercase tracking-wider">
            {type === 'takeout' ? 'TAKEOUT' : 'DINE IN'}
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white mb-xs tracking-tight">Picklerage</h1>
          <p className="text-white/80 font-body-md text-body-md mb-md">123 Street, City</p>
          {tableNumber && (
            <div className="flex items-center gap-sm">
              <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-md py-sm rounded-full font-label-md text-label-md">Table-{tableNumber}</span>
            </div>
          )}
        </div>
      </section>
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-outline-variant/30 transform -translate-y-full transition-transform duration-300 px-container-margin py-sm hidden md:flex items-center justify-between" id="sticky-header">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md text-primary font-bold">Picklerage</span>
          {tableNumber && (
            <div className="flex items-center gap-xs bg-secondary-fixed text-on-secondary-fixed px-sm py-1 rounded-full text-label-sm">
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span className="">Table {tableNumber}</span>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
