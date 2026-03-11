import { motion } from 'motion/react';
import { ShieldCheck, Clock, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-midnight">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-midnight/80 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=3000&auto=format&fit=crop" 
          alt="Master Plumber Working" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 z-10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal font-mono text-xs font-bold mb-6 tracking-wide"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            SERVING GREATER AUSTIN, TX
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 text-balance"
          >
            Austin's Plumbing Emergencies, Solved in 60 Minutes. <span className="text-teal">Or the Call is Free.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans text-lg md:text-xl text-steel mb-10 max-w-2xl leading-relaxed"
          >
            Master plumbing for your home and business. Upfront flat-rate pricing, 2-year warranties, and 22 years of Texas trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a href="tel:5125550199" className="bg-copper hover:bg-copper/90 text-white px-8 py-4 rounded-sm font-sans font-bold text-lg transition-all shadow-[6px_6px_0px_rgba(0,229,255,0.15)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,229,255,0.15)] flex items-center justify-center gap-2">
              Call (512) 555-0199 Now
            </a>
            <a href="#contact" className="bg-transparent border-2 border-teal text-white hover:bg-teal/10 px-8 py-4 rounded-sm font-sans font-bold text-lg transition-colors flex items-center justify-center">
              Book Non-Emergency Service
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center gap-6 md:gap-10 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm inline-flex"
          >
            <div className="flex items-center gap-3">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-gold text-gold" />)}
              </div>
              <span className="text-white font-sans font-semibold text-sm">4.9/5 Average</span>
            </div>
            <div className="w-px h-8 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2 text-white font-sans font-semibold text-sm">
              <ShieldCheck size={20} className="text-teal" />
              22 Years Experience
            </div>
            <div className="w-px h-8 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2 text-white font-sans font-semibold text-sm">
              <Clock size={20} className="text-teal" />
              60-Min Response
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
