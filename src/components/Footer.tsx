export default function Footer() {
  return (
    <footer className="bg-navy py-12 border-t border-white/10 text-center">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-serif text-2xl text-white mb-2">OBAMA <span className="text-gold">44</span></h2>
        <p className="font-sans text-offwhite/50 text-sm mb-8">A digital tribute to the 44th President of the United States.</p>
        
        <div className="inline-block border border-white/20 rounded-full px-6 py-2 text-xs uppercase tracking-widest text-offwhite/70 hover:bg-white/5 transition-colors cursor-pointer">
          Designed & Engineered by Portfolio Builder
        </div>
      </div>
    </footer>
  );
}
